#!/usr/bin/env node
/**
 * Import the Supabase export (JSON files produced on 2026-10-29) into Firestore.
 *
 *   node scripts/migrate/import-firestore.mjs <export-dir>            # local emulators
 *   node scripts/migrate/import-firestore.mjs <export-dir> --prod     # jd-home-services-prod
 *   node scripts/migrate/import-firestore.mjs <export-dir> [--prod] --verify-only
 *
 * Talks to the Firestore / Identity Toolkit REST APIs directly (no SDK), so it works
 * the same against the emulators (FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST,
 * defaults 127.0.0.1:8080 / 127.0.0.1:9099) and production, where it authenticates with
 * FIREBASE_ACCESS_TOKEN or, failing that, `gcloud auth print-access-token`.
 *
 * Idempotent: every document is written with set-overwrite semantics keyed by its
 * original uuid, so re-running after new Supabase rows simply re-syncs.
 *
 * Mapping (field names stay snake_case, exactly as in Postgres):
 *   clients            -> clients/{id}
 *   invoices + items   -> invoices/{id}   (items embedded as `items: [...]`, sorted)
 *   estimates + items  -> estimates/{id}
 *   service_items      -> serviceItems/{id}
 *   document_settings  -> settings/document
 *   invoices/estimates -> shared/{public_token}  (public share-link copy + settings snapshot)
 *   max numbers/month  -> counters/invoices, counters/estimates  ({ "202610": 3, ... })
 *   admin_profiles     -> admins/{uid}  (uid looked up in Firebase Auth by email;
 *                         in emulator mode the users are created with a generated password
 *                         written to <export-dir>/emulator-admins.local.json)
 * Dropped: created_by, updated_by (Supabase user ids), pdf_url (no uploaded files existed).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";

const args = process.argv.slice(2);
const exportDir = args.find((a) => !a.startsWith("--"));
const PROD = args.includes("--prod");
const VERIFY_ONLY = args.includes("--verify-only");
if (!exportDir) {
  console.error("usage: import-firestore.mjs <export-dir> [--prod] [--verify-only]");
  process.exit(2);
}
const PROJECT = process.env.FIREBASE_PROJECT_ID || "jd-home-services-prod";
const FS_HOST = PROD
  ? "https://firestore.googleapis.com"
  : `http://${process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080"}`;
const AUTH_HOST = PROD
  ? "https://identitytoolkit.googleapis.com"
  : `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099"}/identitytoolkit.googleapis.com`;
const DOCS = `${FS_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;

let token = PROD
  ? process.env.FIREBASE_ACCESS_TOKEN || execSync("gcloud auth print-access-token").toString().trim()
  : "owner";
const headers = () => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  ...(PROD ? { "x-goog-user-project": PROJECT } : {}),
});

async function api(url, body, method = "POST") {
  const res = await fetch(url, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

// ---------- Firestore value encoding / decoding ----------
function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "object") return { mapValue: { fields: toFields(v) } };
  throw new Error(`unsupported value ${typeof v}`);
}
function toFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = toValue(v);
  return out;
}
function fromValue(v) {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
  return null;
}
function fromFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromValue(v);
  return out;
}

async function commit(writes) {
  // Firestore allows 500 writes per commit; keep well under the 10 MiB request cap too.
  for (let i = 0; i < writes.length; i += 100) {
    await api(`${DOCS}:commit`, { writes: writes.slice(i, i + 100) });
  }
}
const docName = (col, id) => `projects/${PROJECT}/databases/(default)/documents/${col}/${id}`;
const setWrite = (col, id, data) => ({ update: { name: docName(col, id), fields: toFields(data) } });

async function listAll(col) {
  const out = [];
  let pageToken;
  do {
    const q = new URLSearchParams({ pageSize: "300", ...(pageToken ? { pageToken } : {}) });
    const res = await api(`${DOCS}/${col}?${q}`, null, "GET");
    for (const d of res?.documents || []) out.push({ id: d.name.split("/").pop(), ...fromFields(d.fields || {}) });
    pageToken = res?.nextPageToken;
  } while (pageToken);
  return out;
}

// ---------- Load export ----------
const load = (name) => JSON.parse(readFileSync(resolve(exportDir, `${name}.json`), "utf8"));
const clients = load("clients");
const invoices = load("invoices");
const invoiceItems = load("invoice_items");
const estimates = load("estimates");
const estimateItems = load("estimate_items");
const serviceItems = load("service_items");
const [settingsRow] = load("document_settings");
const adminProfiles = load("admin_profiles");

const iso = (t) => (t == null ? null : new Date(t).toISOString());
const num = (n) => (n == null ? null : Number(n));

const itemsFor = (rows, key, id) =>
  rows
    .filter((r) => r[key] === id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({ id: r.id, description: r.description, quantity: num(r.quantity), rate: num(r.rate), amount: num(r.amount), sort_order: r.sort_order }));

const omit = (obj, ...keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
const settingsDoc = { ...omit(settingsRow, "id", "updated_by"), default_hst_rate: num(settingsRow.default_hst_rate), updated_at: iso(settingsRow.updated_at) };
const settingsSnapshot = omit(settingsDoc, "updated_at");

function clientDoc(c) {
  return {
    name: c.name, email: c.email ?? "", phone: c.phone ?? null, address: c.address ?? null,
    created_at: iso(c.created_at), updated_at: iso(c.updated_at),
  };
}
function invoiceDoc(i) {
  return {
    invoice_number: i.invoice_number, client_id: i.client_id, invoice_date: i.invoice_date,
    payment_method: i.payment_method, notes: i.notes ?? null,
    subtotal: num(i.subtotal), hst_rate: num(i.hst_rate), hst_amount: num(i.hst_amount), total: num(i.total),
    status: i.status, sent_at: iso(i.sent_at), paid_at: iso(i.paid_at),
    created_at: iso(i.created_at), updated_at: iso(i.updated_at),
    client_signature: i.client_signature ?? null, public_token: i.public_token,
    share_enabled: Boolean(i.share_enabled), sent_from_company: i.sent_from_company ?? null,
    items: itemsFor(invoiceItems, "invoice_id", i.id),
  };
}
function estimateDoc(e) {
  return {
    estimate_number: e.estimate_number, client_id: e.client_id, estimate_date: e.estimate_date,
    valid_until: e.valid_until ?? null, payment_method: e.payment_method, notes: e.notes ?? null,
    subtotal: num(e.subtotal), hst_rate: num(e.hst_rate), hst_amount: num(e.hst_amount), total: num(e.total),
    status: e.status, sent_at: iso(e.sent_at), accepted_at: iso(e.accepted_at), declined_at: iso(e.declined_at),
    created_at: iso(e.created_at), updated_at: iso(e.updated_at),
    client_signature: e.client_signature ?? null, public_token: e.public_token,
    share_enabled: Boolean(e.share_enabled),
    items: itemsFor(estimateItems, "estimate_id", e.id),
  };
}
function serviceItemDoc(s) {
  return {
    name: s.name, description: s.description ?? "", default_rate: num(s.default_rate),
    category: s.category ?? "General", is_active: Boolean(s.is_active),
    created_at: iso(s.created_at), updated_at: iso(s.updated_at),
  };
}
const clientById = Object.fromEntries(clients.map((c) => [c.id, c]));
function sharedDoc(kind, id, d) {
  const c = clientById[d.client_id] || { name: "", address: null };
  const meta = kind === "invoice"
    ? { number: d.invoice_number, date: d.invoice_date, payment_method: d.payment_method, notes: d.notes, subtotal: d.subtotal, hst_rate: d.hst_rate, hst_amount: d.hst_amount, total: d.total, status: d.status }
    : { number: d.estimate_number, date: d.estimate_date, valid_until: d.valid_until, payment_method: d.payment_method, notes: d.notes, subtotal: d.subtotal, hst_rate: d.hst_rate, hst_amount: d.hst_amount, total: d.total, status: d.status };
  return {
    kind, document_id: id, share_enabled: d.share_enabled,
    client: { name: c.name, address: c.address ?? null, client_signature: d.client_signature },
    meta, items: d.items.map(({ description, quantity, rate, amount, sort_order }) => ({ description, quantity, rate, amount, sort_order })),
    settings: settingsSnapshot, updated_at: d.updated_at,
  };
}
function counters(rows, field, prefix) {
  const out = {};
  for (const r of rows) {
    const m = new RegExp(`^${prefix}-(\\d{6})-(\\d+)$`).exec(r[field]);
    if (!m) continue;
    out[m[1]] = Math.max(out[m[1]] || 0, Number(m[2]));
  }
  return out;
}

// ---------- Auth: resolve admin uids ----------
async function lookupUid(email) {
  const res = await api(`${AUTH_HOST}/v1/projects/${PROJECT}/accounts:lookup`, { email: [email] });
  return res?.users?.[0]?.localId ?? null;
}
async function emulatorCreateUser(email, password) {
  const res = await api(`${AUTH_HOST}/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
  return res.localId;
}
async function resolveAdmins() {
  const admins = [];
  const created = [];
  for (const p of adminProfiles) {
    let uid = await lookupUid(p.email);
    if (!uid && !PROD) {
      const password = randomBytes(9).toString("base64url");
      uid = await emulatorCreateUser(p.email, password);
      created.push({ email: p.email, password });
    }
    if (!uid) {
      console.warn(`!! no Firebase Auth user for ${p.email} — create it in the console, then re-run`);
      continue;
    }
    admins.push({ uid, email: p.email, username: p.username ?? null });
  }
  if (created.length) {
    const f = resolve(exportDir, "emulator-admins.local.json");
    const prev = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [];
    writeFileSync(f, JSON.stringify([...prev, ...created], null, 2));
    console.log(`created ${created.length} emulator admin user(s); credentials in ${f}`);
  }
  return admins;
}

// ---------- Write ----------
const invoiceDocs = invoices.map((i) => [i.id, invoiceDoc(i)]);
const estimateDocs = estimates.map((e) => [e.id, estimateDoc(e)]);

if (!VERIFY_ONLY) {
  console.log(`importing into ${PROD ? "PRODUCTION " + PROJECT : "emulators"} …`);
  const admins = await resolveAdmins();
  const writes = [
    ...clients.map((c) => setWrite("clients", c.id, clientDoc(c))),
    ...invoiceDocs.map(([id, d]) => setWrite("invoices", id, d)),
    ...estimateDocs.map(([id, d]) => setWrite("estimates", id, d)),
    ...serviceItems.map((s) => setWrite("serviceItems", s.id, serviceItemDoc(s))),
    setWrite("settings", "document", settingsDoc),
    ...invoiceDocs.map(([id, d]) => setWrite("shared", d.public_token, sharedDoc("invoice", id, d))),
    ...estimateDocs.map(([id, d]) => setWrite("shared", d.public_token, sharedDoc("estimate", id, d))),
    setWrite("counters", "invoices", counters(invoices, "invoice_number", "INV")),
    setWrite("counters", "estimates", counters(estimates, "estimate_number", "EST")),
    ...admins.map((a) => setWrite("admins", a.uid, { email: a.email, username: a.username, created_at: new Date().toISOString() })),
  ];
  await commit(writes);
  console.log(`wrote ${writes.length} documents`);
}

// ---------- Verify ----------
const sigHash = (docs) => createHash("sha256").update(docs.map((d) => d.client_signature || "").sort().join("|")).digest("hex").slice(0, 16);
const sum = (docs, f) => Math.round(docs.reduce((s, d) => s + Number(d[f] || 0), 0) * 100) / 100;
const expect = {
  clients: clients.length, invoices: invoices.length, estimates: estimates.length, serviceItems: serviceItems.length,
  shared: invoices.length + estimates.length, settings: 1,
  invoice_items: invoiceItems.length, estimate_items: estimateItems.length,
  invoice_total: sum(invoices, "total"), estimate_total: sum(estimates, "total"),
  invoice_sig: sigHash(invoices), estimate_sig: sigHash(estimates),
};
const got = {};
const fsInvoices = await listAll("invoices");
const fsEstimates = await listAll("estimates");
got.clients = (await listAll("clients")).length;
got.invoices = fsInvoices.length;
got.estimates = fsEstimates.length;
got.serviceItems = (await listAll("serviceItems")).length;
got.settings = (await listAll("settings")).length;
got.shared = (await listAll("shared")).length;
got.invoice_items = fsInvoices.reduce((n, d) => n + (d.items?.length || 0), 0);
got.estimate_items = fsEstimates.reduce((n, d) => n + (d.items?.length || 0), 0);
got.invoice_total = sum(fsInvoices, "total");
got.estimate_total = sum(fsEstimates, "total");
got.invoice_sig = sigHash(fsInvoices);
got.estimate_sig = sigHash(fsEstimates);
got.admins = (await listAll("admins")).length;
got.counters = Object.fromEntries((await listAll("counters")).map((c) => { const { id, ...rest } = c; return [id, rest]; }));

let ok = true;
for (const [k, v] of Object.entries(expect)) {
  const match = got[k] === v;
  if (!match) ok = false;
  console.log(`${match ? "OK " : "!! "} ${k.padEnd(16)} expected ${String(v).padEnd(18)} got ${got[k]}`);
}
console.log(`    admins           ${got.admins} (expected ${adminProfiles.length} once all Auth users exist)`);
console.log(`    counters         ${JSON.stringify(got.counters)}`);
console.log(ok ? "VERIFY: all checks passed" : "VERIFY: MISMATCH");
process.exit(ok ? 0 : 1);
