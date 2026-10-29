"use client";

/**
 * Public share links: `shared/{public_token}` holds a whitelisted copy of an
 * invoice/estimate plus a snapshot of the document settings, so the /share page
 * can render with no login. The token is the credential (an unguessable uuid);
 * firestore.rules allows GET only, never LIST.
 *
 * Invoices/estimates write their shared copy in the same batch as the document
 * itself (see ./invoices.ts, ./estimates.ts).
 */
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS, db } from "./core";
import type { Client, Estimate, Invoice, SettingsRow, SharedDocument } from "./types";

type SettingsSnapshot = Omit<SettingsRow, "updated_at">;

const stripItems = (items: Invoice["items"]) =>
  items.map(({ description, quantity, rate, amount, sort_order }) => ({ description, quantity, rate, amount, sort_order }));

export function buildSharedInvoice(invoice: Invoice, client: Pick<Client, "name" | "address">, settings: SettingsSnapshot): SharedDocument {
  return {
    kind: "invoice",
    document_id: invoice.id,
    share_enabled: invoice.share_enabled,
    client: { name: client.name, address: client.address ?? null, client_signature: invoice.client_signature ?? null },
    meta: {
      number: invoice.invoice_number,
      date: invoice.invoice_date,
      payment_method: invoice.payment_method,
      notes: invoice.notes ?? null,
      subtotal: invoice.subtotal,
      hst_rate: invoice.hst_rate,
      hst_amount: invoice.hst_amount,
      total: invoice.total,
      status: invoice.status,
    },
    items: stripItems(invoice.items),
    settings,
    updated_at: invoice.updated_at,
  };
}

export function buildSharedEstimate(estimate: Estimate, client: Pick<Client, "name" | "address">, settings: SettingsSnapshot): SharedDocument {
  return {
    kind: "estimate",
    document_id: estimate.id,
    share_enabled: estimate.share_enabled,
    client: { name: client.name, address: client.address ?? null, client_signature: estimate.client_signature ?? null },
    meta: {
      number: estimate.estimate_number,
      date: estimate.estimate_date,
      valid_until: estimate.valid_until ?? null,
      payment_method: estimate.payment_method,
      notes: estimate.notes ?? null,
      subtotal: estimate.subtotal,
      hst_rate: estimate.hst_rate,
      hst_amount: estimate.hst_amount,
      total: estimate.total,
      status: estimate.status,
    },
    items: stripItems(estimate.items),
    settings,
    updated_at: estimate.updated_at,
  };
}

/**
 * Fetch a shared document by token with the anonymous client. Returns null for
 * an unknown token or when sharing is off (the rules deny the read, which the
 * SDK surfaces as `permission-denied`).
 */
export async function getSharedDocument(token: string): Promise<SharedDocument | null> {
  try {
    const snap = await getDoc(doc(db(), COLLECTIONS.shared, token));
    return snap.exists() ? (snap.data() as SharedDocument) : null;
  } catch (err) {
    if ((err as { code?: string })?.code === "permission-denied") return null;
    throw err;
  }
}
