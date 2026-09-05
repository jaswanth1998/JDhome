---
name: "SEO Improvements"
description: "Technical SEO foundation (metadata, canonicals, sitemap/robots, OG image, JSON-LD graph, analytics hooks), per-service and service-area landing pages with FAQs, and perf/a11y hygiene for the static-export marketing site"
status: "completed"
completed_items:
  - "Phase 1A: src/lib/seo.ts (buildMetadata, SITE_ROUTES), src/lib/jsonld.ts (@graph Locksmith + WebSite, Service, FAQPage, BreadcrumbList), JsonLd + GoogleAnalytics components, theme.serviceCities/geo/logo/seo, root layout (lang en-CA, viewport, env-gated verification, twitter site), public layout (skip link, main#main, site graph), per-page metadata + breadcrumbs, sitemap.ts, robots.ts, og-image.png route, share/layout.tsx noindex, .env.example + deploy.yml vars"
  - "Phase 1C: removed Google Fonts @import and rewired --font-heading/--font-body to next/font variables, prefers-reduced-motion CSS + MotionProvider, SectionHeading as prop, partner img dimensions/lazy, contact h4 -> h3, npm uninstall next-seo (lockfile only), deleted 5 Next starter SVGs + orphan fedex.svg"
  - "Phase 2B: /services/[slug]/ pages (unique metadata, h1, FAQ x5, areas, related services, Service+FAQPage+BreadcrumbList JSON-LD), /service-areas/ hub + 6 core city pages, Breadcrumbs component, nav/footer/card/chip links to new URLs, SmartLockSpotlight -> CarLockoutSpotlight, About 'Home Solutions' -> 'Home Services', contact h1, CLAUDE.md docs"
  - "Orchestrator fixes: force-static on sitemap/robots (Next 16 requirement), heading colour moved to @layer base + text-white on dark-section headings, Tailwind v3 bg-opacity-* converted to /10 modifiers, removed React-ignored !important inline styles, Poppins weights trimmed to 500/600/700, .gitignore !.env.example, city booking paragraph varied per city"
  - "Phase 3D: scripts/verify-seo.mjs (npm run verify:seo) - 30 checks, all PASS on 2026-09-05"
notes:
  went_well:
    - "Disjoint file ownership let Agents A and C run in parallel without conflicts"
    - "Verifier script is re-runnable: npm run build && npm run verify:seo"
    - "Computed-style contrast sweep in a headless browser caught a regression (orange-on-orange emergency box) before signoff"
  went_wrong:
    - "Plan assumed Next 16 metadata routes were exempt from force-static; first build failed until sitemap.ts/robots.ts exported dynamic = 'force-static'"
    - "Verifier agent's first run was cut off by an API rate limit and had to be relaunched"
    - "Layering the heading colour exposed pre-existing Tailwind v3 bg-opacity-* no-ops; all 12 were converted to v4 syntax"
  blockers:
    - "node_modules is root-owned on this machine; npm uninstall had to run with --package-lock-only (node_modules/next-seo remains on disk, harmless)"
    - "3 pre-existing ESLint errors in admin files (React Compiler rules) remain out of scope; npm run lint exits 1 because of them"
---

# SEO Improvements (completed 2026-09-05)

## Outcome

15 indexable public URLs (was 5): home, services hub, 3 service pages, service-areas hub, 6 core city pages, about, contact, privacy. Every page has a unique title (<=60 chars), description (<=155), canonical with trailing slash, Open Graph + Twitter cards pointing at the generated `/og-image.png` (1200x630), `lang="en-CA"`, theme-color, skip link, and a JSON-LD `@graph` (Locksmith + WebSite) plus page-level BreadcrumbList / Service / FAQPage where relevant. `sitemap.xml` lists exactly those 15 URLs; `robots.txt` disallows `/admin/` and `/share/`; `/share` and `/admin/*` are noindex. GA4 and Search Console verification are env-gated.

## Deliberate exclusions

- No AggregateRating/Review markup from on-site testimonials (Google guideline violation for self-serving reviews). Use a Google Business Profile for reviews.
- No street address / postal code in schema (business publishes city-level only).
- No cookie banner (privacy policy already discloses analytics).
- Only 6 city pages; the other 8 cities are listed on the hub to avoid thin doorway pages.

## Known trade-offs

- `/service-areas/oshawa/` overlaps the homepage's "locksmith Oshawa" target; mitigated by a city-first title and "home base" framing.
- `twitter:site`/`creator` emit `@jdhomesolutions`; drop them from `src/lib/seo.ts` if no X account exists.
- Brand teal/orange buttons and labels on white fail WCAG AA contrast (pre-existing brand choice, ratio ~2.2-2.4).
- Heading font-size rules in globals.css remain unlayered by design, so `text-*` size utilities on headings still do not apply (use inline style or a global rule).

## Owner follow-ups

1. Review the generated copy: FAQ answers in `src/config/theme.ts` and the 6 city pages.
2. Add GitHub secrets `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
3. Commit and push to `main` to deploy, then submit `https://www.jdhomeservices.ca/sitemap.xml` in Google Search Console.
4. Claim a Google Business Profile and add its URL to `sameAs` in `src/lib/jsonld.ts`.
5. Optionally `sudo chown -R $(whoami) node_modules` so npm installs work again locally.

## Verification

`npm run lint` (3 pre-existing admin errors only), `npm run build` (35 routes), `npm run verify:seo` (30 PASS / 0 WARN / 0 FAIL), headless-browser contrast sweep over 11 pages, manual screenshots of `/services/` and `/contact/`.
