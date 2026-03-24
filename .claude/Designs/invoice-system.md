# Invoice System - Flow Design

## Overview

An invoice system for JD Home Services that allows admins to create, preview, send, and track invoices. Invoices match the exact layout of `JD_Home_Invoice.docx` with dynamic values. A copy is emailed to the customer and stored in Supabase.

---

## Invoice Template (from docx)

The invoice has a fixed layout — only the values change:

```
+----------------------------------------------------------+
|  JD HOME                                                  |
|  FROM INSTALL TO REPAIR. FINISHED TO PERFECTION.          |
|                                                           |
|  Phone:    +1 (289) 991-3277                              |
|  Email:    17508336canadainc@gmail.com                     |
|  Web:      www.Jdhomeservices.ca                          |
|  Address:  Barrie, Ontario                                |
|  GST/HST: 2000 2161 RT0001                                |
+----------------------------------------------------------+
|                     INVOICE                               |
|  No. {invoice_number}                                     |
+----------------------------------------------------------+
|  BILL TO                  |  Invoice Date: {date}         |
|  {client_name}            |  Payment Method: {method}     |
|  {client_address}         |                               |
+----------------------------------------------------------+
|  DESCRIPTION          | QTY | RATE     | AMOUNT           |
|  --------------------|-----|----------|------------------ |
|  {line_item_1}       | 12  | $50      | $600              |
|  {line_item_2}       | 12  | $50      | $600              |
|  {line_item_3}       | 12  | $10      | $120              |
+----------------------------------------------------------+
|  Notes:                          | Subtotal:  $1,320.00   |
|  {notes_text}                    | HST (13%): $171.60     |
|                                  | TOTAL DUE: $1,491.60   |
+----------------------------------------------------------+
|  FROM INSTALL TO REPAIR. FINISHED TO PERFECTION.          |
|  Thank you for choosing JD Home. We appreciate your       |
|  business.                                                |
|  TRUSTED LOCAL EXPERTS                                    |
+----------------------------------------------------------+
```

### Dynamic Fields

| Field | Source | Example |
|-------|--------|---------|
| `invoice_number` | Auto-generated (INV-YYYYMM-001) | INV-202603-001 |
| `client_name` | Form input / saved client | John Smith |
| `client_email` | Form input / saved client | john@example.com |
| `client_address` | Form input / saved client | 123 Main St, Oshawa, ON |
| `invoice_date` | Date picker (default: today) | March 8, 2026 |
| `payment_method` | Dropdown selection | E-Transfer / Cash / Cheque / Credit Card |
| `line_items[]` | Dynamic rows (description, qty, rate) | Removal and Installation of lock |
| `notes` | Free-text field | Site location: TKE, 33 Booth Ave... |
| `subtotal` | Computed: sum of (qty * rate) | $1,320.00 |
| `hst` | Computed: subtotal * 0.13 | $171.60 |
| `total` | Computed: subtotal + hst | $1,491.60 |

### Static Fields (hardcoded from theme/config, NOT editable per-invoice)

- Company name, phone, email, web, address, GST/HST number
- Tagline, footer text

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL (Browser)                    │
│                                                             │
│  /admin/invoices          - List all invoices               │
│  /admin/invoices/new      - Create new invoice              │
│  /admin/invoices/[id]     - View / Edit / Resend            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Invoice Form (React Hook Form + Zod)        │    │
│  │  Client info, line items, notes, payment method     │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Live Invoice Preview                        │    │
│  │  (React component matching the docx template)       │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                            │
│        ┌────────┴────────┐                                   │
│        ▼                 ▼                                   │
│  [Save Draft]    [Save & Send]                              │
│        │                 │                                   │
└────────┼─────────────────┼──────────────────────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │  jdhome.invoices         (invoice metadata)  │           │
│  │  jdhome.invoice_items    (line items)         │           │
│  │  jdhome.clients          (saved clients)      │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │  Supabase Storage                             │           │
│  │  Bucket: jdhome-invoices                      │           │
│  │  Path: invoices/{invoice_id}.pdf              │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │  Edge Function: send-invoice                  │           │
│  │  - Receives: invoice_id                       │           │
│  │  - Fetches invoice + items from DB            │           │
│  │  - Generates PDF (via jsPDF or pdf-lib)       │           │
│  │  - Sends email via SMTP server                 │           │
│  │  - Uploads PDF to Storage                     │           │
│  │  - Updates invoice status to "sent"           │           │
│  └──────────────────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow

### Flow 1: Create & Send Invoice

