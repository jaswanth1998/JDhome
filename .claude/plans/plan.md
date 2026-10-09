# Service Focus Migration Plan

## Goal
Refactor the website so it offers only these services:
1. Locksmith
2. Car Lockout
3. Garage Door Repair & Installation

---

## Current-State Summary
Service content is centralized in `src/config/theme.ts` and reused across:
- Home services grid
- Services page
- Header + footer service links
- Contact form dropdown
- SEO metadata + structured data
- Admin dashboard “Services Offered” count

Current services include extra items (smart locks, high-security systems, rekeying, etc.), so this needs a full content + SEO + navigation pass.

---

## Phase 1 — Core service model update (single source of truth)
**File:** `src/config/theme.ts`

- Replace `theme.services.categories` with exactly 3 entries:
  - `locksmith`
  - `car-lockout`
  - `garage-door-repair-installation`
- Update each entry with:
  - `name`, `shortDescription`, `description`, `features`, `icon`, `color`
- Remove now-unused service-specific arrays if no longer needed:
  - `smartLockBrands`
  - `highSecurityBrands`

✅ Most UI sections mapping over categories will auto-update.

---

## Phase 2 — Navigation and internal links
**Files:**
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`

- Replace dropdown/footer service links with only the 3 target services.
- Update anchor links to new IDs:
  - `/services#locksmith`
  - `/services#car-lockout`
  - `/services#garage-door-repair-installation`

---

## Phase 3 — Services pages + homepage messaging
**Files:**
- `src/components/sections/ServicesGrid.tsx`
- `src/app/(public)/services/ServicesPageContent.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/FinalCTA.tsx`
- `src/components/sections/WhyChooseUs.tsx`
- `src/components/sections/ServiceArea.tsx`
- `src/app/(public)/about/AboutPageContent.tsx`

Actions:
- Rewrite headlines/subheadlines to align with the 3-service business focus.
- Remove logic tied to deleted services (`smart-locks`, `high-security` conditional blocks).
- Decide what to do with `SmartLockSpotlight`:
  - Remove it from homepage, or
  - Repurpose to “Car Lockout Rapid Response” / “Garage Door Specialists”.

---

## Phase 4 — Contact form and lead capture
**File:** `src/app/(public)/contact/ContactPageContent.tsx`

- Replace `serviceOptions` with only:
  - Locksmith
  - Car Lockout
  - Garage Door Repair & Installation
  - Other (optional)
- Update emergency copy to clarify if emergency applies only to car lockout or all locksmith services.

---

## Phase 5 — SEO + metadata + schema
**Files:**
- `src/config/theme.ts` (`seo.defaultTitle`, `defaultDescription`, `keywords`)
- `src/app/(public)/services/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/layout.tsx` (JSON-LD generated from categories)

Actions:
- Remove outdated SEO mentions (smart locks/high-security/rekeying) unless intentionally retained.
- Ensure structured data (`hasOfferCatalog`) reflects only the 3 services.

---

## Phase 6 — QA and consistency check
- Run checks:
  - `npm run build`
  - `npm run lint`
- Verify:
  - Header/footer links point to valid anchors
  - Contact dropdown matches final services
  - No orphan references to removed service IDs
  - Metadata and schema reflect new service set

---

## Decision Needed Before Implementation
Confirm locksmith scope:
- **Option A:** broad general locksmith (residential/commercial + lock change/rekey)
- **Option B:** narrow locksmith scope only

Once confirmed, implementation can be completed in a single pass on branch `openclaw`.
