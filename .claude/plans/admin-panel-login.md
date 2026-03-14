# Plan: Admin Panel with Login for JDhome

**Status: EXECUTED**

## Context

JDhome needs an admin panel at `/admin` with login. The app shares a Supabase instance with quickmart — quickmart uses `public` schema, JDhome uses `jdhome` schema. Auth tables (`auth.users`, `public.user_profiles`) are shared. An admin user (`jaswanthtata@gmail.com`, role: `admin`) already exists.

**Constraint:** Keep `output: "export"` and GitHub Pages deployment. This means no middleware, no server-side auth, no API routes. All auth is **client-side** using Supabase browser client + React route guards.

---

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

Only the browser client — no `@supabase/ssr` needed since there's no server runtime.

---

## Step 2: Environment Variables

Create `.env.local` (already gitignored by `.gitignore` line `.env*`):
```
NEXT_PUBLIC_SUPABASE_URL=<same as quickmart>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same as quickmart>
```

Create `.env.example` (committed, for documentation):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Update `.github/workflows/deploy.yml` to inject env vars from GitHub Secrets during build:
```yaml
- name: Build
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## Step 3: Supabase Client + Auth Utilities (4 new files)

### 3a. `src/lib/supabase/client.ts`
Browser-only Supabase client using `createClient` from `@supabase/supabase-js`.

### 3b. `src/lib/auth/AuthProvider.tsx` (client component)
React context provider that:
- Creates Supabase client once
- Listens to `onAuthStateChange` for session changes
- On session, fetches `public.user_profiles` to get role
- Provides: `{ user, profile, isLoading, supabase }`

### 3c. `src/lib/auth/useAuth.ts`
Hook consuming `AuthContext`. Exposes `{ user, profile, isLoading, isAdmin, supabase, signOut }`.

### 3d. `src/lib/auth/index.ts`
Barrel export for AuthProvider, useAuth.

---

## Step 4: Route Reorganization

### Previous structure:
```
src/app/
  layout.tsx          # Had Header + Footer + MobileCallButton
  page.tsx            # Home
  not-found.tsx
  about/
  contact/
  services/
```

### New structure (implemented):
```
src/app/
  layout.tsx                          # ROOT: html/body/fonts/globals ONLY
  not-found.tsx                       # Stays (client component, renders clean 404 card)

  (public)/                           # Marketing pages (URLs unchanged)
    layout.tsx                        # Header + Footer + MobileCallButton wrapper
    page.tsx                          # Home (/)
    about/                            # /about
    contact/                          # /contact
    services/                         # /services

  admin/
    layout.tsx                        # Wraps children with AuthProvider (no auth check)
    login/page.tsx                    # Login form (client component, Suspense-wrapped)
    (protected)/
      layout.tsx                     # Client-side route guard + admin shell (sidebar, topbar)
      page.tsx                       # Client redirect to /admin/dashboard
      dashboard/page.tsx             # Admin dashboard
