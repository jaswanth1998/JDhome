import { z } from "zod";

/**
 * Website inquiry ("Get a free quote") form model.
 *
 * The same field names are enforced server-side by `firestore.rules`, so keep
 * the two in sync when adding or renaming a field.
 */

export const INQUIRY_SERVICES = [
  { value: "garage-repair", label: "Garage door repair", hint: "Stuck, noisy, off-track, springs, openers", group: "garage" },
  { value: "garage-install", label: "New garage door", hint: "Replacement or new installation", group: "garage" },
  { value: "security-cameras", label: "Security cameras", hint: "New camera system or upgrade", group: "cameras" },
  { value: "locksmith", label: "Locksmith", hint: "Lock changes, rekeying, hardware", group: "other" },
  { value: "car-lockout", label: "Car lockout", hint: "Locked out of your vehicle", group: "other" },
  { value: "other", label: "Something else", hint: "Tell us what you need", group: "other" },
] as const;

export type InquiryService = (typeof INQUIRY_SERVICES)[number]["value"];
export type InquiryServiceGroup = (typeof INQUIRY_SERVICES)[number]["group"];

// Digits plus common formatting, e.g. "(905) 555-0123" or "+1 905.555.0123".
const phonePattern = /^[+\d\s\-().]{7,30}$/;
const phoneDigits = (value: string) => value.replace(/\D/g, "").length;

/**
 * Deliberately short: what they need, a name, and a phone number or email (either is
 * enough). Everything else (city, timing, door or camera details) is asked on the
 * call-back, where people answer more readily than in a form.
 */
export const inquirySchema = z
  .object({
    service: z.enum(INQUIRY_SERVICES.map((s) => s.value) as [InquiryService, ...InquiryService[]], {
      message: "Choose what you need help with",
    }),
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z.union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(phonePattern, "Please enter a valid phone number")
        .refine((v) => phoneDigits(v) >= 10 && phoneDigits(v) <= 15, "Please enter a valid phone number"),
    ]),
    email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(120)]),
    /** Ticked: they'd rather get a text than a call. */
    textMe: z.boolean(),
    message: z.string().trim().max(1500, "Please keep it under 1,500 characters").optional(),
    /** Honeypot: real people never see or fill this field. */
    company: z.string().max(0).optional(),
  })
  .refine((d) => d.phone.trim() !== "" || d.email.trim() !== "", {
    path: ["phone"],
    message: "Add a phone number or an email so we can reach you",
  });

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export function serviceLabel(value: InquiryService): string {
  return INQUIRY_SERVICES.find((s) => s.value === value)?.label ?? value;
}

export function serviceGroup(value: InquiryService | undefined): InquiryServiceGroup | undefined {
  return INQUIRY_SERVICES.find((s) => s.value === value)?.group;
}

/**
 * The service to pre-select for a quote opened on this page: `?service=` from the URL
 * (ads can link with it) first, then the service page or ad landing page being viewed.
 */
export function inquiryServiceForLocation(pathname: string, search: string): InquiryService | undefined {
  const raw = new URLSearchParams(search).get("service") ?? undefined;
  const fromUrl = inquiryServiceForPage(raw) ?? INQUIRY_SERVICES.find((s) => s.value === raw)?.value;
  if (fromUrl) return fromUrl;
  const slug = pathname.match(/^\/(?:services|lp)\/([^/]+)/)?.[1];
  return inquiryServiceForPage(slug);
}

/** Map a site service page id to the form's service option. */
export function inquiryServiceForPage(serviceId: string | undefined): InquiryService | undefined {
  switch (serviceId) {
    case "garage-door-repair-installation":
    case "garage-door-repair":
    case "garage-door-opener-installation":
    case "garage-door-spring-repair":
      return "garage-repair";
    case "garage-door-installation":
      return "garage-install";
    case "security-camera-installation":
    case "security-cameras":
      return "security-cameras";
    case "locksmith":
      return "locksmith";
    case "car-lockout":
      return "car-lockout";
    default:
      return undefined;
  }
}
