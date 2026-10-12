"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking/attribution";

/** Push an event to the GTM dataLayer. No-op before GTM has created it. */
export function pushDataLayer(data: Record<string, unknown>) {
  window.dataLayer?.push(data);
}

/**
 * Google Ads support for the marketing site:
 * - stores the ad click id / UTM tags from the landing URL (saved with each quote request)
 * - sends a `phone_click` dataLayer event for every tel: link tap, so GTM can count
 *   calls as Google Ads conversions (trigger: Custom Event "phone_click"), and a
 *   `text_click` event for every sms: link tap ("Text us" in the sticky phone bar).
 */
export function AdTracking() {
  useEffect(() => {
    captureAttribution();

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="tel:"], a[href^="sms:"]');
      if (!link) return;
      pushDataLayer({
        event: link.getAttribute("href")?.startsWith("sms:") ? "text_click" : "phone_click",
        page_path: window.location.pathname,
        click_text: link.textContent?.trim().slice(0, 60) ?? "",
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

export default AdTracking;
