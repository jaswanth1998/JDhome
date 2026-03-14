---
name: "Invoice System"
description: "Build an invoice system for admin panel: create, preview, send (via SMTP), and track invoices with PDF generation and Supabase storage"
status: "completed"
completed_items:
  - "Phase 1.1: Created jdhome.clients, jdhome.invoices, jdhome.invoice_items tables with RLS"
  - "Phase 1.2: Created jdhome.generate_invoice_number() function (INV-YYYYMM-NNN format)"
  - "Phase 1.3: Created jdhome-invoices storage bucket with admin-only policies"
  - "Phase 2: Built invoice list page with status tabs, search, status badges, sidebar nav"
  - "Phase 3: Built new invoice page with form, line items, live preview, save draft/send"
  - "Phase 4: Built invoice detail page with preview, timeline, actions (send/resend/mark paid/delete/PDF)"
  - "Phase 5: Deployed send-invoice Edge Function (pdf-lib PDF gen + nodemailer SMTP)"
  - "Phase 6: Updated dashboard with invoice stats, verified build (13 static pages)"
  - "Phase 7: Updated CLAUDE.md with invoice system documentation"
notes:
  went_well:
    - "All database tables, RLS policies, and functions created via MCP migrations"
    - "Edge Function deployed successfully with pdf-lib + nodemailer"
    - "Static export build passes with all invoice routes"
  went_wrong:
    - "Dynamic [id] route failed with static export - restructured to /view?id= query params"
  blockers:
    - "SMTP secrets must be set manually via Supabase Dashboard or CLI (no MCP tool for secrets)"
---

# Plan: Invoice System

**Design reference:** `.claude/Designs/invoice-system.md`

---

## Phase 1: Database Foundation

### Task 1.1: Create `jdhome` schema tables

Run Supabase migration `create_jdhome_invoice_tables` to create:

- **`jdhome.clients`** — id (uuid PK), name, email, phone, address, created_at, updated_at, created_by (FK auth.users)
- **`jdhome.invoices`** — id (uuid PK), invoice_number (unique), client_id (FK clients), invoice_date, payment_method, notes, subtotal, hst_rate (default 0.13), hst_amount, total, status (default 'draft'), pdf_url, sent_at, paid_at, created_at, updated_at, created_by (FK auth.users)
- **`jdhome.invoice_items`** — id (uuid PK), invoice_id (FK invoices ON DELETE CASCADE), description, quantity, rate, amount, sort_order

Enable RLS on all three tables. Create admin-only policy on each (checks `public.user_profiles` for `role='admin' AND is_active=true`).

### Task 1.2: Create invoice number generator function

Run migration `create_jdhome_invoice_number_function`:

- `jdhome.generate_invoice_number()` — returns `INV-YYYYMM-NNN` format
- Queries existing invoices for current month, increments sequence

### Task 1.3: Create Supabase Storage bucket

- Create `jdhome-invoices` bucket (private)
- Add storage policy: only authenticated admins can upload/read

---

## Phase 2: Admin UI - Invoice List

### Task 2.1: Create invoice list page

Files to create:
- `src/app/admin/(protected)/invoices/page.tsx` — server component with metadata
- `src/app/admin/(protected)/invoices/InvoiceListContent.tsx` — client component

Features:
- Fetch invoices from `jdhome.invoices` joined with `jdhome.clients` (name)
- Table columns: Invoice Number, Client, Date, Total, Status
- Status filter tabs: All | Draft | Sent | Paid | Overdue
- Search by invoice number or client name
- Empty state with "Create your first invoice" CTA
- Click row navigates to `/admin/invoices/[id]`
- "New Invoice" button links to `/admin/invoices/new`

### Task 2.2: Create InvoiceStatusBadge component

File: `src/components/admin/invoices/InvoiceStatusBadge.tsx`

Colored badge for each status:
- Draft: gray
- Sent: blue
- Paid: green
- Overdue: red/orange
- Cancelled: muted

