---
name: "SEO position lift (Oct 2026)"
description: "Act on the Jul–Oct 2026 Search Console export: one search intent per page (home = garage door company Oshawa, hub = garage door repair Oshawa, three sub-service pages, Oshawa city page = multi-service, areas hub = Durham Region), six genuinely unique city pages, deeper locksmith copy, retargeted blog links, crawlable nav links, an extended verify script, and the off-site Google Business Profile / citation work the owner must do."
status: "completed"
completed_items:
  - "Analysed the Search Console export (19 clicks / ~1,900 impressions / position ~15.7; money queries on page 2–3; city pages near-duplicate; position-1/zero-click rows re-read as local-pack impressions)"
  - "Pulled keyword volumes and SERPs (garage door repair oshawa 210/mo SD 13; locksmith oshawa 880/mo SD 12; local pack dominates both)"
  - "Fixed the local toolchain: root-owned node_modules renamed to node_modules.root-owned.bak, fresh npm ci, backup excluded from git/tsc/eslint"
  - "Plan critiqued by three independent Opus reviewers; accepted changes folded into brief v2 (one intent per page, no neighbourhood chip lists, always-in-DOM nav sub-lists, per-route sitemap dates, verify-script spec)"
  - "Implemented by four Opus agents with disjoint file ownership: hub retargeted + 6 H2 sections + 7 FAQs; /services/garage-door-installation/, /garage-door-opener-installation/, /garage-door-spring-repair/ (700–1,000 words each, 5 FAQs, Service isRelatedTo hub, 4-level breadcrumbs); six city pages rebuilt from src/content/cities/*.ts (localAngle H2, per-service H2s, prose-first places, 4 FAQs + FAQPage); /service-areas/ retitled for Durham Region with Clarington / Port Perry / Uxbridge sections; locksmith 7 sections + 6 FAQs; car lockout and camera sections; home title/H1/links; header disclosure nav; footer + services hub + home links; 10 blog guides retargeted; knowsAbout added and priceRange removed from the business node; SiteRoute.updated; inquiry mapping; ServiceIcon icons; CLAUDE.md"
  - "Two in-workflow verification rounds (script+build, content/facts with web fact-checks, SEO quality, code) plus Opus fix rounds; final consolidated fix list of 17 items applied by an Opus agent; orchestrator render check with Playwright at 390 px and 1280 px (home, hub, spring, installation, opener, locksmith, areas hub, Oshawa, Bowmanville): no overflow, no broken images, no console errors, dropdown and mobile menu and FAQ toggles work"
  - "scripts/verify-seo.mjs extended to 41 checks (sub-service graph, breadcrumb/FAQ parity, link coverage, H1/title targeting rules, uniqueness + Jaccard similarity, content-rule greps, placeholders, sitemap lastmod); final run 41 PASS / 0 WARN / 0 FAIL on a fresh build; tsc clean; ESLint clean on all public-site paths"
notes:
  went_well:
    - "Reviewers caught a real flaw in the draft (home, hub and Oshawa page all targeting 'garage door repair oshawa') and re-read the position-1/zero-click rows as local-pack impressions"
    - "Disjoint file ownership plus pre-scaffolded types let four Opus implementers run in parallel without a single conflicting edit"
    - "The extended verify script turned every content rule into a mechanical check, which is what finally caught 'About 1 minute' and the 24/7 context edge case"
  went_wrong:
    - "Ubersuggest free tier allows 3 reports/day and the PageSpeed Insights API quota was exhausted; no Core Web Vitals numbers this session"
    - "First critique run was derailed by a mid-turn side message ('add node_modules to .gitignore') reaching the subagents; relaunched with the standing request quoted in every prompt"
    - "Workflow subagents were denied `npm run build` by the permission classifier, so in-workflow verification ran against a stale out/ until the orchestrator built; the fix loop could not clear that finding and was stopped after round 2"
    - "The final three-agent verification hit the account session limit (resets 03:30 America/Toronto); the orchestrator performed the final verification in-session instead"
  blockers: []
---

# SEO position lift (October 2026) — completed 2026-10-08, uncommitted on `feature/seo-position-oct-2026`

## Why

Search Console (Web, 2026-07-05 to 2026-10-04) showed the relaunched site being shown (impressions up from ~5/day to ~140/day) but almost never clicked: 19 clicks, nearly all on brand queries. The commercially important pages sat on page 2–3:

