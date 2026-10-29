"use client";

import { collection, deleteDoc, doc, getDocs, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { COLLECTIONS, clean, db, getAll, getOne, newId, nowIso } from "./core";
import type { Client } from "./types";

export type ClientInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

/** All clients, A→Z by name. */
export const listClients = () => getAll<Client>(COLLECTIONS.clients, "name");

export const getClient = (id: string) => getOne<Client>(COLLECTIONS.clients, id);

export async function createClient(input: ClientInput): Promise<Client> {
  const id = newId();
  const now = nowIso();
  const data = clean({
    name: input.name.trim(),
    email: (input.email ?? "").trim(),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    created_at: now,
    updated_at: now,
  });
  await setDoc(doc(db(), COLLECTIONS.clients, id), data);
  return { id, ...data };
}

export async function updateClient(id: string, patch: Partial<ClientInput>): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.clients, id), clean({ ...patch, updated_at: nowIso() }));
}

/** How many invoices/estimates reference the client (used to block deletes). */
export async function countClientDocuments(id: string): Promise<{ invoices: number; estimates: number }> {
  const [inv, est] = await Promise.all([
    getDocs(query(collection(db(), COLLECTIONS.invoices), where("client_id", "==", id), limit(1))),
    getDocs(query(collection(db(), COLLECTIONS.estimates), where("client_id", "==", id), limit(1))),
  ]);
  return { invoices: inv.size, estimates: est.size };
}

/**
 * Delete a client. Postgres used to refuse this while invoices/estimates
 * referenced the client; we keep that behaviour by checking first.
 */
export async function deleteClient(id: string): Promise<void> {
  const refs = await countClientDocuments(id);
  if (refs.invoices || refs.estimates) {
    throw new Error("This client has invoices or estimates. Delete those first.");
  }
  await deleteDoc(doc(db(), COLLECTIONS.clients, id));
}