```

### Key decisions:
- `admin/layout.tsx` wraps ALL admin pages with `<AuthProvider>` — provides auth context
- `admin/login/page.tsx` is OUTSIDE `(protected)/` — no route guard, uses `useAuth` for sign-in only
- `admin/(protected)/layout.tsx` is a client component that checks `useAuth()` — if not admin, redirects to `/admin/login`; if loading, shows spinner; if authed, renders admin shell + children
- Route groups don't affect URLs: `(public)/page.tsx` = `/`, `(protected)/dashboard/page.tsx` = `/admin/dashboard`
- Login page uses `useSearchParams()` wrapped in `<Suspense>` (required by Next.js static export)

---

## Step 5: File Changes Detail

### 5a. Modified `src/app/layout.tsx`
**Removed:** Header, Footer, MobileCallButton imports and rendering, `<main>` wrapper.
**Kept:** Font loading (Inter, Poppins), metadata export, JSON-LD script, `<html>`, `<body>` with font classes.
Body renders just `{children}`.

### 5b. Created `src/app/(public)/layout.tsx`
Wraps children with Header + `<main>` + Footer + MobileCallButton (moved from root layout).

### 5c. Moved marketing pages into `(public)/`
- `src/app/page.tsx` → `src/app/(public)/page.tsx`
- `src/app/about/` → `src/app/(public)/about/`
- `src/app/contact/` → `src/app/(public)/contact/`
- `src/app/services/` → `src/app/(public)/services/`

### 5d. `src/app/not-found.tsx` — stayed at root
Already a client component. Renders clean 404 card without Header/Footer.

### 5e. Created `src/app/admin/layout.tsx`
Server component (renders at build time). Sets metadata (`robots: noindex`). Wraps children with `<AuthProvider>`.

### 5f. Created `src/app/admin/login/page.tsx` (client component)
- Branded login: navy gradient bg, centered card with JD logo mark
- Email + password fields using existing `.input` CSS class from `globals.css`
- Validates with `zod` + `react-hook-form`
- Uses `useAuth()` to get supabase client, calls `supabase.auth.signInWithPassword()`
- On success: `router.push('/admin/dashboard')`
- If already authenticated: auto-redirect to `/admin/dashboard`
- Shows error for `?error=unauthorized` query param
- No signup option — admin accounts created via Supabase only
- Inner `LoginForm` component wrapped in `<Suspense>` for `useSearchParams()`

### 5g. Created `src/app/admin/(protected)/layout.tsx` (client component)
- Uses `useAuth()` hook
- If `isLoading` → render full-page spinner
- If `!user` or not admin → `router.replace('/admin/login')`, render null
- Otherwise → render admin shell: top bar (JD logo + "Admin Panel" + username + logout) + sidebar + content area

### 5h. Created `src/components/admin/LogoutButton.tsx` (client component)
Calls `supabase.auth.signOut()` via `useAuth()`, then `router.push('/admin/login')`.

### 5i. Created `src/app/admin/(protected)/page.tsx` (client component)
Client-side redirect: `useEffect(() => router.replace('/admin/dashboard'), [])`.

### 5j. Created `src/app/admin/(protected)/dashboard/page.tsx` (client component)
- Welcome message with admin's name (from `useAuth().profile`)
- Stat cards showing services count, service areas, testimonials, phone inquiries (placeholder)
- Website status section showing site URL, email, phone, service area from theme config

---

## Step 6: Deploy Workflow Updated

Modified `.github/workflows/deploy.yml`:
- Added env vars from GitHub Secrets to the build step

**User must add these secrets in GitHub repo settings:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 7: CLAUDE.md Updated

Added:
- Admin panel route structure and auth flow
- Client-side auth pattern (no middleware, route guards)
- `src/components/admin/` in component organization
- Supabase client-only setup description
- Environment variable deployment notes

---

## Files Summary

**New files created (13):**
1. `src/lib/supabase/client.ts` — Supabase browser client (singleton)
2. `src/lib/auth/AuthProvider.tsx` — Auth context provider
3. `src/lib/auth/useAuth.ts` — Auth hook
4. `src/lib/auth/index.ts` — Barrel export
5. `src/app/(public)/layout.tsx` — Marketing shell
6. `src/app/admin/layout.tsx` — Admin base layout + AuthProvider
7. `src/app/admin/login/page.tsx` — Login page with Suspense
8. `src/app/admin/(protected)/layout.tsx` — Route guard + admin shell
9. `src/app/admin/(protected)/page.tsx` — Redirect to dashboard
10. `src/app/admin/(protected)/dashboard/page.tsx` — Dashboard
11. `src/components/admin/LogoutButton.tsx` — Logout button
12. `.env.local` — Environment variables (gitignored)
13. `.env.example` — Env var template

**Modified files (3):**
1. `src/app/layout.tsx` — Stripped Header/Footer, kept html/body shell
2. `.github/workflows/deploy.yml` — Added env vars to build step
3. `CLAUDE.md` — Added admin panel docs

**Moved files (4 directories):**
1. `src/app/page.tsx` → `src/app/(public)/page.tsx`
2. `src/app/about/` → `src/app/(public)/about/`
3. `src/app/contact/` → `src/app/(public)/contact/`
4. `src/app/services/` → `src/app/(public)/services/`

**No database changes** — reuses existing `auth.users` + `public.user_profiles`.

**No changes to:** `next.config.ts`, `package.json` start script, `Dockerfile`, `docker-compose.yml`, any quickmart tables.

---

## Build Verification

Build passed successfully. All pages generated as static content:
```
Route (app)
├ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /admin
├ ○ /admin/dashboard
├ ○ /admin/login
├ ○ /contact
└ ○ /services
```
