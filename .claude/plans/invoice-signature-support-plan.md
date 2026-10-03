---
name: "Invoice Signature Support"
description: "Add customer signature capability during invoice generation and when viewing invoice from inbox links."
status: "not-started"
completed_items: []
notes:
  went_well: []
  went_wrong: []
  blockers: []
---

## Summary
Add a signature field to the invoice flow in two entry points:
1. While generating invoice on site.
2. When customer opens invoice via inbox link.

The solution should support capture, save, display, and finalization rules consistently across both paths.

## Scope
- Capture handwritten signature (mouse/touch) for invoice acknowledgment.
- Save signature against invoice record (not just client-side).
- Show signature in invoice preview/PDF/email views.
- Support signing from secure inbox-view route with validation.

## Phase 1 — Discovery and architecture
- Identify invoice flow components/pages and API endpoints:
  - Invoice creation UI
  - Invoice view route used from inbox/email
  - PDF generation path
- Confirm existing invoice data model and storage strategy.
- Decide signature storage format:
  - Preferred: base64 PNG or uploaded file URL + metadata (`signedAt`, `signedBy`, `ip` optional).
- Define invoice states:
  - `draft` ? `sent` ? `signed` (or equivalent with current model).

## Phase 2 — Data model and backend
- Extend invoice schema/model with fields:
  - `signatureImage` (string/url)
  - `signatureSignedAt` (datetime)
  - `signatureSignerName` (optional string)
  - `signatureSource` (`onsite` | `inbox`)
- Add/extend backend endpoint(s):
  - Save signature to invoice by ID/token
  - Prevent duplicate overwrite unless explicitly allowed
  - Validate invoice is signable (not cancelled/voided)
- Ensure auth/security for inbox route:
  - Signed token or one-time secure link validation
  - Rate limit / expiry enforcement (if already present, reuse)

## Phase 3 — UI: signature during invoice generation (on site)
- Add signature pad component to invoice generation screen.
- Features:
  - Draw, clear, save
  - Touch + mouse support
  - Basic validation (must provide stroke)
- Add signer name input (optional/required per business rule).
- Save signature before final invoice submission or as part of submit payload.

## Phase 4 — UI: signature when opened from inbox
- On inbox invoice view page:
  - Show unsigned state + "Sign Invoice" section if not signed
  - Reuse signature pad component
  - Submit via secure token endpoint
- After successful sign:
  - Lock signature section (read-only)
  - Show signed timestamp and signer details
  - Update invoice status and UI badge

## Phase 5 — Rendering and distribution consistency
- Ensure signature appears in:
  - On-screen invoice detail
  - Generated PDF
  - Any print template
- Add fallback for unsigned invoices (e.g., "Not Signed").
- Ensure email/inbox re-open shows latest signed state.

## Phase 6 — Validation and QA
- Functional tests:
  - Sign during onsite generation
  - Sign from inbox link
  - Re-open signed invoice
  - Invalid/expired inbox token handling
- Edge cases:
  - Empty signature submission
  - Double-submit race conditions
  - Mobile touch behavior
- Regression checks:
  - Invoice creation still works without signature if business allows draft/send first
  - PDF generation performance/size impact

## Technical notes
- Recommended package for signature pad (if not already installed): `react-signature-canvas`.
- Store image efficiently (compressed PNG or vector path if backend supports).
- Consider adding audit fields for compliance.

## Decisions needed before implementation
1. Is signature mandatory before sending invoice, or optional?
2. Can a signed invoice be re-signed/edited?
3. Should signer name be required?
4. Should inbox signature links expire? If yes, after how long?
5. Do we need signature on all invoice templates or only customer-facing template?

## Deliverables
- Updated invoice schema + migration (if needed)
- Signature capture UI in both flows
- API support for secure signature save
- PDF/template signature rendering
- QA checklist completion
