import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Invoices that were issued outside this app and uploaded as a PDF for
 * record-keeping. They are ordinary `jdhome.invoices` rows with `pdf_url` set to
 * the file's path in the private `jdhome-invoices` bucket, no line items, and
 * `share_enabled = false` (there is no generated document to share).
 */
export const UPLOADED_INVOICE_BUCKET = "jdhome-invoices";
export const UPLOADED_INVOICE_MAX_BYTES = 10 * 1024 * 1024; // bucket limit

export async function fetchUploadedInvoiceBlob(
  supabase: SupabaseClient,
  path: string,
): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(UPLOADED_INVOICE_BUCKET)
    .download(path);
  if (error || !data) throw new Error("Failed to load the uploaded PDF");
  return data;
}

export async function downloadUploadedInvoice(
  supabase: SupabaseClient,
  path: string,
  invoiceNumber: string,
) {
  const blob = await fetchUploadedInvoiceBlob(supabase, path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Best effort — the invoice row is the source of truth, an orphaned file is harmless. */
export async function removeUploadedInvoiceFile(
  supabase: SupabaseClient,
  path: string,
) {
  await supabase.storage.from(UPLOADED_INVOICE_BUCKET).remove([path]);
}