### Task 2.3: Update admin sidebar navigation

Modify `src/app/admin/(protected)/layout.tsx`:
- Add "Invoices" nav item with `FileText` icon from lucide-react
- Link to `/admin/invoices`

---

## Phase 3: Admin UI - Create Invoice

### Task 3.1: Create invoice form component

File: `src/components/admin/invoices/InvoiceForm.tsx`

Form sections (react-hook-form + zod validation):
- **Client section:** name (required), email (required, valid email), phone, address. Autocomplete/search from existing `jdhome.clients`
- **Invoice details:** invoice date (date picker, default today), payment method (dropdown: E-Transfer, Cash, Cheque, Credit Card)
- **Line items:** dynamic field array — description (required), quantity (required, >0), rate (required, >=0), amount (auto-computed, read-only). "Add Line Item" button. Remove button per row
- **Notes:** optional textarea
- **Computed totals:** subtotal, HST (13%), total due — live-updating as line items change

### Task 3.2: Create line item row component

File: `src/components/admin/invoices/LineItemRow.tsx`

Single row with: description input, quantity input, rate input, computed amount display, delete button.

### Task 3.3: Create invoice preview component

File: `src/components/admin/invoices/InvoicePreview.tsx`

React component that renders the invoice matching the exact layout from `JD_Home_Invoice.docx`:
- Company header (JD HOME, tagline, phone, email, web, address, GST/HST)
- Invoice number and "INVOICE" title
- Bill-to section + invoice date + payment method
- Line items table (description, qty, rate, amount)
- Notes + subtotal/HST/total section
- Footer (tagline, thank you, trusted local experts)

Uses CSS to style as a print-ready document preview. Data passed as props from the form state.

### Task 3.4: Create new invoice page

Files:
- `src/app/admin/(protected)/invoices/new/page.tsx` — server component with metadata
- `src/app/admin/(protected)/invoices/new/NewInvoiceContent.tsx` — client component

Layout: side-by-side on desktop (form left, preview right), stacked on mobile (form on top, preview below toggled via tab).

Actions:
- **Save Draft** — inserts invoice with status='draft', inserts items, upserts client, redirects to invoice detail page
- **Save & Send** — same as draft but status='sent', then calls Edge Function `send-invoice`

Both actions:
1. Call `jdhome.generate_invoice_number()` via RPC to get next number
2. Upsert client into `jdhome.clients`
3. Insert invoice into `jdhome.invoices`
4. Insert items into `jdhome.invoice_items`

### Task 3.5: Create barrel export

File: `src/components/admin/invoices/index.ts` — export all invoice components.

---

## Phase 4: Admin UI - Invoice Detail

### Task 4.1: Create invoice detail page

Files:
- `src/app/admin/(protected)/invoices/[id]/page.tsx` — server component with metadata
- `src/app/admin/(protected)/invoices/[id]/InvoiceDetailContent.tsx` — client component

Features:
- Fetch invoice + items + client by ID from Supabase
- Render full invoice preview (reuse `InvoicePreview` component)
- Show timeline: created, sent, paid timestamps
- Action buttons based on status:
  - **Draft:** Edit, Send, Delete
  - **Sent:** Download PDF, Resend, Mark as Paid
  - **Paid:** Download PDF (read-only)
  - **Cancelled:** View only

### Task 4.2: Implement invoice actions

Within `InvoiceDetailContent.tsx`:
- **Download PDF** — fetch from Supabase Storage URL (`pdf_url`), trigger browser download
- **Mark as Paid** — update `status='paid'`, `paid_at=now()` in `jdhome.invoices`
- **Resend** — call Edge Function `send-invoice` again
- **Delete** — delete from `jdhome.invoices` (cascade deletes items), only if draft
- **Edit** — navigate to `/admin/invoices/new?edit={id}` pre-filled (only if draft)

