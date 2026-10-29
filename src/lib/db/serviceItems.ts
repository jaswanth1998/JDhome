"use client";

import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS, clean, db, getAll, getOne, newId, nowIso } from "./core";
import type { ServiceItem } from "./types";

export type ServiceItemInput = {
  name: string;
  description?: string | null;
  default_rate?: number | null;
  category?: string | null;
  is_active?: boolean;
};

/** All service items, A→Z by name (filter `is_active` client-side where needed). */
export const listServiceItems = () => getAll<ServiceItem>(COLLECTIONS.serviceItems, "name");

export const getServiceItem = (id: string) => getOne<ServiceItem>(COLLECTIONS.serviceItems, id);

export async function createServiceItem(input: ServiceItemInput): Promise<ServiceItem> {
  const id = newId();
  const now = nowIso();
  const data = clean({
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    default_rate: Number(input.default_rate ?? 0),
    category: input.category?.trim() || "General",
    is_active: input.is_active ?? true,
    created_at: now,
    updated_at: now,
  });
  await setDoc(doc(db(), COLLECTIONS.serviceItems, id), data);
  return { id, ...data };
}

export async function updateServiceItem(id: string, patch: Partial<ServiceItemInput>): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.serviceItems, id), clean({ ...patch, updated_at: nowIso() }));
}

export const deleteServiceItem = (id: string) => deleteDoc(doc(db(), COLLECTIONS.serviceItems, id));
