"use client";

/**
 * Editable content for the generated documents, stored in
 * `jdhome.document_settings` (a single row).
 *
 * Every consumer goes through `getDocumentSettings()`, which caches the row for
 * the session and falls back to DEFAULT_DOCUMENT_SETTINGS on any failure — so a
 * missing row, an RLS change or an offline browser degrades to today's output
 * rather than breaking document generation.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type TermsClause = { title: string; body: string };

export type DocumentSettings = {
  companyPhone: string;
  companyEmail: string;
  companyWeb: string;
  companyAddress: string;
  companyGst: string;

  tagline: string;
  footerThanks: string;
  footerBadge: string;

  invoiceTerms: string;
  estimateTerms: TermsClause[];

  paymentOptions: string[];
  chequePayableTo: string;
  chequeMailTo: string;

  defaultHstRate: number;
};

/** Mirrors the values the PDF used before settings existed. */
export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  companyPhone: "+1 (289) 991-3277",
  companyEmail: "info@jdhomeservices.ca",
  companyWeb: "www.Jdhomeservices.ca",
  companyAddress: "Barrie, Ontario",
  companyGst: "2000 2161 RT0001",

  tagline: "FROM INSTALL TO REPAIR. FINISHED TO PERFECTION.",
  footerThanks: "Thank you for choosing JD Home. We appreciate your business.",
  footerBadge: "TRUSTED LOCAL EXPERTS",

  invoiceTerms:
    "By paying the due balance on invoices provided, the Client hereby acknowledges that all requested service items for this date and/or any other dates listed above in the description section of the table, have been performed and have been tested showing successful satisfactory repair, unless otherwise stated on the invoice, in which labor service charges still apply if any repairs have been made. By accepting this invoice, the Client agrees to pay in full the amount listed in the Total section of the invoice.",
  estimateTerms: [
    {
      title: "Agreement to Terms",
      body: "Approval of this estimate, signature below, or payment of a deposit constitutes full acceptance of these Terms and Conditions.",
    },
    {
      title: "Scope of Work",
      body: "Pricing is based on visible conditions and information provided at the time of estimate. Unforeseen conditions or work outside the agreed scope will result in additional charges.",
    },
    {
      title: "Right to Remedy",
      body: "Customer must notify JD Home Services in writing of any concerns and allow up to three (3) reasonable repair attempts before requesting a refund or initiating any dispute.",
    },
    {
      title: "Deposits & Cancellations",
      body: "A minimum 10% cancellation fee applies once a deposit is paid. Deposits are non-refundable for materials purchased or special-order items. No cancellations after job completion.",
    },
  ],

  paymentOptions: [
    "etransfer: info@jdhomeservices.ca",
    "Credit/Debit Card: Call us at 289-991-3277",
    "Secure Payment Link Via Square",
    "Bank Transfer: (VOID cheque available upon request)",
  ],
  chequePayableTo: "17508336 Canada inc",
  chequeMailTo: "35 Blair crescent, Barrie, ON L4N 5Y6",

  defaultHstRate: 0.13,
};

/** Column names as stored in Postgres. */
export const SETTINGS_COLUMNS =
  "company_phone, company_email, company_web, company_address, company_gst, " +
  "tagline, footer_thanks, footer_badge, invoice_terms, estimate_terms, " +
  "payment_options, cheque_payable_to, cheque_mail_to, default_hst_rate";

type SettingsRow = {
  company_phone: string | null;
  company_email: string | null;
  company_web: string | null;
  company_address: string | null;
  company_gst: string | null;
  tagline: string | null;
  footer_thanks: string | null;
  footer_badge: string | null;
  invoice_terms: string | null;
  estimate_terms: TermsClause[] | null;
  payment_options: string[] | null;
  cheque_payable_to: string | null;
  cheque_mail_to: string | null;
  default_hst_rate: number | string | null;
};

/** An empty string in the DB should fall back to the default, not blank the PDF. */
const pick = (value: string | null | undefined, fallback: string) =>
  value && value.trim() ? value : fallback;

export function rowToSettings(row: SettingsRow): DocumentSettings {
  const d = DEFAULT_DOCUMENT_SETTINGS;
  return {
    companyPhone: pick(row.company_phone, d.companyPhone),
    companyEmail: pick(row.company_email, d.companyEmail),
    companyWeb: pick(row.company_web, d.companyWeb),
    companyAddress: pick(row.company_address, d.companyAddress),
    companyGst: pick(row.company_gst, d.companyGst),
    tagline: pick(row.tagline, d.tagline),
    footerThanks: pick(row.footer_thanks, d.footerThanks),
    footerBadge: pick(row.footer_badge, d.footerBadge),
    invoiceTerms: pick(row.invoice_terms, d.invoiceTerms),
    estimateTerms:
      Array.isArray(row.estimate_terms) && row.estimate_terms.length
        ? row.estimate_terms
        : d.estimateTerms,
    paymentOptions:
      Array.isArray(row.payment_options) && row.payment_options.length
        ? row.payment_options
        : d.paymentOptions,
    chequePayableTo: pick(row.cheque_payable_to, d.chequePayableTo),
    chequeMailTo: pick(row.cheque_mail_to, d.chequeMailTo),
    defaultHstRate: Number(row.default_hst_rate ?? d.defaultHstRate),
  };
}

export function settingsToRow(s: DocumentSettings) {
  return {
    company_phone: s.companyPhone,
    company_email: s.companyEmail,
    company_web: s.companyWeb,
    company_address: s.companyAddress,
    company_gst: s.companyGst,
    tagline: s.tagline,
    footer_thanks: s.footerThanks,
    footer_badge: s.footerBadge,
    invoice_terms: s.invoiceTerms,
    estimate_terms: s.estimateTerms,
    payment_options: s.paymentOptions,
    cheque_payable_to: s.chequePayableTo,
    cheque_mail_to: s.chequeMailTo,
    default_hst_rate: s.defaultHstRate,
  };
}

let cached: DocumentSettings | null = null;
let inFlight: Promise<DocumentSettings> | null = null;

/** Drop the cache so the next read re-fetches (call after saving). */
export function invalidateDocumentSettings() {
  cached = null;
  inFlight = null;
}

export async function getDocumentSettings(): Promise<DocumentSettings> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const supabase: SupabaseClient = createClient();
      const { data, error } = await supabase
        .schema("jdhome")
        .from("document_settings")
        .select(SETTINGS_COLUMNS)
        .maybeSingle();

      if (error || !data) {
        return DEFAULT_DOCUMENT_SETTINGS;
      }
      return rowToSettings(data as unknown as SettingsRow);
    } catch {
      // Never let a settings failure block document generation.
      return DEFAULT_DOCUMENT_SETTINGS;
    }
  })();

  cached = await inFlight;
  inFlight = null;
  return cached;
}
