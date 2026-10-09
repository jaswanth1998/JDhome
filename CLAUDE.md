# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JD Home Services (www.jdhomeservices.ca) - a business website + admin panel for a garage door and security camera (CCTV) company in Oshawa, Ontario (Durham Region). Primary services: garage door repair & installation, smart security camera installation. Add-on services: locksmith, 24/7 car lockout. Frontend deployed to GitHub Pages; admin backend powered by Supabase; website inquiries stored in Firebase Firestore (project `jd-home-services-prod`).

## Commands

- `npm run dev` - Start dev server (Next.js, port 3000)
- `npm run build` - Build static export to `out/` directory
- `npm run start` - Serve the static `out/` build via `npx serve out`
- `npm run lint` - Run ESLint (flat config, `eslint.config.mjs`)
- `npm run verify:seo` - Verify SEO output in `out/` (titles, canonicals, JSON-LD, sitemap, robots); run after `npm run build`
- `npm run indexnow` - Submit every sitemap URL to IndexNow (Bing/Copilot); the deploy workflow runs it after each Pages deploy. Key file: `public/<key>.txt`

No test framework is configured.

## Tech Stack

- **Next.js 16** with App Router, static export (`output: "export"` in `next.config.ts`)
- **React 19**, **TypeScript 5** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- **Framer Motion** for animations
- **react-hook-form** + **zod** for the inquiry form
- **Firebase** (Firestore web SDK) for website inquiries
- **lucide-react** and **react-icons** for icons
- Path alias: `@/*` maps to `./src/*`

## Architecture

### Centralized Theme (`src/config/theme.ts`)

Brand, contact info, SEO metadata, services data, testimonials, and feature flags live in a single `theme` object. Components import from `@/config/theme` rather than hardcoding values. Visible copy leads with the service area (`theme.contact.address.serviceArea`, "Durham Region and surrounding areas"), per the owner; Oshawa is named in SEO titles, service and sub-service H1s ("... in Oshawa & Durham Region"), the home hero H1, and city pages. When changing business details (phone, email, hours, service area, services), update this file only. Each service has a `tier` (`"primary"` leads the site; `"addon"` is listed as an extra service), a `shortName` for nav, an `icon` (resolved by `ServiceIcon`), an `image` key, and optional `sections` (`ServiceSection[]`: `heading`, plain-text `paragraphs`, optional `bullets`) rendered as H2s after the overview on `/services/[slug]/` (read them with `getServiceSections()` from `src/lib/seo.ts`; links are added by the component, never written into the copy). `theme.services.garageLinks` lists the garage hub + three sub-service pages (href, link label, icon, one-line description) for the Header dropdown, Footer, and home page.

Photos live in `src/config/images.ts` (Unsplash CDN ids, free Unsplash License); render them with the `Photo` component, which builds a cropped responsive `srcset`. Swap in real job photos by setting `src` to a `/images/...` path.

Design tokens (navy + gold, from the logo) are CSS custom properties in `src/app/globals.css` (`--navy-*`, `--gold-*`, `--ink*`, `--paper*`, `--line*`) exposed to Tailwind via `@theme inline` (`bg-navy-800`, `text-gold-500`, `text-ink-2`, `border-line`...). Legacy names (`--accent-teal`, `--primary-main`, `--text-primary`, ...) are kept as aliases because the admin panel still uses them. Element defaults are in `@layer base` and reusable classes (`.btn*`, `.card`, `.input`, `.section`, `.eyebrow`, `.photo`, `.badge*`) in `@layer components`, so Tailwind utilities override them; `.container` stays unlayered so it beats Tailwind v4's own `container` utility.

### Component Organization

