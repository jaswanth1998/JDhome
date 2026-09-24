# Website inquiries: Firebase setup

When someone submits **Get a free quote** on the website, the browser saves the request to **Cloud Firestore** in the `inquiries` collection of the `jd-home-services-prod` project. Notifications about new inquiries are handled separately (not part of this repo).

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
