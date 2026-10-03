import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { serviceGroup, serviceLabel, type InquiryFormValues } from "./schema";

export const INQUIRIES_COLLECTION = "inquiries";

/**
 * Save a website inquiry to Firestore (`inquiries` collection).
 * Access is enforced by `firestore.rules`: the public can only create documents.
 *
 * Imported lazily from the form so the Firebase SDK only loads on submit.
 */
export async function submitInquiry(values: InquiryFormValues, page: string): Promise<string> {
  const group = serviceGroup(values.service);

  // Only keep the detail fields that apply to the chosen service.
  const details: Record<string, string | string[]> = {};
  if (group === "garage" && values.garageIssue) details.garageIssue = values.garageIssue;
  if (group === "cameras") {
    if (values.propertyType) details.propertyType = values.propertyType;
    if (values.cameraCount) details.cameraCount = values.cameraCount;
    if (Array.isArray(values.cameraFeatures) && values.cameraFeatures.length) {
      details.cameraFeatures = values.cameraFeatures;
    }
  }

  const ref = await addDoc(collection(getDb(), INQUIRIES_COLLECTION), {
    service: values.service,
    serviceLabel: serviceLabel(values.service),
    details,
    city: values.city,
    timing: values.timing,
    message: values.message?.trim() ?? "",
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    preferredContact: values.preferredContact,
    page: page.slice(0, 200),
    status: "new",
    createdAt: serverTimestamp(),
  });

  return ref.id;
}