```
Admin opens /admin/invoices/new
        │
        ▼
┌─ STEP 1: Fill Invoice Form ─────────────────────────────┐
│                                                          │
│  Client Section:                                         │
│    - Search existing client OR enter new                 │
│    - Name, Email, Address (auto-fill if existing)        │
│                                                          │
│  Invoice Details:                                        │
│    - Invoice Date (default: today)                       │
│    - Payment Method (dropdown)                           │
│                                                          │
│  Line Items (dynamic rows):                              │
│    - [ Description ] [ Qty ] [ Rate ] [ Amount=auto ]    │
│    - [ + Add Line Item ]                                 │
│                                                          │
│  Notes (optional textarea)                               │
│                                                          │
│  Live totals: Subtotal | HST (13%) | Total Due           │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
┌─ STEP 2: Preview ───────────────────────────────────────┐
│                                                          │
│  Full invoice rendered in-browser matching the           │
│  exact docx template layout (side panel or modal).       │
│  Admin can go back and edit, or proceed.                 │
│                                                          │
│  [ Back to Edit ]    [ Save Draft ]    [ Save & Send ]   │
└────────────┬─────────────┬─────────────┬────────────────┘
             │             │             │
             ▼             │             │
     (go back to form)     │             │
                           ▼             │
                  ┌─ Save Draft ──┐      │
                  │ INSERT into   │      │
                  │ jdhome.invoices│     │
                  │ status='draft'│      │
                  │ INSERT items  │      │
                  │ Save client   │      │
                  │ (if new)      │      │
                  └───────────────┘      │
                                         ▼
                              ┌─ Save & Send ─────────────┐
                              │                            │
                              │ 1. INSERT into             │
                              │    jdhome.invoices         │
                              │    status='sent'           │
                              │                            │
                              │ 2. INSERT into             │
                              │    jdhome.invoice_items    │
                              │                            │
                              │ 3. Upsert client into      │
                              │    jdhome.clients          │
                              │                            │
                              │ 4. Call Edge Function      │
                              │    "send-invoice"          │
                              │    payload: { invoice_id } │
                              │                            │
                              └─────────────┬──────────────┘
                                            │
                                            ▼
                              ┌─ Edge Function ───────────┐
                              │                            │
                              │ 1. Fetch invoice + items   │
                              │    + client from DB        │
                              │                            │
                              │ 2. Generate PDF matching   │
                              │    the docx template       │
                              │    (using pdf-lib)         │
                              │                            │
                              │ 3. Upload PDF to Storage   │
                              │    jdhome-invoices/        │
                              │    {invoice_id}.pdf        │
                              │                            │
                              │ 4. Send email via SMTP:    │
                              │    To: client_email        │
                              │    Subject: "Invoice       │
                              │      {number} from JD Home │
                              │      Solutions"            │
                              │    Body: Thank you message │
                              │    Attachment: invoice.pdf │
                              │                            │
                              │ 5. Update invoice:         │
                              │    pdf_url = storage URL   │
                              │    sent_at = now()         │
                              │    status = 'sent'         │
                              │                            │
                              └────────────────────────────┘
```

### Flow 2: View & Manage Invoices

```
Admin opens /admin/invoices
        │
        ▼
┌─ Invoice List ──────────────────────────────────────────┐
│                                                          │
│  [Search bar]  [Filter: All|Draft|Sent|Paid|Overdue]     │
│                                                          │
│  ┌────────┬──────────┬─────────────┬────────┬─────────┐ │
│  │ Number │ Client   │ Date        │ Total  │ Status  │ │
│  ├────────┼──────────┼─────────────┼────────┼─────────┤ │
│  │INV-001 │ John S.  │ Mar 8, 2026 │$1,491  │ ● Sent  │ │
│  │INV-002 │ Sarah M. │ Mar 7, 2026 │$850    │ ● Paid  │ │
│  │INV-003 │ David K. │ Mar 5, 2026 │$2,100  │ ○ Draft │ │
│  └────────┴──────────┴─────────────┴────────┴─────────┘ │
│                                                          │
│  Click row → /admin/invoices/[id]                        │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌─ Invoice Detail (/admin/invoices/[id]) ─────────────────┐
│                                                          │
│  Full invoice preview (same as creation preview)         │
│                                                          │
│  Actions:                                                │
│    [Download PDF]  - Download from Supabase Storage      │
│    [Resend]        - Re-trigger Edge Function email      │
│    [Mark as Paid]  - Update status to 'paid'             │
│    [Edit]          - Only if status = 'draft'            │
│    [Delete]        - Only if status = 'draft'            │
│                                                          │
│  Timeline:                                               │
│    Created: Mar 8, 2026 10:30 AM                         │
│    Sent: Mar 8, 2026 10:31 AM                            │
│    Paid: —                                               │
└──────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `jdhome.clients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `name` | text | NOT NULL | Client full name |
| `email` | text | NOT NULL | Client email for sending invoices |
| `phone` | text | | Client phone number |
| `address` | text | | Client full address |
| `created_at` | timestamptz | default now() | |
| `updated_at` | timestamptz | default now() | |
| `created_by` | uuid | FK → auth.users(id) | Admin who created |