- `src/components/layout/` - Header, Footer, MobileCallButton (sticky call + quote bar on phones), MotionProvider
- `src/components/sections/` - Home page: `Hero` (light split hero + "start your free quote" picker; below `lg` it also shows `HeroVideo`, a looping Pexels clip that only loads on small screens), TrustStrip, `ServicesShowcase` + `HowItWorks` (built from `FeatureRow`, the photo + text row also used on the /services/ hub), `Testimonials` (real Google reviews from `theme.testimonials`, quoted word for word, never reworded; `serviceIds` filters them per page; the rating line reads `theme.contact.googleReviews`; also on service, sub-service, city and ad landing pages), ServiceArea, FinalCTA. Also `PageHero` (navy header for every inner page), `GarageProblems` and `CameraSystemDiagram` (service pages)
- `src/components/ui/` - Reusable primitives (Button, Photo, ServiceCard, ServiceIcon, TestimonialCard, SectionHeading, Breadcrumbs, Reveal)
- `src/components/inquiry/` - Quote request flow: `InquiryProvider` (context + dialog, mounted in the public layout), `InquiryButton` (opens the dialog, optionally pre-selecting a service; usable from server components), `InquiryForm` (3-step form, also embedded on /contact/), `FloatingQuoteButton` (md+ floating quote pill shown after scrolling past the hero). `InquiryButton attention="shine"|"pulse"|"both"` adds the `.cta-shine` / `.cta-pulse` effects from globals.css (auto-disabled for reduced motion)
- `src/components/seo/` - `JsonLd` server component (structured data); `src/components/analytics/` - `GoogleTagManager` (container from `theme.analytics.gtmId`, override `NEXT_PUBLIC_GTM_ID`) and env-gated `GoogleAnalytics`
- `src/components/admin/` - Admin-specific components (LogoutButton, invoices/)
- Each directory has an `index.ts` barrel export

### Route Structure (Route Groups)

The app uses Next.js route groups to separate marketing and admin layouts:

```
src/app/
  layout.tsx                      # Root: html/body/fonts/globals + GoogleTagManager/GoogleAnalytics (no Header/Footer)
  sitemap.ts, robots.ts           # sitemap.xml / robots.txt (force-static)
  llms.txt/route.ts               # /llms.txt: markdown business summary for AI assistants, built from theme + guides (force-static)
  og-image.png/route.tsx          # Pre-rendered 1200x630 OG image (force-static)
  og/blog/[image]/route.tsx       # Per-guide 1200x630 share images (/og/blog/<slug>.png)
  (public)/                       # Marketing site
    layout.tsx                    # MotionProvider + InquiryProvider + skip link + Header/Footer/MobileCallButton + site JSON-LD
    page.tsx                      # Home
    about/, contact/, privacy-policy/
    blog/                         # Guides: index, [slug]/, category/[category]/, rss.xml/
    services/
      page.tsx                    # Services hub (/services/, keeps a #<id> anchor per service)
      [slug]/page.tsx             # Service detail (/services/{garage-door-repair-installation|security-camera-installation|locksmith|car-lockout}/)
                                  # + garage sub-services (/services/{garage-door-installation|garage-door-opener-installation|garage-door-spring-repair}/, SubServicePageContent)
    service-areas/
      page.tsx                    # Service-area hub (/service-areas/, all 14 cities)
      [city]/page.tsx             # Core city pages (/service-areas/{oshawa|whitby|ajax|pickering|courtice|bowmanville}/)
  share/                          # Public invoice/estimate share links (noindex)
  admin/                          # Admin panel (URLs: /admin/*)
    layout.tsx                    # Wraps with AuthProvider
    login/page.tsx                # Login page (no route guard)
    (protected)/                  # Route guard + admin shell
      layout.tsx                  # Client-side auth check + sidebar/topbar
      dashboard/page.tsx          # Admin dashboard
      invoices/, estimates/       # List page + new/, edit/, view/ (use ?id= query params)
      service-items/, settings/
```

Marketing pages use the pattern: `page.tsx` (server component with metadata) renders a `*PageContent.tsx`. Page content components are server components; interactivity is isolated in small client components (`InquiryButton`, `Reveal` for scroll fade-ins, Header). The service-areas hub is inlined in its `page.tsx`. Dynamic segments (`[slug]`, `[city]`) are pre-rendered with `dynamicParams = false` + `generateStaticParams` (required by `output: "export"`); `params` is a Promise in Next 16, so `await params` in both `generateMetadata` and the page.

### Admin Authentication (Client-Side)

Auth is fully client-side (required by `output: "export"` static build):

