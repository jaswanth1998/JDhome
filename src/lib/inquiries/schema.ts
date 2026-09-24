import { z } from "zod";
import { theme } from "@/config/theme";

/**
 * Website inquiry ("Get a free quote") form model.
 *
 * The same field names are enforced server-side by `firestore.rules`, so keep
 * the two in sync when adding or renaming a field.
 */

export const INQUIRY_SERVICES = [
  { value: "garage-repair", label: "Garage door repair", hint: "Stuck, noisy, off-track, springs, openers", group: "garage" },
  { value: "garage-install", label: "New garage door", hint: "Replacement or new installation", group: "garage" },
  { value: "security-cameras", label: "Security cameras", hint: "CCTV, smart AI cameras, PoE systems", group: "cameras" },
  { value: "locksmith", label: "Locksmith", hint: "Lock changes, rekeying, hardware", group: "other" },
  { value: "car-lockout", label: "Car lockout", hint: "Locked out of your vehicle", group: "other" },
  { value: "other", label: "Something else", hint: "Tell us what you need", group: "other" },
] as const;

export type InquiryService = (typeof INQUIRY_SERVICES)[number]["value"];
export type InquiryServiceGroup = (typeof INQUIRY_SERVICES)[number]["group"];

export const GARAGE_ISSUES = [
  "Door won't open or close",
  "Broken spring or cable",
  "Off-track or crooked",
  "Noisy or shaking",
  "Opener or remote problem",
  "Damaged panels",
  "Not sure",
] as const;

export const PROPERTY_TYPES = ["House", "Rental / multi-unit", "Business / office", "Retail / restaurant"] as const;

export const CAMERA_COUNTS = ["1–2 cameras", "3–4 cameras", "5–8 cameras", "9+ cameras", "Not sure yet"] as const;

export const CAMERA_FEATURES = [
  "AI person detection",
  "Search footage by description",
  "View on my phone",
  "Local recording (NVR)",
  "PoE wired cameras",
  "360° / PTZ cameras",
  "Doorbell camera",
] as const;

export const TIMINGS = ["As soon as possible", "Within a week", "Within a month", "Just getting prices"] as const;

export const CONTACT_METHODS = [
  { value: "phone", label: "Call me" },
  { value: "text", label: "Text me" },
  { value: "email", label: "Email me" },
] as const;

export const CITY_OPTIONS = [...theme.serviceCities.map((c) => c.name), "Other"] as const;

// Digits plus common formatting, e.g. "(905) 555-0123" or "+1 905.555.0123".
const phonePattern = /^[+\d\s\-().]{7,30}$/;
const phoneDigits = (value: string) => value.replace(/\D/g, "").length;

export const inquirySchema = z
  .object({
    service: z.enum(INQUIRY_SERVICES.map((s) => s.value) as [InquiryService, ...InquiryService[]], {
      message: "Choose what you need help with",
    }),
    // Optional choice questions: react-hook-form reports an unanswered radio group as
    // null (and an unticked checkbox group as false), so accept those as "no answer".
    garageIssue: z.string().max(60).nullish(),
    propertyType: z.string().max(60).nullish(),
    cameraCount: z.string().max(40).nullish(),
    cameraFeatures: z.union([z.array(z.string().max(60)).max(CAMERA_FEATURES.length), z.literal(false)]).nullish(),
    city: z.string().min(1, "Choose your city").max(60),
    timing: z.string().min(1, "Choose a timeframe").max(60),
    message: z.string().trim().max(1500, "Please keep it under 1,500 characters").optional(),
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z
      .string()
      .trim()
      .regex(phonePattern, "Please enter a valid phone number")
      .refine((v) => phoneDigits(v) >= 10 && phoneDigits(v) <= 15, "Please enter a valid phone number"),
    email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(120)]),
    preferredContact: z.enum(["phone", "text", "email"]),
    /** Honeypot: real people never see or fill this field. */
    company: z.string().max(0).optional(),
  })
  .refine((d) => d.preferredContact !== "email" || d.email !== "", {
    path: ["email"],
    message: "Add an email so we can reply by email",
  });

export type InquiryFormValues = z.infer<typeof inquirySchema>;

/** Fields validated on each step of the form, in order. */
export const INQUIRY_STEPS = [
  { id: "service", title: "What do you need?", fields: ["service"] },
  {
    id: "details",
    title: "A few details",
    fields: ["garageIssue", "propertyType", "cameraCount", "cameraFeatures", "city", "timing", "message"],
  },
  { id: "contact", title: "How can we reach you?", fields: ["name", "phone", "email", "preferredContact"] },
] as const satisfies readonly { id: string; title: string; fields: readonly (keyof InquiryFormValues)[] }[];

export function serviceLabel(value: InquiryService): string {
  return INQUIRY_SERVICES.find((s) => s.value === value)?.label ?? value;
}

export function serviceGroup(value: InquiryService | undefined): InquiryServiceGroup | undefined {
  return INQUIRY_SERVICES.find((s) => s.value === value)?.group;
}

/** Map a site service page id to the form's service option. */
export function inquiryServiceForPage(serviceId: string | undefined): InquiryService | undefined {
  switch (serviceId) {
    case "garage-door-repair-installation":
      return "garage-repair";
    case "security-camera-installation":
      return "security-cameras";
    case "locksmith":
      return "locksmith";
    case "car-lockout":
      return "car-lockout";
    default:
      return undefined;
  }
}
