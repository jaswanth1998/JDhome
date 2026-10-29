# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

JD Home Services (jdhomesolutions.com / www.jdhomeservices.ca) - a business website + admin panel for a locksmith and smart home security company in Oshawa, Ontario. Frontend deployed to GitHub Pages; admin panel + inquiries on Firebase (Firestore + Auth, free plan). CLAUDE.md is the maintained, more detailed version of this file.

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

Firebase Auth email/password + an `admins/{uid}` Firestore document; see the **Firebase Backend** section in CLAUDE.md. `useAuth()` returns `{ user, profile, isLoading, isAdmin, signIn, signOut }`; `admin/(protected)/layout.tsx` is the client-side route guard.

### Contact Form

The contact form (`src/app/contact/ContactPageContent.tsx`) submits to an external webhook endpoint. Form validation uses zod schemas with `@hookform/resolvers`.

## Deployment

- **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) - triggers on push to `main`
- Build produces static files in `out/` with `trailingSlash: true` for GitHub Pages compatibility
- Images are unoptimized (`images.unoptimized: true`) since there's no server
- Custom domain configured via `public/CNAME`
- Docker setup exists (`Dockerfile` + `docker-compose.yml`) mapping port 5006 -> 3000
- **Environment variables** (the six `NEXT_PUBLIC_FIREBASE_*` values) are injected from GitHub Secrets during build. For local dev, use `.env.local` (gitignored). See `.env.example` for required vars.

## Firebase Backend

The admin panel data (clients, invoices, estimates, service items, settings, share links) and the website inquiries live in Firestore project `jd-home-services-prod` (free Spark plan: no Cloud Storage, no Cloud Functions). The data layer is `src/lib/db/`, rules are in `firestore.rules`, emulators via `npm run emulators` + `npm run dev:emulator`. Full reference: **CLAUDE.md › Firebase Backend**. Supabase was retired on 2026-10-29.

## Key Conventions

- Fonts: Poppins (headings) and Inter (body), loaded via `next/font/google`
- CSS utility function `cn()` from `src/lib/utils.ts` wraps `clsx` for conditional class merging
- Inline styles reference CSS variables directly (e.g., `style={{color: "var(--accent-teal)"}}`)
- Global CSS classes (`.btn`, `.card`, `.input`, `.section`, `.container`) are defined in `globals.css` alongside Tailwind