- `src/lib/supabase/client.ts` — Browser-only Supabase client (singleton)
- `src/lib/auth/AuthProvider.tsx` — React context: listens to `onAuthStateChange`, fetches `public.user_profiles` for role
- `src/lib/auth/useAuth.ts` — Hook: `{ user, profile, isLoading, isAdmin, supabase, signOut }`
- `admin/layout.tsx` wraps all admin pages with `<AuthProvider>`
- `admin/(protected)/layout.tsx` acts as client-side route guard: redirects to `/admin/login` if not admin
- Login page lives outside `(protected)/` so it's accessible without auth

No middleware or server-side auth — the static export doesn't support it.

### Guides (Blog)

SEO articles live as Markdown in `src/content/blog/<slug>.md` (slug = URL). Frontmatter: `title`, `seoTitle` (<=60 chars), `description` (50-155 chars, unique), `category` (`garage-doors` | `security-cameras` | `locks-and-lockouts`), `image` (a key from `src/config/images.ts`), optional `service` (a theme service id), `published`/`updated` (YYYY-MM-DD), `keywords` (comma-separated). `src/lib/blog/index.ts` loads them at build time with `node:fs` (server components only - never import it from a client component) and derives the TOC, FAQs, word count, and reading time. `src/components/blog/Markdown.tsx` renders a safe subset: `##`/`###`, paragraphs, `-`/`1.` lists, `>` callouts, `**bold**`, `[links](/path/)`, `![caption](imageKey)`, a `## Frequently asked questions` section of `### Q` + answer (rendered as an accordion and emitted as FAQPage JSON-LD), and a `[[cta]]` line for a quote card. Use a different inline image than the header `image`.

Routes: `/blog/` (index, CollectionPage), `/blog/category/[category]/`, `/blog/[slug]/` (BlogPosting + FAQPage + 3-item breadcrumbs, og:type=article), `/blog/rss.xml`, and per-article 1200x630 share images at `/og/blog/<slug>.png` (`src/app/og/blog/[image]/route.tsx`, force-static). `sitemap.ts` adds all blog URLs with `lastmod` from `updated` and lists each page's photos as `<image:image>` entries (header + inline guide photos). Static pages use `SITE_CONTENT_UPDATED` in `src/lib/seo.ts` for `lastmod`; bump it when page content changes. Sitemap image URLs must not contain `&` (Next.js doesn't escape them). `scripts/verify-seo.mjs` discovers guides from the Markdown files automatically. Guides are linked from the header ("Guides"), footer ("Popular guides"), home page, service pages (`getPostsForService`), and city pages via `GuidesStrip`.

### Website Inquiries (Firebase)

"Get a free quote" buttons open `InquiryForm` (service → details → contact). Schema and option lists: `src/lib/inquiries/schema.ts`. On submit, `src/lib/inquiries/submit.ts` (lazy-loaded with the Firebase SDK) adds a document to the Firestore `inquiries` collection (project `jd-home-services-prod`, database `(default)` in `northamerica-northeast2`) via `src/lib/firebase/client.ts` (config from `NEXT_PUBLIC_FIREBASE_*`). `firestore.rules` only allows `create` with the exact field set, so keep the rules, `schema.ts`, and `submit.ts` in sync and redeploy with `firebase deploy --only firestore:rules`. A honeypot field (`company`) silently drops bot submissions. Notifications for new inquiries are handled outside this repo by an n8n workflow that signs in as the Firebase Auth user in `isLeadBot()` (see `firestore.rules`), posts `status: "new"` inquiries to Telegram, and marks them `notified`. n8n is also used by the admin panel to email invoice/estimate PDFs. Setup notes: `docs/firebase-setup.md`.

### SEO & Structured Data

