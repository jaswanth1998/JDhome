"use client";

/**
 * Shared Firestore plumbing for the admin data layer (src/lib/db/*).
 *
 * Conventions:
 * - Documents keep snake_case fields (see ./types.ts); the document id is a uuid
 *   generated client-side so references (client_id, public_token) stay stable.
 * - Firestore rejects `undefined`; always pass writes through `clean()`.
 * - Timestamps are ISO strings from `nowIso()`.
 * - Reads of a whole collection are fine at this scale (tens to hundreds of
 *   docs); the free tier allows 50k reads/day.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
  type Transaction,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

export const COLLECTIONS = {
  admins: "admins",
  clients: "clients",
  invoices: "invoices",
  invoiceFiles: "invoiceFiles",
  estimates: "estimates",
  serviceItems: "serviceItems",
  settings: "settings",
  counters: "counters",
  shared: "shared",
} as const;

export const SETTINGS_DOC_ID = "document";

export const db = (): Firestore => getDb();

export const nowIso = () => new Date().toISOString();

/** `YYYY-MM-DD` for today in the browser's timezone. */
export const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return doc(collection(db(), "_ids")).id;
}

/** Strip `undefined` (Firestore rejects it) — nested objects and arrays included. */
export function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = clean(v);
    }
    return out as T;
  }
  return value;
}

export function withId<T>(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...(snap.data() as Omit<T, "id">) } as T;
}

export async function getAll<T>(collectionName: string, orderField?: string, direction: "asc" | "desc" = "asc"): Promise<T[]> {
  const ref = collection(db(), collectionName);
  const q = orderField ? query(ref, orderBy(orderField, direction)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<T>(d));
}

export async function getOne<T>(collectionName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db(), collectionName, id));
  return snap.exists() ? withId<T>(snap) : null;
}

/** Map of id → document for cheap client-side joins (e.g. invoice → client name). */
export function indexById<T extends { id: string }>(rows: T[]): Record<string, T> {
  return Object.fromEntries(rows.map((r) => [r.id, r]));
}

// ---------- Sequential document numbers ----------
//
// `counters/invoices` and `counters/estimates` hold `{ "YYYYMM": lastSeq }`.
// Numbers look like INV-202610-003 / EST-202610-001, exactly as before.

export type NumberKind = "invoices" | "estimates";
const PREFIX: Record<NumberKind, string> = { invoices: "INV", estimates: "EST" };

export function yearMonth(date = new Date()): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDocumentNumber(kind: NumberKind, ym: string, seq: number): string {
  return `${PREFIX[kind]}-${ym}-${String(seq).padStart(3, "0")}`;
}

/** What the next number WILL be (no reservation). Show it in forms before saving. */
export async function peekNextDocumentNumber(kind: NumberKind, date = new Date()): Promise<string> {
  const ym = yearMonth(date);
  const snap = await getDoc(doc(db(), COLLECTIONS.counters, kind));
  const last = Number((snap.data() ?? {})[ym] ?? 0);
  return formatDocumentNumber(kind, ym, last + 1);
}

/**
 * Reserve the next number inside a transaction. Use it together with the
 * document write in the same `runTransaction` so a number is never burned on
 * an abandoned form and two saves can never share one.
 */
export async function reserveDocumentNumber(tx: Transaction, kind: NumberKind, date = new Date()): Promise<string> {
  const ym = yearMonth(date);
  const ref = doc(db(), COLLECTIONS.counters, kind);
  const snap = await tx.get(ref);
  const last = Number((snap.data() ?? {})[ym] ?? 0);
  const seq = last + 1;
  tx.set(ref, { [ym]: seq }, { merge: true });
  return formatDocumentNumber(kind, ym, seq);
}

/**
 * A custom number (typed by the admin) that matches PREFIX-YYYYMM-NNN raises that
 * month's counter so the next auto-generated number lands after it. Returns the
 * number unchanged. Must run inside the transaction that writes the document.
 */
export async function bumpCounterForCustomNumber(tx: Transaction, kind: NumberKind, custom: string): Promise<string> {
  const m = new RegExp(`^${PREFIX[kind]}-(\\d{6})-(\\d+)$`).exec(custom.trim());
  if (m) {
    const ym = m[1];
    const seq = Number(m[2]);
    const ref = doc(db(), COLLECTIONS.counters, kind);
    const snap = await tx.get(ref);
    const last = Number((snap.data() ?? {})[ym] ?? 0);
    if (seq > last) tx.set(ref, { [ym]: seq }, { merge: true });
  }
  return custom.trim();
}

export { runTransaction };