| Page | Impr. | Pos. |
|---|---|---|
| /services/garage-door-repair-installation/ | 228 | 27.3 |
| /services/car-lockout/ | 132 | 22.7 |
| /services/locksmith/ | 121 | 13.2 (inflated by other brands' names; target terms 27–34) |
| /service-areas/oshawa/ | 102 | 25.1 |
| /service-areas/ajax/ … /whitby/ | 29–72 | 18–33 |

"garage door repair oshawa" (210 searches/month, difficulty 13) was at position 26; "locksmith oshawa" (880/month) at 27–31. The "position 1–2, zero clicks" rows for Whitby and Port Perry are local-pack (Google Business Profile) impressions credited to the home page, not organic rankings; only the profile can move those.

## What shipped

1. One intent per page. Home = "garage door company Oshawa"; hub = sole owner of "garage door repair Oshawa" (title "Garage Door Repair Oshawa | Springs, Openers | JD Home", ~1,600 words, 7 FAQs incl. a no-number cost answer); sub-pages for installation, openers, springs/cables; Oshawa city page = Oshawa-wide multi-service; /service-areas/ = "garage door repair Durham Region" plus Clarington / Port Perry / Uxbridge copy; other city pages = "{City} garage door repair & installation".
2. Six city pages rebuilt from `src/content/cities/*.ts` with a required local-angle section, per-service H2s, 5–10 documented places introduced in prose, per-city FAQs with FAQPage schema, and a similarity check (Jaccard ≤ 0.25).
3. Locksmith page: Oshawa H1, seven sections on rekeying, lock changes, landlords and storefronts, six FAQs; no 24/7, lockouts, key cutting, safes or access control.
4. Blog links retargeted to the sub-pages (ten guides), every guide still links to the hub.
5. Navigation: "Garage Doors" is a real link plus a disclosure button with an always-rendered sub-list; the same for "More"; footer, services hub and home link to the sub-pages.
6. Schema: sub-service Service nodes `isRelatedTo` the hub; hub Service node lists them; business node gains `knowsAbout` and loses `priceRange`.
7. Sitemap: per-route `updated` dates (2026-10-07 on changed routes; privacy/about/blog unchanged).
8. `scripts/verify-seo.mjs` extended to 41 checks; CLAUDE.md documents the new structure and rules.

Verification: `npm run build` (92 pages), `npm run verify:seo` 41/41 PASS, tsc clean, ESLint clean on public paths; Playwright render checks at 390 px and 1280 px.

## Owner actions (off-site; these decide the local pack)

1. **Find and optimise the Google Business Profile** (search the phone number on Google Maps; claim if someone else created it; expect video verification). Primary category garage door supplier/repair, secondary camera installer then Locksmith; hours 10–19 every day; 24/7 lockout line only in the description/services; UTM-tagged website and booking links; ask every customer for a review; read GBP Performance monthly; then add the Maps URL to `sameAs` in `src/lib/jsonld.ts`.
2. **Confirm attribution in Search Console**: filter Query = "garage door service whitby" → Pages tab (expected: /). Repeat for the Oshawa repair queries. Re-export in 6–8 weeks and compare positions for the hub, sub-pages and city pages.
3. **Citations in order**: HomeStars, Yelp, YellowPages.ca, 411.ca, BBB, Bing Places, Apple Business Connect, Nextdoor, Facebook/Instagram; identical name/phone/website, no street address.
4. **Local links**: Greater Oshawa Chamber, Whitby Chamber, Ajax-Pickering Board of Trade, Clarington Board of Trade; partner links only where a partners page exists. Consider Google Local Services Ads.
5. **Answer before more pages**: entry-door repair? commercial overhead doors? house lockouts / key cutting / smart locks? PR target `main` (deploys) or `dev`?
6. **After deploy**: resubmit the sitemap; URL Inspection on the hub, three sub-pages, six city pages and /service-areas/.
7. **Lower priority**: apex `jdhomeservices.ca` 301s through http before https (point A records at GitHub Pages); parked `jdhomesolutions.com` should 301 to the site; `sudo rm -rf node_modules.root-owned.bak` when convenient.
8. **Later code**: optional review link in the paid-invoice email; preload tuning for the Unsplash hero/card images (pre-existing "preloaded but not used" warnings).

## Deliberate exclusions

- No Port Perry / Uxbridge / Clarington pages (covered on /service-areas/), no commercial garage door or entry-door page, no city × service pages, no sitemap priority tuning, no robots changes.
- No AggregateRating/Review schema; no invented prices, years, counts, licences, brands, warranties or response times; no 24/7 wording outside car lockouts.
- Pre-existing ESLint errors in three admin files (SignaturePad, ServiceItemsContent, dashboard) are out of scope.
