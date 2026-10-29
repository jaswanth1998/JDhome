#!/usr/bin/env node
/**
 * Create a Firebase Auth admin login and email a set-password link.
 *
 *   node scripts/migrate/create-admin.mjs <email> [display name]
 *
 * Run it yourself (it uses your `gcloud auth print-access-token` identity, which
 * owns the Firebase project). The user is created with a random password nobody
 * sees; Firebase then emails <email> a password-reset link so you choose your own.
 * If the user already exists, only the reset email is sent.
 *
 * Afterwards run the importer once more to write the `admins/{uid}` document:
 *   node scripts/migrate/import-firestore.mjs "<export-dir>" --prod
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const [email, ...nameParts] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error("usage: create-admin.mjs <email> [display name]");
  process.exit(2);
}
const displayName = nameParts.join(" ") || undefined;
const PROJECT = process.env.FIREBASE_PROJECT_ID || "jd-home-services-prod";

// Web API key (public identifier) from .env.local — needed for the reset email.
const envFile = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envFile, "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY missing from .env.local");

const token = process.env.FIREBASE_ACCESS_TOKEN || execSync("gcloud auth print-access-token").toString().trim();
const BASE = "https://identitytoolkit.googleapis.com/v1";

async function call(url, body, auth = true) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${token}`, "x-goog-user-project": PROJECT } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

// 1. Create the user (admin API, bypasses the "sign-up disabled" setting).
const create = await call(`${BASE}/projects/${PROJECT}/accounts`, {
  email,
  password: randomBytes(24).toString("base64url"),
  emailVerified: true,
  ...(displayName ? { displayName } : {}),
});
if (create.ok) {
  console.log(`created ${email} (uid ${create.json.localId})`);
} else if (create.json?.error?.message?.startsWith("EMAIL_EXISTS") || create.json?.error?.message?.includes("DUPLICATE_EMAIL")) {
  console.log(`${email} already exists — sending a reset link only`);
} else {
  console.error("create failed:", JSON.stringify(create.json?.error ?? create.json));
  process.exit(1);
}

// 2. Email a set-password link (public endpoint; Firebase sends the email).
const reset = await call(`${BASE}/accounts:sendOobCode?key=${apiKey}`, { requestType: "PASSWORD_RESET", email }, false);
if (reset.ok) {
  console.log(`password-reset email sent to ${email} — open it and choose a password`);
} else {
  console.error("reset email failed:", JSON.stringify(reset.json?.error ?? reset.json));
  console.error("You can still set the password in Firebase console > Authentication > Users.");
  process.exit(1);
}
