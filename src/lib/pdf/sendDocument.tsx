"use client";

/**
 * Client-side PDF generation + delivery.
 *
 * The browser renders the PDF (vector, selectable text) and POSTs the finished
 * file to n8n, which now does nothing but attach it to an email and forward a
 * Telegram copy. No Adobe, no Word template, no server-side rendering.
 *
 * @react-pdf/renderer is imported dynamically so it stays out of the main
 * bundle and never runs during the static export build.
 */
import type { JDDocumentData, DocumentKind } from "./types";
import { getDocumentSettings } from "./settings";

export const DOCUMENT_WEBHOOKS: Record<DocumentKind, string> = {
  invoice: "https://myn8n.plaper.org/webhook/jdhomes-invoice-pdf",
  estimate: "https://myn8n.plaper.org/webhook/jdhomes-estimate-pdf",
};

/** Render the document to a PDF Blob in the browser. */
export async function buildDocumentPdfBlob(
  data: JDDocumentData
): Promise<Blob> {
  const [{ pdf }, { JDDocument }, settings] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./JDDocument"),
    getDocumentSettings(),
  ]);
  return pdf(<JDDocument data={data} settings={settings} />).toBlob();
}

/** Filename used for the attachment and for manual downloads. */
export function documentFileName(data: JDDocumentData) {
  return `${data.meta.number || data.kind}.pdf`;
}

/** Trigger a browser download of the PDF (used by "Download PDF" actions). */
export async function downloadDocumentPdf(data: JDDocumentData) {
  const blob = await buildDocumentPdfBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = documentFileName(data);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Generate the PDF and hand it to n8n for delivery.
 *
 * Sent as multipart/form-data:
 *   - `pdf`     the rendered file (n8n exposes it as binary)
 *   - `payload` JSON metadata (recipient, number, totals) for the email body
 *
 * Throws on a non-2xx response so callers can surface the failure.
 */
export async function sendDocument(data: JDDocumentData): Promise<void> {
  const blob = await buildDocumentPdfBlob(data);
  const fileName = documentFileName(data);

  const form = new FormData();
  form.append("pdf", blob, fileName);
  form.append(
    "payload",
    JSON.stringify({
      kind: data.kind,
      file_name: fileName,
      client: {
        name: data.client.name,
        email: data.client.email,
        phone: data.client.phone ?? null,
        address: data.client.address ?? null,
      },
      document: {
        number: data.meta.number,
        date: data.meta.date,
        valid_until: data.meta.valid_until ?? null,
        payment_method: data.meta.payment_method ?? null,
        notes: data.meta.notes ?? null,
        subtotal: data.meta.subtotal,
        hst_rate: data.meta.hst_rate,
        hst_amount: data.meta.hst_amount,
        total: data.meta.total,
      },
    })
  );

  const res = await fetch(DOCUMENT_WEBHOOKS[data.kind], {
    method: "POST",
    body: form, // no Content-Type header: the browser sets the multipart boundary
  });

  if (!res.ok) {
    throw new Error(
      `Failed to send ${data.kind} (${res.status} ${res.statusText})`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Adapters: DB row shapes -> JDDocumentData                           */
/* ------------------------------------------------------------------ */

type InvoiceLike = {
  invoice_number: string;
  invoice_date: string;
  payment_method?: string | null;
  notes?: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  client_signature?: string | null;
};

type EstimateLike = {
  estimate_number: string;
  estimate_date: string;
  valid_until?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  client_signature?: string | null;
};

type ClientLike = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  /** new/edit flows carry the signature here; view flows carry it on the record */
  client_signature?: string | null;
};

type ItemLike = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  sort_order?: number;
};

export function toInvoiceDocument(
  invoice: InvoiceLike,
  client: ClientLike,
  items: ItemLike[]
): JDDocumentData {
  return {
    kind: "invoice",
    client: {
      ...client,
      client_signature:
        invoice.client_signature ?? client.client_signature ?? null,
    },
    meta: {
      number: invoice.invoice_number,
      date: invoice.invoice_date,
      payment_method: invoice.payment_method ?? null,
      notes: invoice.notes ?? null,
      subtotal: invoice.subtotal,
      hst_rate: invoice.hst_rate,
      hst_amount: invoice.hst_amount,
      total: invoice.total,
    },
    items,
  };
}

export function toEstimateDocument(
  estimate: EstimateLike,
  client: ClientLike,
  items: ItemLike[]
): JDDocumentData {
  return {
    kind: "estimate",
    client: {
      ...client,
      client_signature:
        estimate.client_signature ?? client.client_signature ?? null,
    },
    meta: {
      number: estimate.estimate_number,
      date: estimate.estimate_date,
      valid_until: estimate.valid_until ?? null,
      payment_method: estimate.payment_method ?? null,
      notes: estimate.notes ?? null,
      subtotal: estimate.subtotal,
      hst_rate: estimate.hst_rate,
      hst_amount: estimate.hst_amount,
      total: estimate.total,
    },
    items,
  };
}
