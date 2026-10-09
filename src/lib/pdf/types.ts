/**
 * Shared shape for the PDF document + the n8n send payload.
 *
 * This mirrors the JSON the admin UI already sends to n8n, so the six existing
 * call sites (invoice/estimate x new/edit/view) can keep building the same
 * object they always did.
 */

export type DocumentKind = "invoice" | "estimate";

export type DocumentClient = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  /** PNG data URL produced by SignaturePad (canvas.toDataURL("image/png")) */
  client_signature?: string | null;
};

export type DocumentLineItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  sort_order?: number;
};

export type DocumentMeta = {
  /** INV-YYYYMM-NNN or EST-YYYYMM-NNN */
  number: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  /** estimates only */
  valid_until?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
};

export type JDDocumentData = {
  kind: DocumentKind;
  client: DocumentClient;
  meta: DocumentMeta;
  items: DocumentLineItem[];
};
