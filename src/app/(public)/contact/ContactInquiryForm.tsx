"use client";

import { useSyncExternalStore } from "react";
import { InquiryForm } from "@/components/inquiry";
import { INQUIRY_SERVICES, inquiryServiceForPage, type InquiryService } from "@/lib/inquiries/schema";

const subscribe = () => () => {};

/** `?service=` from the URL (ads link here with it): a service page id or a form value. */
function serviceFromUrl(): InquiryService | undefined {
  const raw = new URLSearchParams(window.location.search).get("service") ?? undefined;
  return inquiryServiceForPage(raw) ?? INQUIRY_SERVICES.find((s) => s.value === raw)?.value;
}

/** The contact page's form, starting on the right service when the link names one. */
export function ContactInquiryForm() {
  const service = useSyncExternalStore(subscribe, serviceFromUrl, () => undefined);
  // Keyed so the form re-mounts with the service once the URL is readable after hydration.
  return <InquiryForm key={service ?? "none"} defaultService={service} />;
}