- `src/lib/seo.ts` - `SITE_URL`, `absoluteUrl()`, `buildMetadata({ title, description, path })` (absolute title, canonical, OG, Twitter), `SITE_ROUTES` (feeds `sitemap.ts` - add every new indexable route here), `coreCities`, `getService()`, `getCity()`
- `src/lib/jsonld.ts` - JSON-LD builders (`businessNode`, `websiteNode`, `serviceNode`, `faqPageNode`, `breadcrumbNode`, `withGraph`), rendered with `<JsonLd data={withGraph([...])} />` from `src/components/seo/` as the first child of a page fragment. The site-wide business/website graph is emitted once in `(public)/layout.tsx`; each page adds its own `BreadcrumbList` (service pages also add `Service` + `FAQPage`)
- `src/app/sitemap.ts`, `src/app/robots.ts`, and `src/app/og-image.png/route.tsx` must keep `export const dynamic = "force-static"` to build under `output: "export"`
- `theme.serviceCities` (14 cities; `core: true` cities get a `/service-areas/[city]/` page and carry a `blurb`) plus per-service `seo` (`title`, `description`, `h1`), `sections`, and `faqs` (at least 5; the garage hub has 7, locksmith 6) on `theme.services.categories` drive the service and city pages. Adding a service also means adding its path to `SERVICE_PATHS` in `scripts/verify-seo.mjs`. Optional props on some `as const` tuple entries (`badge`, `blurb`) produce union types - widen with a typed assignment (`const cities: readonly ServiceCity[] = theme.serviceCities`) or narrow with `"badge" in service`
- The business node is typed `["HomeAndConstructionBusiness", "Locksmith"]`
- Garage sub-service pages: copy, slugs, FAQs and related guides live in `src/content/garageServices.ts` (`GARAGE_SUB_SERVICES`, `HUB_SLUG`, `HUB_FEATURE_LINKS`; it may import only types, never `@/lib/seo` or `@/lib/jsonld`, to avoid an ESM cycle). They share `/services/[slug]/` with the four services (`getService()` first, then `getSubService()`); JSON-LD is `subServiceNode` (`isRelatedTo` the hub's `#service`) + `FAQPage` + a 4-item `BreadcrumbList` (Home › Services › hub › page). The hub's `Service` node carries a `hasOfferCatalog` of the three. The three hub feature strings ("New garage door installation and replacement", "Garage door opener installation and repair", "Broken spring and cable replacement") are linked via `HUB_FEATURE_LINKS`, so keep them byte-identical in theme.ts
- Shared helpers for the service pages: `RichText` (renders `[anchor](/path/)` markers in copy as `next/link` anchors) and `ServiceLinkCard` live in `src/components/ui/` but are imported by path, not from the ui barrel, because they call `assertInternalHref()` in `src/lib/seo.ts`, which reads the guides from disk (server-only) and fails the build on a broken or slash-less internal link
- City pages: unique copy per core city lives in `src/content/cities/<slug>.ts` (type `CityPageCopy` in `types.ts`, registry `CITY_PAGES`/`getCityPage()` in `index.ts`): seo, H1, intro, a city-only `localAngle` H2, garage/cameras/locks sections, neighbourhoods (prose first, then 5-10 name chips), 4-5 city FAQs (FAQPage JSON-LD), and 3 guide slugs. Never share sentences between city pages or with service pages
- `SiteRoute.updated` (optional ISO date) sets a route's sitemap `<lastmod>`; it defaults to `SITE_CONTENT_UPDATED`. Set it on a route when that page's main content changes
- Header nav: "Garage Doors" is a real link to the hub plus a separate chevron `<button aria-expanded aria-controls>`; the dropdown sub-lists (garage + "More") are always rendered and shown with visibility + a CSS transition, never mounted on open, so their links stay crawlable. Escape closes and returns focus to the toggle; blur outside the item closes. The footer lists the three sub-pages under the garage link
- One search intent per page (do not let two pages chase the same phrase):
  - `/` - "garage door company/contractor Oshawa" + brand (title = `theme.seo.defaultTitle`)
  - `/services/garage-door-repair-installation/` - the only page targeting "garage door repair Oshawa" (the only `<title>` containing that phrase)
  - `/services/garage-door-installation/`, `/services/garage-door-opener-installation/`, `/services/garage-door-spring-repair/` - their transactional intents (installation/replacement, openers, springs and cables)
  - `/services/locksmith/` - "locksmith Oshawa" via lock changes, rekeying, landlords and storefronts (no 24/7 or emergency locksmith intent)
  - `/service-areas/oshawa/` - Oshawa-wide multi-service home-base page; its H1 must NOT contain "Garage Door Repair", and it links to the hub
  - other city pages - "{City} garage door repair & installation" with locksmith and camera H2s; `/service-areas/` - "garage door repair Durham Region" plus the Clarington, Port Perry and Uxbridge copy
- Link labels: "All garage door repairs" or "garage door repair in Oshawa" point to the hub; "New garage door installation", "Garage door opener installation & repair" and "Garage door spring & cable repair" point to the sub-pages. Link text containing "installation" never points to the hub. Never use "click here"/"learn more" or a bare keyword as link text
- Write internal hrefs with trailing slashes (`/services/locksmith/`, `/service-areas/`) to match `trailingSlash: true`
- Never emit `AggregateRating`/`Review` schema from on-site testimonials (self-serving reviews violate Google's structured-data guidelines); reviews belong on a Google Business Profile
- Content rules: Canadian English; no invented business facts (prices, years in business, customer counts, licence numbers, street address); city pages must not quote response-time minutes
  - No digits followed by `%` or by years in new copy ("satisfaction guaranteed", not "100% satisfaction guaranteed"); no warranty, certification, insurance or product-brand claims; no response-time promises ("we confirm a realistic arrival window when you call" is fine on service pages)
  - 24/7, emergency, after-hours, overnight and holiday wording only in car-lockout copy; garage, camera and locksmith work is regular hours (every day 10 AM-7 PM)
  - Locksmith scope: lock changes, rekeying, deadbolt/knob/lever/entry hardware, lock repair and alignment, and security upgrades after a move-in or tenant turnover, for homes, rentals, offices and storefronts. Never mention house/home/business lockouts, key cutting or duplication, car keys, fobs, transponders, ignitions, safes, access control, master-key systems, high-security locks or smart-lock installation. Keying several locks to one key is "often possible, depending on the key type"
  - Garage scope: residential doors and openers, plus "doors at small commercial properties such as storefronts and stock rooms" at most. Never overhead, loading-dock, dock, rolling-steel, roll-up, industrial, commercial-sectional or warehouse doors

## Deployment

- **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) - triggers on push to `main`
- Build produces static files in `out/` with `trailingSlash: true` for GitHub Pages compatibility
- Images are unoptimized (`images.unoptimized: true`) since there's no server
- Custom domain configured via `public/CNAME` (www.jdhomeservices.ca). The old domain jdhomesolutions.com is a parked lander, not this site; it should 301 to www.jdhomeservices.ca
- Docker setup exists (`Dockerfile` + `docker-compose.yml`) mapping port 5006 -> 3000
- **Environment variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the six `NEXT_PUBLIC_FIREBASE_*` values) are injected from GitHub Secrets during build. For local dev, use `.env.local` (gitignored). See `.env.example` for required vars. `npm run build` fails without the Supabase vars (admin pages create the client at prerender); placeholder values are enough for a local build.
- **Firestore rules** deploy separately with the Firebase CLI: `firebase deploy --only firestore:rules` (see `docs/firebase-setup.md`).
- Optional SEO/analytics vars: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 tag renders only when set) and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (Search Console meta tag). Both are read at build time, so they must be GitHub Secrets too.
- Google Tag Manager container `GTM-5Q937BVV` lives in `theme.analytics.gtmId` and loads on every page by default (`NEXT_PUBLIC_GTM_ID` overrides it; `theme.features.analytics: false` disables all tags). Configure GA4 inside GTM rather than also setting `NEXT_PUBLIC_GA_MEASUREMENT_ID`, which would double-count pageviews.

## Supabase Backend

### Shared Database - Schema Isolation

This project shares a Supabase instance with **quickmart** (a separate app). Each app is isolated by schema:

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | quickmart | Products, transactions, shift reports, etc. |
| `jdhome` | JD Home Services | All JDhome tables (admin panel, services, bookings, etc.) |
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

- Fonts: Manrope (headings, `--font-manrope`) and Inter (body), loaded via `next/font/google`
- CSS utility function `cn()` from `src/lib/utils.ts` wraps `clsx` for conditional class merging
- Inline styles reference CSS variables directly (e.g., `style={{color: "var(--accent-teal)"}}`)
- Global CSS classes (`.btn`, `.card`, `.input`, `.section`, `.container`) are defined in `globals.css` alongside Tailwind
