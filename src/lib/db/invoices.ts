"use client";

/**
 * Invoices live at `invoices/{id}` with line items embedded as `items`.
 * Every write also refreshes `shared/{public_token}` (the public share-link copy)
 * in the same transaction/batch, so the two can never drift apart.
 */
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, setDoc, where, writeBatch } from "firebase/firestore";
import { getDocumentSettings, settingsToRow } from "@/lib/pdf/settings";
import {
  COLLECTIONS,
  clean,
  db,
  getAll,
  getOne,
  newId,
  nowIso,
  bumpCounterForCustomNumber,
  peekNextDocumentNumber,
  reserveDocumentNumber,
  runTransaction,
} from "./core";
import { buildSharedInvoice } from "./shared";
import type { Client, Invoice, InvoiceFile, LineItem } from "./types";

export type LineItemInput = Omit<LineItem, "id" | "sort_order"> & { id?: string; sort_order?: number };

export type InvoiceInput = {
  client_id: string;
  invoice_date: string;
  payment_method: string;
  notes?: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status?: string;
  sent_at?: string | null;
  paid_at?: string | null;
  client_signature?: string | null;
  share_enabled?: boolean;
  sent_from_company?: string | null;
  pdf_name?: string | null;
  pdf_size?: number | null;
  items: LineItemInput[];
};

const normalizeItems = (items: LineItemInput[]): LineItem[] =>
  items.map((it, i) => ({
    id: it.id ?? newId(),
    description: it.description,
    quantity: Number(it.quantity),
    rate: Number(it.rate),
    amount: Number(it.amount),
    sort_order: it.sort_order ?? i,
  }));

/** Newest first. Join client names with `indexById(await listClients())`. */
export const listInvoices = () => getAll<Invoice>(COLLECTIONS.invoices, "created_at", "desc");

export const getInvoice = (id: string) => getOne<Invoice>(COLLECTIONS.invoices, id);

/** The number a new invoice will most likely get (display only; the real one is reserved on save). */
export const previewNextInvoiceNumber = () => peekNextDocumentNumber("invoices");

/** Postgres had UNIQUE(invoice_number); call this before saving a custom number. */
export async function findInvoiceByNumber(invoice_number: string): Promise<Invoice | null> {
  const snap = await getDocs(query(collection(db(), COLLECTIONS.invoices), where("invoice_number", "==", invoice_number), limit(1)));
  const d = snap.docs[0];
  return d ? ({ id: d.id, ...(d.data() as Omit<Invoice, "id">) }) : null;
}

async function settingsSnapshot() {
  return settingsToRow(await getDocumentSettings());
}

async function requireClient(id: string): Promise<Client> {
  const client = await getOne<Client>(COLLECTIONS.clients, id);
  if (!client) throw new Error("Client not found");
  return client;
}

/**
 * Create an invoice. The INV-YYYYMM-NNN number is reserved inside the
 * transaction, so concurrent saves never collide and abandoned forms never
 * burn a number. Returns the stored invoice (with its final number).
 *
 * Pass `options.invoice_number` to keep a custom number (check it with
 * `findInvoiceByNumber` first); when it looks like INV-YYYYMM-NNN the monthly
 * counter is raised past it so auto-numbering never collides with it later.
 */
export async function createInvoice(input: InvoiceInput, options: { id?: string; invoice_number?: string } = {}): Promise<Invoice> {
  const client = await requireClient(input.client_id);
  const settings = await settingsSnapshot();
  const id = options.id ?? newId();
  const now = nowIso();

  return runTransaction(db(), async (tx) => {
    const invoice_number = options.invoice_number
      ? await bumpCounterForCustomNumber(tx, "invoices", options.invoice_number)
      : await reserveDocumentNumber(tx, "invoices");
    const invoice: Invoice = {
      id,
      invoice_number,
      client_id: input.client_id,
      invoice_date: input.invoice_date,
      payment_method: input.payment_method,
      notes: input.notes ?? null,
      subtotal: Number(input.subtotal),
      hst_rate: Number(input.hst_rate),
      hst_amount: Number(input.hst_amount),
      total: Number(input.total),
      status: input.status ?? "draft",
      sent_at: input.sent_at ?? null,
      paid_at: input.paid_at ?? null,
      created_at: now,
      updated_at: now,
      client_signature: input.client_signature ?? null,
      public_token: newId(),
      share_enabled: input.share_enabled ?? true,
      sent_from_company: input.sent_from_company ?? null,
      pdf_name: input.pdf_name ?? null,
      pdf_size: input.pdf_size ?? null,
      items: normalizeItems(input.items),
    };
    const { id: _id, ...data } = invoice; // eslint-disable-line @typescript-eslint/no-unused-vars
    tx.set(doc(db(), COLLECTIONS.invoices, id), clean(data));
    tx.set(doc(db(), COLLECTIONS.shared, invoice.public_token), clean(buildSharedInvoice(invoice, client, settings)));
    return invoice;
  });
}