### `jdhome.invoices`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `invoice_number` | text | UNIQUE, NOT NULL | e.g. "INV-202603-001" |
| `client_id` | uuid | FK → jdhome.clients(id) | |
| `invoice_date` | date | NOT NULL, default CURRENT_DATE | |
| `payment_method` | text | NOT NULL | e-transfer, cash, cheque, credit-card |
| `notes` | text | | Free-text notes on invoice |
| `subtotal` | numeric(10,2) | NOT NULL | Sum of line items |
| `hst_rate` | numeric(5,4) | NOT NULL, default 0.13 | HST percentage |
| `hst_amount` | numeric(10,2) | NOT NULL | Computed: subtotal * hst_rate |
| `total` | numeric(10,2) | NOT NULL | subtotal + hst_amount |
| `status` | text | NOT NULL, default 'draft' | draft, sent, paid, overdue, cancelled |
| `pdf_url` | text | | Supabase Storage path to PDF |
| `sent_at` | timestamptz | | When invoice was emailed |
| `paid_at` | timestamptz | | When marked as paid |
| `created_at` | timestamptz | default now() | |
| `updated_at` | timestamptz | default now() | |
| `created_by` | uuid | FK → auth.users(id) | Admin who created |

### `jdhome.invoice_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, default gen_random_uuid() | |
| `invoice_id` | uuid | FK → jdhome.invoices(id) ON DELETE CASCADE | |
| `description` | text | NOT NULL | Line item description |
| `quantity` | numeric(10,2) | NOT NULL | |
| `rate` | numeric(10,2) | NOT NULL | Price per unit |
| `amount` | numeric(10,2) | NOT NULL | quantity * rate |
| `sort_order` | integer | NOT NULL, default 0 | Display order |

### RLS Policies

All tables have RLS enabled. Policies:

```sql
-- All jdhome tables: only authenticated admins can access
CREATE POLICY "Admins can do everything"
  ON jdhome.<table>
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );
```

---

## Edge Function: `send-invoice`

**Runtime:** Deno (Supabase Edge Functions)
**Trigger:** Called from client via `supabase.functions.invoke('send-invoice', { body: { invoice_id } })`

### SMTP Integration

The Edge Function connects to your SMTP server directly using Deno's `SMTPClient` (from `denomailer`). This avoids any third-party email API — emails go straight through your own mail server.

```
SMTP Flow:
  Edge Function → connects to SMTP_HOST:SMTP_PORT (TLS/SSL)
               → authenticates with SMTP_USER / SMTP_PASS
               → sends email with PDF attachment
               → closes connection
```

### Logic

```
1. Authenticate request (verify JWT from Authorization header)
2. Fetch invoice + items + client from jdhome schema
3. Validate invoice exists and status is not 'cancelled'
4. Generate PDF using pdf-lib:
   - Match exact docx template layout
   - JD Home header with company details
   - Invoice number, bill-to, date, payment method
   - Line items table
   - Notes, subtotal, HST, total
   - Footer with tagline
5. Upload PDF to Supabase Storage (jdhome-invoices bucket)
6. Send email via SMTP (using Deno smtp client):
   - SMTP Host/Port/Auth from Edge Function secrets
   - From: JD Home Services <invoices@jdhomeservices.ca> (or configured sender)
   - To: client.email
   - Subject: "Invoice {invoice_number} - JD Home Services"
   - HTML body: brief message with total due
   - Attachment: generated PDF (base64-encoded)
7. Update invoice: pdf_url, sent_at, status='sent'
8. Return success response
```

### Environment Variables (Edge Function secrets)

| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_HOST` | SMTP server hostname | mail.jdhomeservices.ca |
| `SMTP_PORT` | SMTP server port | 465 (SSL) or 587 (TLS) |
| `SMTP_USER` | SMTP auth username | invoices@jdhomeservices.ca |
| `SMTP_PASS` | SMTP auth password | ******* |
| `SMTP_FROM_EMAIL` | Sender email address | invoices@jdhomeservices.ca |
| `SMTP_FROM_NAME` | Sender display name | JD Home Services |
| `SUPABASE_SERVICE_ROLE_KEY` | For DB access from Edge Function | (auto-set by Supabase) |

---

## Invoice Number Generation

Auto-generated format: `INV-YYYYMM-NNN`

```sql
-- Database function to generate next invoice number
CREATE OR REPLACE FUNCTION jdhome.generate_invoice_number()
RETURNS text AS $$
DECLARE
  prefix text;
  seq int;
BEGIN
  prefix := 'INV-' || to_char(CURRENT_DATE, 'YYYYMM') || '-';
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM length(prefix) + 1) AS integer)
  ), 0) + 1
  INTO seq
  FROM jdhome.invoices
  WHERE invoice_number LIKE prefix || '%';
  RETURN prefix || LPAD(seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## Frontend Components

### New Admin Routes

```
src/app/admin/(protected)/
  invoices/
    page.tsx                 # Invoice list page
    InvoiceListContent.tsx   # Client component: table, filters, search
    new/
      page.tsx               # New invoice page
      NewInvoiceContent.tsx   # Client component: form + preview
    [id]/
      page.tsx               # Invoice detail page
      InvoiceDetailContent.tsx # Client component: view, actions
```

### Shared Components

```
src/components/admin/invoices/
  InvoiceForm.tsx            # Form with client info, line items, notes
  InvoicePreview.tsx         # Visual preview matching docx template
  InvoiceStatusBadge.tsx     # Colored badge for draft/sent/paid/overdue
  LineItemRow.tsx            # Single editable line item row
```

### Admin Sidebar Update

Add "Invoices" nav item to [admin/(protected)/layout.tsx](src/app/admin/(protected)/layout.tsx):

```ts
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
];
```

---

## Tech Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| PDF generation | `pdf-lib` (in Edge Function) | Works in Deno, no native deps, full layout control |
| Email delivery | Own SMTP server (via Nodemailer-style SMTP in Deno) | Full control, no third-party dependency, supports attachments |
| Form validation | react-hook-form + zod | Already used in the project (contact form) |
| File storage | Supabase Storage | Already integrated, no extra service needed |
| Number formatting | Intl.NumberFormat | Native browser API, Canadian dollar formatting |

---

## Email Template

**Subject:** `Invoice INV-202603-001 - JD Home Services`

**Body (HTML):**
```
Hi {client_name},

Please find attached your invoice INV-202603-001 from JD Home Services.

Invoice Date: March 8, 2026
Total Due: $1,491.60
Payment Method: E-Transfer

If you have any questions about this invoice, please contact us:
Phone: (289) 991-3277
Email: 17508336canadainc@gmail.com

Thank you for choosing JD Home Services.
From Install to Repair. Finished to Perfection.
```

**Attachment:** `INV-202603-001.pdf`

### SMTP Edge Function Pseudocode

```ts
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

const client = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST")!,
    port: Number(Deno.env.get("SMTP_PORT")),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USER")!,
      password: Deno.env.get("SMTP_PASS")!,
    },
  },
});

await client.send({
  from: `${Deno.env.get("SMTP_FROM_NAME")} <${Deno.env.get("SMTP_FROM_EMAIL")}>`,
  to: clientEmail,
  subject: `Invoice ${invoiceNumber} - JD Home Services`,
  html: emailHtmlBody,
  attachments: [
    {
      filename: `${invoiceNumber}.pdf`,
      content: pdfBytes,            // Uint8Array from pdf-lib
      encoding: "binary",
    },
  ],
});

await client.close();
```

---

## Implementation Order

1. **Database** - Create `jdhome.clients`, `jdhome.invoices`, `jdhome.invoice_items` tables with RLS
2. **Invoice Number Function** - `jdhome.generate_invoice_number()`
3. **Storage Bucket** - Create `jdhome-invoices` bucket with admin-only access
4. **Admin UI - Invoice List** - `/admin/invoices` page with empty state
5. **Admin UI - New Invoice** - Form + live preview + save as draft
6. **Admin UI - Invoice Detail** - View, download, status management
7. **Edge Function** - `send-invoice` (PDF generation + email via SMTP)
8. **Wire up Send** - Connect "Save & Send" button to edge function
9. **Sidebar nav** - Add Invoices link to admin layout
