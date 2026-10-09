import type { InquiryService } from "@/lib/inquiries/schema";

/**
 * Google Ads landing pages (/lp/<slug>/). Each one matches a single ad campaign:
 * one service, the quote form already open on it, and nothing to distract from
 * calling or sending the form. They are noindex and left out of the sitemap, so
 * they never compete with the service pages in Google search.
 *
 * Same content rules as the rest of the site: no prices, arrival times, or other
 * facts the owner hasn't confirmed, and no 24/7 claims for garage or camera work.
 */
export type LandingPage = {
  slug: string;
  /** Service page id in theme.services.categories (FAQs and guides come from it). */
  serviceId: "garage-door-repair-installation" | "security-camera-installation";
  inquiryService: InquiryService;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  points: readonly string[];
  /** "What we fix / install" list. */
  listTitle: string;
  list: readonly { title: string; body: string }[];
};

export const LANDING_PAGES: readonly LandingPage[] = [
  {
    slug: "garage-door-repair",
    serviceId: "garage-door-repair-installation",
    inquiryService: "garage-repair",
    metaTitle: "Garage Door Repair in Durham Region | JD Home Services",
    metaDescription:
      "Broken spring, stuck door, or opener trouble? Local garage door repair in Oshawa, Whitby, Courtice, Bowmanville and across Durham Region. Free quote.",
    eyebrow: "Garage door repair · Durham Region",
    h1: "Garage door repair in Durham Region",
    intro:
      "Broken spring, snapped cable, door stuck or off its track? Local technicians from Oshawa fix it properly and finish every visit with a safety and balance check.",
    points: [
      "Springs, cables, rollers, openers, and off-track doors",
      "Free, no-obligation quote before any work starts",
      "Honest advice on repair versus replacement",
    ],
    listTitle: "What we fix",
    list: [
      { title: "Broken springs", body: "Door feels heavy or won't lift. Stop using it; we replace springs safely." },
      { title: "Snapped or loose cables", body: "Door hanging crooked or dropping on one side." },
      { title: "Door won't open or close", body: "Stuck halfway, reverses, or doesn't respond to the opener." },
      { title: "Off-track doors", body: "Rollers out of the track. Realigned, tested, and balanced." },
      { title: "Opener and remote problems", body: "Opener repair or replacement, remotes, keypads, and safety sensors." },
      { title: "Noisy or shaking doors", body: "Grinding or banging usually means worn rollers, hinges, or loose hardware." },
    ],
  },
  {
    slug: "security-cameras",
    serviceId: "security-camera-installation",
    inquiryService: "security-cameras",
    metaTitle: "Security Camera Installation in Durham | JD Home Services",
    metaDescription:
      "Security cameras installed for homes, rentals, and businesses in Durham Region. Smart alerts, phone viewing, recordings kept at your property. Free quote.",
    eyebrow: "Security camera installation · Durham Region",
    h1: "Security cameras installed for your home or business",
    intro:
      "We plan where each camera goes, run the wiring, and set everything up on your phone, for houses, rental properties, and businesses across Durham Region.",
    points: [
      "Smart alerts that tell people and cars apart",
      "Recordings saved at your property, not in someone else's cloud",
      "Free, no-obligation quote and camera layout plan",
    ],
    listTitle: "What you get",
    list: [
      { title: "A camera plan for your property", body: "Driveway, doors, yard, parking, or stock room: we cover what matters." },
      { title: "Reliable wired cameras", body: "One cable carries power and video (called PoE), so no batteries or Wi-Fi dropouts." },
      { title: "Smart alerts", body: "Phone alerts for people and cars, not every branch or headlight." },
      { title: "Fast footage search", body: "Type what you're looking for and jump to the right moment." },
      { title: "Watch from your phone", body: "Live view and playback from anywhere, set up and shown to you on install day." },
      { title: "Homes, rentals, and businesses", body: "Houses, multi-unit rentals, offices, storefronts, and restaurants." },
    ],
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((page) => page.slug === slug);
}