/**
 * What `updateInvoice` accepts: any InvoiceInput field plus `invoice_number`,
 * which the edit form's "Custom" mode may change (check it with
 * `findInvoiceByNumber` first, as with createInvoice).
 */
export type InvoicePatch = Partial<InvoiceInput> & { invoice_number?: string };

/**
 * Partial update; `items` replaces the whole list. Refreshes the share copy.
 *
 * A changed `invoice_number` that looks like INV-YYYYMM-NNN raises that month's
 * counter past it (same rule as createInvoice), so a renamed invoice can never
 * collide with a later auto-generated number.
 */
export async function updateInvoice(id: string, patch: InvoicePatch): Promise<Invoice> {
  const existing = await getInvoice(id);
  if (!existing) throw new Error("Invoice not found");
  const merged: Invoice = {
    ...existing,
    ...clean(patch),
    items: patch.items ? normalizeItems(patch.items) : existing.items,
    updated_at: nowIso(),
  } as Invoice;
  const [client, settings] = await Promise.all([requireClient(merged.client_id), settingsSnapshot()]);
  const invoiceRef = doc(db(), COLLECTIONS.invoices, id);
  const sharedRef = doc(db(), COLLECTIONS.shared, merged.public_token);
  const numberChanged = typeof patch.invoice_number === "string" && patch.invoice_number !== existing.invoice_number;

  if (numberChanged) {
    return runTransaction(db(), async (tx) => {
      merged.invoice_number = await bumpCounterForCustomNumber(tx, "invoices", merged.invoice_number);
      const { id: _id, ...data } = merged; // eslint-disable-line @typescript-eslint/no-unused-vars
      tx.set(invoiceRef, clean(data));
      tx.set(sharedRef, clean(buildSharedInvoice(merged, client, settings)));
      return merged;
    });
  }

  const { id: _id, ...data } = merged; // eslint-disable-line @typescript-eslint/no-unused-vars
  const batch = writeBatch(db());
  batch.set(invoiceRef, clean(data));
  batch.set(sharedRef, clean(buildSharedInvoice(merged, client, settings)));
  await batch.commit();
  return merged;
}

export const setInvoiceStatus = (id: string, status: string, stamps: Partial<Pick<InvoiceInput, "sent_at" | "paid_at">> = {}) =>
  updateInvoice(id, { status, ...stamps });

export const setInvoiceShareEnabled = (id: string, share_enabled: boolean) => updateInvoice(id, { share_enabled });

/** Removes the invoice, its share copy and any uploaded PDF. */
export async function deleteInvoice(id: string): Promise<void> {
  const existing = await getInvoice(id);
  const batch = writeBatch(db());
  batch.delete(doc(db(), COLLECTIONS.invoices, id));
  if (existing?.public_token) batch.delete(doc(db(), COLLECTIONS.shared, existing.public_token));
  batch.delete(doc(db(), COLLECTIONS.invoiceFiles, id));
  await batch.commit();
}

// ---------- Uploaded third-party PDFs (invoiceFiles/{invoiceId}) ----------

export async function putInvoiceFile(invoiceId: string, file: { name: string; size: number; data: string }): Promise<void> {
  const record: Omit<InvoiceFile, "id"> = {
    name: file.name,
    size: file.size,
    content_type: "application/pdf",
    data: file.data,
    created_at: nowIso(),
  };
  await setDoc(doc(db(), COLLECTIONS.invoiceFiles, invoiceId), record);
}

export async function getInvoiceFile(invoiceId: string): Promise<InvoiceFile | null> {
  const snap = await getDoc(doc(db(), COLLECTIONS.invoiceFiles, invoiceId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<InvoiceFile, "id">) }) : null;
}

export const deleteInvoiceFile = (invoiceId: string) => deleteDoc(doc(db(), COLLECTIONS.invoiceFiles, invoiceId));
