# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

JD Home Solutions (jdhomesolutions.com / www.jdhomeservices.ca) - a business website + admin panel for a locksmith and smart home security company in Oshawa, Ontario. Frontend deployed to GitHub Pages; backend powered by Supabase.

## Commands

- `npm run dev` - Start dev server (Next.js, port 3000)
- `npm run build` - Build static export to `out/` directory
- `npm run start` - Serve the static `out/` build via `npx serve out`
- `npm run lint` - Run ESLint (flat config, `eslint.config.mjs`)

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router, static export (`output: "export"` in `next.config.ts`)
- **React 19**, **TypeScript 5** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- **Framer Motion** for animations
- **react-hook-form** + **zod** for contact form validation
- **lucide-react** and **react-icons** for icons
- Path alias: `@/*` maps to `./src/*`

## Architecture

### Centralized Theme (`src/config/theme.ts`)

All branding, colors, contact info, SEO metadata, services data, testimonials, and feature flags live in a single `theme` object. Components import from `@/config/theme` rather than hardcoding values. When changing business details (phone, email, hours, service area, services), update this file only.

CSS custom properties mirroring the theme are defined in `src/app/globals.css` under `:root` and extended into Tailwind via `@theme inline`. Components use both CSS variables (e.g., `var(--accent-teal)`) and Tailwind classes (e.g., `text-accent-teal`).

### Component Organization

- `src/components/layout/` - Header, Footer, MobileCallButton (marketing layout pieces)
- `src/components/sections/` - Homepage sections (Hero, ServicesGrid, WhyChooseUs, SmartLockSpotlight, ServiceArea, Testimonials, FinalCTA)
- `src/components/ui/` - Reusable primitives (Button, ServiceCard, TestimonialCard, TrustBadge, SectionHeading)
- `src/components/admin/` - Admin-specific components (LogoutButton, invoices/)
- Each directory has an `index.ts` barrel export

### Route Structure (Route Groups)

The app uses Next.js route groups to separate marketing and admin layouts:

```
src/app/
  layout.tsx                      # Root: html/body/fonts/globals (no Header/Footer)
  (public)/                       # Marketing site (URLs: /, /about, /services, /contact)
    layout.tsx                    # Wraps with Header + Footer + MobileCallButton
    page.tsx, about/, contact/, services/
  admin/                          # Admin panel (URLs: /admin/*)
    layout.tsx                    # Wraps with AuthProvider
    login/page.tsx                # Login page (no route guard)
    (protected)/                  # Route guard + admin shell
      layout.tsx                  # Client-side auth check + sidebar/topbar
      dashboard/page.tsx          # Admin dashboard
      invoices/
        page.tsx                  # Invoice list
        new/page.tsx              # Create new invoice
        view/page.tsx             # Invoice detail (uses ?id= query param)
```

Marketing pages use the pattern: `page.tsx` (server component with metadata) renders a `*PageContent.tsx` (client component).

### Admin Authentication (Client-Side)

Auth is fully client-side (required by `output: "export"` static build):

- `src/lib/supabase/client.ts` — Browser-only Supabase client (singleton)
- `src/lib/auth/AuthProvider.tsx` — React context: listens to `onAuthStateChange`, fetches `public.user_profiles` for role
- `src/lib/auth/useAuth.ts` — Hook: `{ user, profile, isLoading, isAdmin, supabase, signOut }`
- `admin/layout.tsx` wraps all admin pages with `<AuthProvider>`
- `admin/(protected)/layout.tsx` acts as client-side route guard: redirects to `/admin/login` if not admin
- Login page lives outside `(protected)/` so it's accessible without auth

No middleware or server-side auth — the static export doesn't support it.

### Contact Form

The contact form (`src/app/contact/ContactPageContent.tsx`) submits to an external webhook endpoint. Form validation uses zod schemas with `@hookform/resolvers`.

## Deployment

