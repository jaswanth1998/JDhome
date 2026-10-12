import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import type { Attribution } from "@/lib/tracking/attribution";
import { serviceLabel, type InquiryFormValues } from "./schema";

export const INQUIRIES_COLLECTION = "inquiries";

/**
 * Save a website inquiry to Firestore (`inquiries` collection).
 * Access is enforced by `firestore.rules`: the public can only create documents.
 *
 * Imported lazily from the form so the Firebase SDK only loads on submit.
 */
export async function submitInquiry(
  values: InquiryFormValues,
  page: string,
  attribution?: Attribution,
): Promise<string> {
  // The record keeps its original shape (firestore.rules, the n8n alerts and the leads
  // dashboard all expect it): questions the short form no longer asks are saved as
  // "Not specified" / empty and gathered on the call-back instead. The rules require a
  // phone value, so an email-only request stores "Not provided" there.
  const phone = values.phone.trim();
  const ref = await addDoc(collection(getDb(), INQUIRIES_COLLECTION), {
    service: values.service,
    serviceLabel: serviceLabel(values.service),
    details: {},
    city: "Not specified",
    timing: "Not specified",
    message: values.message?.trim() ?? "",
    name: values.name.trim(),
    phone: phone || "Not provided",
    email: values.email.trim(),
    preferredContact: !phone ? "email" : values.textMe ? "text" : "phone",
    page: page.slice(0, 200),
    // Ad click id + UTM tags, so leads can be traced to (and imported back into) Google Ads.
    ...(attribution ? { attribution } : {}),
    status: "new",
    createdAt: serverTimestamp(),
  });

  return ref.id;
}
