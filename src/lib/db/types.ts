/**
 * Firestore document shapes for the admin panel.
 *
 * Field names are deliberately snake_case and identical to the former Postgres
 * columns, so forms, PDF adapters and list views keep working unchanged.
 * Timestamps are ISO-8601 strings (`new Date().toISOString()`), dates are
 * `YYYY-MM-DD` strings, money is a plain number. `id` is the Firestore document
 * id (a uuid) and is NOT stored inside the document.
 */

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  sort_order: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | string;
export type EstimateStatus = "draft" | "sent" | "accepted" | "declined" | "expired" | string;

export type Invoice = {
  id: string;
  invoice_number: string;
  client_id: string;
  invoice_date: string;
  payment_method: string;
  notes: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status: InvoiceStatus;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client_signature: string | null;
  public_token: string;
  share_enabled: boolean;
  /** Set on invoices issued by another company and uploaded as a PDF for the books. */
  sent_from_company: string | null;
  /** Uploaded third-party PDF metadata; the bytes live in `invoiceFiles/{invoiceId}`. */
  pdf_name?: string | null;
  pdf_size?: number | null;
  items: LineItem[];
};

/**
 * Bytes of an uploaded third-party invoice PDF (base64), one doc per invoice at
 * `invoiceFiles/{invoiceId}`. Kept apart from the invoice so list views stay light.
 * The free plan has no Cloud Storage; a Firestore doc is capped at 1 MiB, hence
 * UPLOADED_INVOICE_MAX_BYTES in src/lib/pdf/uploadedInvoice.ts.
 */
export type InvoiceFile = {
  id: string;
  name: string;
  size: number;
  content_type: "application/pdf";
  data: string;
  created_at: string;
};

export type Estimate = {
  id: string;
  estimate_number: string;
  client_id: string;
  estimate_date: string;
  valid_until: string | null;
  payment_method: string;
  notes: string | null;
  subtotal: number;
  hst_rate: number;
  hst_amount: number;
  total: number;
  status: EstimateStatus;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
  client_signature: string | null;
  public_token: string;
  share_enabled: boolean;
  items: LineItem[];
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  default_rate: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Row-shaped settings as stored in `settings/document` (see src/lib/pdf/settings.ts). */
export type SettingsRow = {
  company_phone: string;
  company_email: string;
  company_web: string;
  company_address: string;
  company_gst: string;
  tagline: string;
  footer_thanks: string;
  footer_badge: string;
  invoice_terms: string;
  estimate_terms: { title: string; body: string }[];
  payment_options: string[];
  cheque_payable_to: string;
  cheque_mail_to: string;
  default_hst_rate: number;
  updated_at?: string;
};

/** Public share-link copy stored at `shared/{public_token}`. */
export type SharedDocument = {
  kind: "invoice" | "estimate";
  document_id: string;
  share_enabled: boolean;
  client: { name: string; address: string | null; client_signature: string | null };
  meta: {
    number: string;
    date: string;
    valid_until?: string | null;
    payment_method: string;
    notes: string | null;
    subtotal: number;
    hst_rate: number;
    hst_amount: number;
    total: number;
    status: string;
  };
  items: Omit<LineItem, "id">[];
  settings: Omit<SettingsRow, "updated_at">;
  updated_at: string;
};

export type AdminProfile = {
  email: string;
  username: string | null;
};
