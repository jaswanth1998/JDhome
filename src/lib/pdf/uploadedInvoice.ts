"use client";

/**
 * Invoices that were issued outside this app and uploaded as a PDF for
 * record-keeping. They are ordinary `invoices/{id}` docs with `pdf_name` /
 * `pdf_size` set, no line items and `share_enabled = false` (there is no
 * generated document to share). The bytes live in `invoiceFiles/{invoiceId}`
 * as base64, because the free Firebase plan has no Cloud Storage. A Firestore
 * document is capped at 1 MiB, so uploads are limited to 700 KB (≈ 950 KB once
 * base64-encoded) — plenty for a digitally produced invoice, not for a phone scan.
 */
import { deleteInvoiceFile, getInvoiceFile, putInvoiceFile } from "@/lib/db/invoices";

export const UPLOADED_INVOICE_MAX_BYTES = 700 * 1024;

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1)); // strip the data: prefix
    };
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(data: string, type = "application/pdf"): Blob {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** Store the PDF for an invoice (overwrites any previous file). */
export async function uploadInvoiceFile(invoiceId: string, file: File): Promise<void> {
  if (file.type !== "application/pdf") throw new Error("Only PDF files can be uploaded");
  if (file.size > UPLOADED_INVOICE_MAX_BYTES) {
    throw new Error(`PDF must be ${Math.round(UPLOADED_INVOICE_MAX_BYTES / 1024)} KB or smaller`);
  }
  const data = await fileToBase64(file);
  await putInvoiceFile(invoiceId, { name: file.name, size: file.size, data });
}

export async function fetchUploadedInvoiceBlob(invoiceId: string): Promise<Blob> {
  const file = await getInvoiceFile(invoiceId);
  if (!file) throw new Error("Failed to load the uploaded PDF");
  return base64ToBlob(file.data, file.content_type);
}

export async function downloadUploadedInvoice(invoiceId: string, invoiceNumber: string) {
  const blob = await fetchUploadedInvoiceBlob(invoiceId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Best effort — the invoice doc is the source of truth, an orphaned file is harmless. */
export async function removeUploadedInvoiceFile(invoiceId: string) {
  try {
    await deleteInvoiceFile(invoiceId);
  } catch {
    /* ignore */
  }
}
