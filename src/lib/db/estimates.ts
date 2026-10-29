"use client";

/**
 * Estimates live at `estimates/{id}` with line items embedded as `items`.
 * Every write also refreshes `shared/{public_token}` in the same
 * transaction/batch (see ./invoices.ts for the identical pattern).
 */
import { collection, doc, getDocs, limit, query, where, writeBatch } from "firebase/firestore";
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
import { buildSharedEstimate } from "./shared";
import type { LineItemInput } from "./invoices";
import type { Client, Estimate, LineItem } from "./types";

export type EstimateInput = {
  client_id: string;
  estimate_date: string;
  valid_until?: string | null;
  payment_method: string;
  notes?: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status?: string;
  sent_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  client_signature?: string | null;
  share_enabled?: boolean;
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
export const listEstimates = () => getAll<Estimate>(COLLECTIONS.estimates, "created_at", "desc");

export const getEstimate = (id: string) => getOne<Estimate>(COLLECTIONS.estimates, id);

export const previewNextEstimateNumber = () => peekNextDocumentNumber("estimates");

/** Postgres had UNIQUE(estimate_number); call this before saving a custom number. */
export async function findEstimateByNumber(estimate_number: string): Promise<Estimate | null> {
  const snap = await getDocs(query(collection(db(), COLLECTIONS.estimates), where("estimate_number", "==", estimate_number), limit(1)));
  const d = snap.docs[0];
  return d ? ({ id: d.id, ...(d.data() as Omit<Estimate, "id">) }) : null;
}

async function settingsSnapshot() {
  return settingsToRow(await getDocumentSettings());
}

async function requireClient(id: string): Promise<Client> {
  const client = await getOne<Client>(COLLECTIONS.clients, id);
  if (!client) throw new Error("Client not found");
  return client;
}

export async function createEstimate(input: EstimateInput, options: { id?: string; estimate_number?: string } = {}): Promise<Estimate> {
  const client = await requireClient(input.client_id);
  const settings = await settingsSnapshot();
  const id = options.id ?? newId();
  const now = nowIso();

  return runTransaction(db(), async (tx) => {
    const estimate_number = options.estimate_number
      ? await bumpCounterForCustomNumber(tx, "estimates", options.estimate_number)
      : await reserveDocumentNumber(tx, "estimates");
    const estimate: Estimate = {
      id,
      estimate_number,
      client_id: input.client_id,
      estimate_date: input.estimate_date,
      valid_until: input.valid_until ?? null,
      payment_method: input.payment_method,
      notes: input.notes ?? null,
      subtotal: Number(input.subtotal),
      hst_rate: Number(input.hst_rate),
      hst_amount: Number(input.hst_amount),
      total: Number(input.total),
      status: input.status ?? "draft",
      sent_at: input.sent_at ?? null,
      accepted_at: input.accepted_at ?? null,
      declined_at: input.declined_at ?? null,
      created_at: now,
      updated_at: now,
      client_signature: input.client_signature ?? null,
      public_token: newId(),
      share_enabled: input.share_enabled ?? true,
      items: normalizeItems(input.items),
    };
    const { id: _id, ...data } = estimate; // eslint-disable-line @typescript-eslint/no-unused-vars
    tx.set(doc(db(), COLLECTIONS.estimates, id), clean(data));
    tx.set(doc(db(), COLLECTIONS.shared, estimate.public_token), clean(buildSharedEstimate(estimate, client, settings)));
    return estimate;
  });
}

export async function updateEstimate(id: string, patch: Partial<EstimateInput>): Promise<Estimate> {
  const existing = await getEstimate(id);
  if (!existing) throw new Error("Estimate not found");
  const merged: Estimate = {
    ...existing,
    ...clean(patch),
    items: patch.items ? normalizeItems(patch.items) : existing.items,
    updated_at: nowIso(),
  } as Estimate;
  const [client, settings] = await Promise.all([requireClient(merged.client_id), settingsSnapshot()]);
  const { id: _id, ...data } = merged; // eslint-disable-line @typescript-eslint/no-unused-vars
  const batch = writeBatch(db());
  batch.set(doc(db(), COLLECTIONS.estimates, id), clean(data));
  batch.set(doc(db(), COLLECTIONS.shared, merged.public_token), clean(buildSharedEstimate(merged, client, settings)));
  await batch.commit();
  return merged;
}

export const setEstimateStatus = (
  id: string,
  status: string,
  stamps: Partial<Pick<EstimateInput, "sent_at" | "accepted_at" | "declined_at">> = {},
) => updateEstimate(id, { status, ...stamps });

export const setEstimateShareEnabled = (id: string, share_enabled: boolean) => updateEstimate(id, { share_enabled });

export async function deleteEstimate(id: string): Promise<void> {
  const existing = await getEstimate(id);
  const batch = writeBatch(db());
  batch.delete(doc(db(), COLLECTIONS.estimates, id));
  if (existing?.public_token) batch.delete(doc(db(), COLLECTIONS.shared, existing.public_token));
  await batch.commit();
}

/**
 * Edit flow: change an estimate's number to a custom one (check it with
 * `findEstimateByNumber` first — Postgres had UNIQUE(estimate_number)). Like
 * `createEstimate`, a number that looks like EST-YYYYMM-NNN raises that month's
 * counter so auto-numbering never collides with it later. Call `updateEstimate`
 * afterwards so the share copy picks up the new number.
 */
export async function setEstimateNumber(id: string, estimate_number: string): Promise<string> {
  return runTransaction(db(), async (tx) => {
    const number = await bumpCounterForCustomNumber(tx, "estimates", estimate_number);
    tx.update(doc(db(), COLLECTIONS.estimates, id), { estimate_number: number, updated_at: nowIso() });
    return number;
  });
}
