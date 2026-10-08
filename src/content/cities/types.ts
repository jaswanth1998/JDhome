import type { SiteImageKey } from "@/config/images";

/** Slugs of the cities that get a dedicated /service-areas/[city]/ page (theme.serviceCities core: true). */
export type CoreCitySlug = "oshawa" | "whitby" | "ajax" | "pickering" | "courtice" | "bowmanville";

export type CityFaq = { question: string; answer: string };

/** An H2 section of plain-text paragraphs. Links are rendered by the component, never written into the copy. */
export type CitySection = {
  /** Optional H2 override; the component supplies a default such as "Garage door repair and installation in {City}". */
  heading?: string;
  paragraphs: readonly string[];
};

/**
 * Unique copy for one core-city service-area page. Every field is rendered by
 * src/app/(public)/service-areas/[city]/CityPageContent.tsx in the order below.
 * Content rules: Canadian English, no prices, never the word "minute(s)", no
 * invented business facts (years, counts, licences, brands, street address),
 * 24/7 wording only in car-lockout sentences, only documented place names.
 */
export type CityPageCopy = {
  slug: CoreCitySlug;
  seo: {
    /** <= 60 characters; see the targeting table in the brief (Oshawa is multi-service, the rest lead with "{City} Garage Door Repair"). */
    title: string;
    /** 120-155 characters, mentions the city and a reason to click (free quotes / open 7 days / phone). */
    description: string;
  };
  /** Page H1. Non-Oshawa pages contain "Garage Door Repair" and the city; Oshawa's must not contain "Garage Door Repair". */
  h1: string;
  /** 1-2 sentences under the H1. */
  subtitle: string;
  /** 2-3 unique paragraphs introducing the services in this city. */
  intro: readonly string[];
  /** The one city-only H2 (required): a real local angle (housing stock, geography, commuter spots) tied to the services. */
  localAngle: { heading: string; paragraphs: readonly string[] };
  /** Garage door services in this city: paragraphs + the issues people here call about (short phrases). */
  garage: CitySection & { commonIssues: readonly string[] };
  /** Security camera installation in this city (1-2 paragraphs). */
  cameras: CitySection;
  /** Locksmith + car lockout in this city (1-2 paragraphs). Courtice and Bowmanville must mention Clarington. */
  locks: CitySection;
  /**
   * Places we serve: 2-4 sentences grouped by area that tie real places to the service,
   * then 5-10 documented names (Courtice: at least 4) shown as small chips after the prose.
   */
  neighbourhoods: { heading: string; paragraphs: readonly string[]; names: readonly string[] };
  /** 4-5 city-specific questions from the brief; answers 40-90 words, never minutes or prices. */
  faqs: readonly CityFaq[];
  /** Exactly 3 guide slugs from src/content/blog to feature on this page. */
  guideSlugs: readonly [string, string, string];
  /** Hero photo key from src/config/images.ts. */
  image: SiteImageKey;
};
