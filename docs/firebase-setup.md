# Firebase setup (website inquiries + admin panel)

When someone submits **Get a free quote** on the website, the browser saves the request to **Cloud Firestore** in the `inquiries` collection of the `jd-home-services-prod` project. Notifications about new inquiries are handled separately (not part of this repo): an n8n workflow signs in as the Firebase Auth user `n8n-leads-bot@jd-home-services-prod.firebaseapp.com`, posts `status: "new"` inquiries to Telegram, then sets `status: "notified"`, `notifiedAt` and `telegramMessageId`. `firestore.rules` lets only that user read inquiries and change those three fields.

## How it's wired

- Web config: `NEXT_PUBLIC_FIREBASE_*` in `.env.local` (local) and GitHub Actions secrets (production).
- Client: `src/lib/firebase/client.ts`; write logic: `src/lib/inquiries/submit.ts`; form fields: `src/lib/inquiries/schema.ts`.
- Security: `firestore.rules` lets the public **create** well-formed inquiries only. Nobody can read, edit, or delete them from a browser. View them in the Firebase console.
- Database: `(default)` in `northamerica-northeast2` (Toronto).

> The Firebase web config values are public identifiers, not secrets. Security comes from `firestore.rules`.

## Deploying rule changes

From `JDhome/` with the Firebase CLI logged in:

```bash
firebase deploy --only firestore:rules
```

Keep `firestore.rules`, `schema.ts`, and `submit.ts` in sync whenever a form field is added or renamed, and redeploy the rules.

## Document shape

`service, serviceLabel, details{garageIssue?, propertyType?, cameraCount?, cameraFeatures?}, city, timing, message, name, phone, email, preferredContact, page, status: "new", createdAt`

## Reading inquiries

Firebase console → Firestore Database → `inquiries`. Sort by `createdAt`. You can change `status` by hand (e.g. to `contacted`) to keep track.

## If submissions fail

The form shows a friendly "please call us" message and logs the error in the browser console. Common causes:

- `NEXT_PUBLIC_FIREBASE_*` values missing from the build (check GitHub secrets)
- Rules not deployed, or a field added to the form without updating `firestore.rules`

---

## Admin panel (Firestore + Firebase Auth)

Since 2026-10-29 the admin panel (`/admin`) stores everything in the same Firebase project: collections `admins`, `clients`, `invoices`, `invoiceFiles`, `estimates`, `serviceItems`, `settings`, `counters`, `shared` (reference: CLAUDE.md › Firebase Backend). The project stays on the free Spark plan.

### Admin users

1. Firebase console → **Authentication → Sign-in method**: Email/Password enabled; **Settings → User actions**: public sign-up **disabled**.
2. **Authentication → Users → Add user** for each admin (email + password).
3. **Firestore → `admins` collection → Add document** with the user's UID as the document id and fields `email` (string) and optionally `username` (string). Without this document a login succeeds but the panel shows "no admin access".

The import script (`scripts/migrate/import-firestore.mjs`) creates the `admins` docs itself when the Auth users already exist.

### Rules

```bash
firebase deploy --only firestore:rules
```

### Local development with the emulators

```bash
npx firebase-tools@13 emulators:start --only auth,firestore --project jd-home-services-prod
```

(`npm run emulators` uses the globally installed CLI, which needs Java 21.) In a second terminal: `npm run dev:emulator`. Seed the emulators with real data:

```bash
node scripts/migrate/import-firestore.mjs "~/Desktop/projects/Info JDHomes/migration-export-2026-10-29"
```

It creates the three admin users in the Auth emulator and writes their test passwords to `emulator-admins.local.json` next to the export. Emulator data is discarded when the emulators stop.

### Production import / verify

```bash
node scripts/migrate/import-firestore.mjs <export-dir> --prod            # writes (idempotent)
node scripts/migrate/import-firestore.mjs <export-dir> --prod --verify-only
```

Authenticates with `gcloud auth print-access-token` (the Google account must own the Firebase project) or `FIREBASE_ACCESS_TOKEN`.
