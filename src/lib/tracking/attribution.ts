/**
 * Ad attribution: remembers which ad click (gclid/gbraid/wbraid) and UTM tags brought a
 * visitor, so a quote request sent later in the visit (or days later) can be traced back
 * to the ad. Stored in localStorage for 90 days, Google Ads' click-conversion window.
 *
 * Browser-only. Every storage access is wrapped because private windows can throw.
 */

export const ATTRIBUTION_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];

/** Saved with each inquiry. `landingPage` is the first page of the ad visit. */
export type Attribution = Partial<Record<AttributionKey, string>> & { landingPage?: string };

const STORAGE_KEY = "jd_attribution";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
/** Matches the per-value limit in firestore.rules. */
const MAX_VALUE_LENGTH = 200;

/** Read ad parameters from the current URL and store them. A new ad click replaces the old one. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = params.get(key)?.trim();
      if (value) found[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
    if (!Object.keys(found).length) return;
    found.landingPage = window.location.pathname.slice(0, MAX_VALUE_LENGTH);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data: found }));
  } catch {
    // Storage unavailable: attribution is a nice-to-have, never block the page.
  }
}

/** The stored attribution, or undefined when there is none or it has expired. */
export function getAttribution(): Attribution | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const { savedAt, data } = JSON.parse(raw) as { savedAt: number; data: Attribution };
    if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    // Keep only known keys with short string values, so the Firestore rules accept it.
    const clean: Attribution = {};
    for (const key of [...ATTRIBUTION_KEYS, "landingPage"] as const) {
      const value = data?.[key];
      if (typeof value === "string" && value) clean[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
    return Object.keys(clean).length ? clean : undefined;
  } catch {
    return undefined;
  }
}

/** Phone number in E.164 (+1XXXXXXXXXX) for Google Ads Enhanced Conversions. */
export function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 11 && digits.length <= 15) return `+${digits}`;
  return undefined;
}