---

## Phase 5: Edge Function - PDF Generation & Email

### Task 5.1: Create `send-invoice` Edge Function

File: `supabase/functions/send-invoice/index.ts`

Logic:
1. Verify JWT from `Authorization` header
2. Parse `invoice_id` from request body
3. Create Supabase client with `service_role` key
4. Fetch invoice + items + client from `jdhome` schema
5. Validate: invoice exists, status not 'cancelled'
6. Generate PDF with `pdf-lib`:
   - Create A4 page
   - Draw company header (JD HOME, tagline, contact info, GST/HST)
   - Draw "INVOICE" title + invoice number
   - Draw bill-to section, invoice date, payment method
   - Draw line items table with headers and rows
   - Draw notes + totals section (subtotal, HST, total)
   - Draw footer
7. Upload PDF to Supabase Storage: `jdhome-invoices/{invoice_id}.pdf`
8. Get public/signed URL for the stored PDF
9. Update invoice record: `pdf_url`, `sent_at=now()`, `status='sent'`
10. Send email via SMTP (see Task 5.2)
11. Return `{ success: true, pdf_url }`

### Task 5.2: SMTP email integration within Edge Function

Using `denomailer` (Deno SMTP client):

- Connect to SMTP server using secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Send email:
  - From: `SMTP_FROM_NAME <SMTP_FROM_EMAIL>`
  - To: client email
  - Subject: `Invoice {invoice_number} - JD Home Solutions`
  - HTML body: greeting, invoice summary (date, total, payment method), contact info, thank you
  - Attachment: generated PDF as binary

### Task 5.3: Set Edge Function secrets

Configure via Supabase CLI or dashboard:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

### Task 5.4: Deploy Edge Function

Deploy using `supabase functions deploy send-invoice`.

---

## Phase 6: Integration & Polish

### Task 6.1: Wire up "Save & Send" to Edge Function

In `NewInvoiceContent.tsx`:
- After saving invoice to DB, call `supabase.functions.invoke('send-invoice', { body: { invoice_id } })`
- Show loading state during send
- Show success toast with "Invoice sent to {client_email}"
- Handle errors (SMTP failure, PDF generation failure) with user-friendly messages
- Redirect to invoice detail page on success

### Task 6.2: Wire up "Resend" on invoice detail page

In `InvoiceDetailContent.tsx`:
- "Resend" button calls the same Edge Function
- Updates `sent_at` timestamp
- Shows confirmation before resending

### Task 6.3: Add invoice count to admin dashboard

Update `src/app/admin/(protected)/dashboard/page.tsx`:
- Add stat card showing total invoices, draft count, unpaid total
- Fetch from `jdhome.invoices` with aggregation

### Task 6.4: Build verification

- Run `npm run build` to ensure static export works
- Verify all new pages are generated
- Test that no server-side features crept in

---

## Phase 7: CLAUDE.md & Documentation

### Task 7.1: Update CLAUDE.md

Add to CLAUDE.md:
- Invoice system in architecture section
- New admin routes (`/admin/invoices`, `/admin/invoices/new`, `/admin/invoices/[id]`)
- Edge Function `send-invoice` documentation
- SMTP configuration notes
- `jdhome.clients`, `jdhome.invoices`, `jdhome.invoice_items` tables in Supabase section
- Storage bucket `jdhome-invoices`

---

## Dependencies & Prerequisites

| Dependency | Purpose | Install |
|------------|---------|---------|
| `pdf-lib` | PDF generation in Edge Function | Deno import (URL) |
| `denomailer` | SMTP email from Edge Function | Deno import (URL) |

No new npm packages needed for the frontend — react-hook-form, zod, and lucide-react are already installed.

## User-Provided Config Needed Before Phase 5

- SMTP server hostname and port
- SMTP credentials (username/password)
- Sender email address and display name
- Supabase Storage bucket creation (or permission to create via migration)