- **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) - triggers on push to `main`
- Build produces static files in `out/` with `trailingSlash: true` for GitHub Pages compatibility
- Images are unoptimized (`images.unoptimized: true`) since there's no server
- Custom domain configured via `public/CNAME`
- Docker setup exists (`Dockerfile` + `docker-compose.yml`) mapping port 5006 -> 3000
- **Environment variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are injected from GitHub Secrets during build. For local dev, use `.env.local` (gitignored). See `.env.example` for required vars.

## Supabase Backend

### Shared Database - Schema Isolation

This project shares a Supabase instance with **quickmart** (a separate app). Each app is isolated by schema:

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | quickmart | Products, transactions, shift reports, etc. |
| `jdhome` | JD Home Solutions | All JDhome tables (admin panel, services, bookings, etc.) |
| `auth` | Supabase built-in | Shared authentication (`auth.users`) |

**Critical rules:**
- **All JDhome tables must live in the `jdhome` schema** — never create tables in `public`
- **Never modify quickmart tables** (`public.products`, `public.transactions`, `public.departments`, `public.shift_reports`, `public.value_stock_entries`, `public.drawer_stock_entries`, `public.cash_counting_entries`, `public.todos`)
- **Shared auth**: `public.user_profiles` and `public.role_permissions` are shared across both apps. Reference `auth.users` for FK relationships from `jdhome` tables
- Migration names for JDhome should be prefixed descriptively (e.g., `create_jdhome_*`, `add_jdhome_*`)

### Schema Grants

The `jdhome` schema has default privileges configured:
- `anon` — SELECT on tables, USAGE on sequences
- `authenticated` — SELECT, INSERT, UPDATE, DELETE on tables, USAGE on sequences
- `service_role` — ALL on tables, sequences, functions

RLS must be enabled on every new table. Policies should reference `auth.uid()` or role checks against `public.user_profiles`.

### Supabase Client Usage

When querying `jdhome` tables from the frontend, use `.schema('jdhome')` on the Supabase client:
```ts
supabase.schema('jdhome').from('table_name').select('*')
```

Also add `jdhome` to the exposed schemas in Supabase Dashboard > API Settings for the auto-generated REST API to work.

### JDhome Tables

| Table | Purpose |
|-------|---------|
| `jdhome.clients` | Client contact info (name, email, phone, address) |
| `jdhome.invoices` | Invoice records (number, date, totals, status, PDF URL) |
| `jdhome.invoice_items` | Line items per invoice (description, qty, rate, amount) |

All tables have RLS enabled with admin-only policies. `invoices` has an auto-increment number function `jdhome.generate_invoice_number()` (format: `INV-YYYYMM-NNN`).

### Supabase Storage

- **Bucket:** `jdhome-invoices` (private) — stores generated invoice PDFs
- Path pattern: `{invoice_id}.pdf`

### Edge Functions

- **`send-invoice`** — Generates PDF (pdf-lib), uploads to storage, sends email via SMTP (nodemailer to smtp.hostinger.com), updates invoice status. Triggered from admin UI via `supabase.functions.invoke('send-invoice', { body: { invoice_id } })`.
- Required secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`

### Invoice System

The admin panel includes a full invoice system at `/admin/invoices`:
- **List page** — filterable by status (draft/sent/paid/overdue), searchable by number or client
- **Create page** — form with client search/create, dynamic line items, live preview matching the JD Home invoice template, save as draft or save & send
- **Detail page** — invoice preview, timeline, actions (send, resend, mark paid, download PDF, delete draft)
- Invoice detail uses query params (`/admin/invoices/view?id=xxx`) instead of dynamic `[id]` routes due to static export constraint
- Components: `src/components/admin/invoices/` (InvoiceForm, InvoicePreview, InvoiceStatusBadge, LineItemRow)

## Key Conventions

- Fonts: Poppins (headings) and Inter (body), loaded via `next/font/google`
- CSS utility function `cn()` from `src/lib/utils.ts` wraps `clsx` for conditional class merging
- Inline styles reference CSS variables directly (e.g., `style={{color: "var(--accent-teal)"}}`)
- Global CSS classes (`.btn`, `.card`, `.input`, `.section`, `.container`) are defined in `globals.css` alongside Tailwind
