/**
 * JD Home Services - CENTRALIZED BUSINESS CONFIGURATION
 *
 * Brand, contact details, services, service areas, SEO copy and feature flags
 * for the whole site. Components import from here instead of hardcoding values.
 * Colours used in CSS live in `src/app/globals.css`; the few values below are
 * only for places CSS can't reach (the OG image and the browser theme colour).
 * Photos are configured separately in `src/config/images.ts`.
 */

import type { SiteImageKey } from "@/config/images";

export type ServiceCity = {
  slug: string;
  name: string;
  region: string;
  core: boolean;
  blurb?: string;
};

export type ServiceFaq = { question: string; answer: string };

/** Primary services lead the site; add-ons are listed as extra services. */
export type ServiceTier = "primary" | "addon";

/**
 * An H2 section of plain-text service-page copy, rendered after the overview on
 * /services/[slug]/. Links are added by the page component, never written here.
 */
export type ServiceSection = { heading: string; paragraphs: readonly string[]; bullets?: readonly string[] };

/* ==========================================
   SERVICE CITIES
   Core cities get dedicated service-area pages; the rest are listed only.
   ========================================== */
const serviceCities = [
  {
    slug: "oshawa",
    name: "Oshawa",
    region: "Durham Region",
    core: true,
    blurb: "Oshawa is our home base for garage door repairs, security camera installs, and add-on locksmith work.",
  },
  {
    slug: "whitby",
    name: "Whitby",
    region: "Durham Region",
    core: true,
    blurb: "Whitby sits directly west of Oshawa along the Highway 401 corridor, a short trip from our base for garage door repair and security camera installation, including Brooklin to the north.",
  },
  {
    slug: "ajax",
    name: "Ajax",
    region: "Durham Region",
    core: true,
    blurb: "Ajax lies west of Whitby on the Lake Ontario shoreline. We serve Ajax homes, rental units, and businesses from our Oshawa base.",
  },
  {
    slug: "pickering",
    name: "Pickering",
    region: "Durham Region",
    core: true,
    blurb: "Pickering is the westernmost lakeshore city in Durham Region and borders Toronto. We serve Pickering from our Oshawa base with the same services we offer at home.",
  },
  {
    slug: "courtice",
    name: "Courtice",
    region: "Durham Region",
    core: true,
    blurb: "Courtice is part of the Municipality of Clarington and sits immediately east of Oshawa, making it one of the closest communities to our base.",
  },
  {
    slug: "bowmanville",
    name: "Bowmanville",
    region: "Durham Region",
    core: true,
    blurb: "Bowmanville is the largest community in Clarington, east of Courtice along Highway 401. We serve Bowmanville from our Oshawa base for garage door installation and repair and security camera systems.",
  },
  { slug: "cobourg", name: "Cobourg", region: "Northumberland County", core: false },
  { slug: "millbrook", name: "Millbrook", region: "Peterborough County", core: false },
  { slug: "kawartha-lakes", name: "Kawartha Lakes", region: "City of Kawartha Lakes", core: false },
  { slug: "peterborough", name: "Peterborough", region: "Peterborough", core: false },
  { slug: "lindsay", name: "Lindsay", region: "City of Kawartha Lakes", core: false },
  { slug: "port-perry", name: "Port Perry", region: "Durham Region", core: false },
  { slug: "uxbridge", name: "Uxbridge", region: "Durham Region", core: false },
  { slug: "stouffville", name: "Stouffville", region: "York Region", core: false },
] as const satisfies readonly ServiceCity[];

type ServiceDefinition = {
  id: string;
  tier: ServiceTier;
  name: string;
  /** Short label for navigation and form options. */
  shortName: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: SiteImageKey;
  badge?: string;
  features: readonly string[];
  seo: { title: string; description: string; h1: string };
  /** Long-form H2 sections shown below the overview (read via getServiceSections in src/lib/seo.ts). */
  sections?: readonly ServiceSection[];
  faqs: readonly ServiceFaq[];
};

export const theme = {
  /* ==========================================
     BRAND IDENTITY
     ========================================== */
  brand: {
    name: "JD Home Services",
    /** Short form used in page-title suffixes; declared as a WebSite alternateName so Google treats it as the same site name. */
    shortName: "JD Home",
    tagline: "From Install to Repair. Finished to Perfection.",
    description: "Garage door and security camera installation and repair in Oshawa, Durham Region, and surrounding areas, with locksmith and car lockout help as add-on services.",

    logo: {
      primary: "/images/logo.png",
      mark: "/images/logo-mark.png",
      markLight: "/images/logo-mark-light.png",
      pdf: "/images/logo-pdf.png",
    },

    favicon: "/favicon.ico",
  },

  /* ==========================================
     COLOURS (non-CSS consumers only)
     ========================================== */
  colors: {
    primary: {
      main: "#0E2A4D",
      dark: "#081B33",
    },
    accent: {
      gold: "#D9A93A",
    },
  },

  /* ==========================================
     CONTACT INFORMATION
     ========================================== */
  contact: {
    phone: {
      display: "(289) 991-3277",
      tel: "+12899913277",
    },
    email: "info@jdhomeservices.ca",

    address: {
      city: "Oshawa",
      region: "Ontario",
      country: "Canada",
      serviceArea: "Durham Region and surrounding areas",
      fullServiceArea: serviceCities.map((c) => c.name).join(", "),
      geo: {
        latitude: 43.8971,
        longitude: -78.8658,
      },
    },

    hours: {
      regular: {
        display: "Mon–Sun 10AM–7PM",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        time: "10:00 AM - 7:00 PM",
        opens: "10:00",
        closes: "19:00",
      },
      emergency: {
        display: "24/7 car lockout line",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        time: "24 Hours",
      },
    },

    social: {
      instagram: "https://www.instagram.com/jd.homeservices/",
      facebook: "https://www.facebook.com/jd.homeservices/",
    },

    // Google Business Profile. The count is a snapshot: update it (and asOf) as reviews come in.
    googleReviews: {
      rating: 5.0,
      count: 24,
      asOf: "2026-10-08",
      url: "https://www.google.com/maps?cid=2609295801497916011",
    },

    responseTime: {
      regular: "Call during business hours and we will confirm a realistic arrival window",
      emergency: "Our car lockout line is answered 24/7",
    },
  },

  /* ==========================================
     SERVICE CITIES (see serviceCities above)
     ========================================== */
  serviceCities,

  /* ==========================================
     ANALYTICS
     ========================================== */
  analytics: {
    // Google Tag Manager container. Loads on every page while features.analytics is true;
    // override at build time with NEXT_PUBLIC_GTM_ID. Configure GA4 inside GTM.
    gtmId: "GTM-5Q937BVV",
    // Meta (Facebook/Instagram) Pixel. Loads on public pages only while features.analytics is true;
    // override at build time with NEXT_PUBLIC_META_PIXEL_ID. Don't also add it inside GTM (double counts).
    metaPixelId: "1677401130679689",
  },

  /* ==========================================
     SEO & META INFORMATION
     ========================================== */
  seo: {
    defaultTitle: "Garage Door Company in Oshawa & Durham | JD Home Services",
    titleTemplate: "%s | JD Home Services",
    defaultDescription: "Oshawa-based garage door installation and repair, plus security camera systems for homes and businesses. Open 7 days, free quotes: (289) 991-3277.",
    keywords: "garage door company Oshawa, garage door contractor Oshawa, garage door repair Oshawa, garage door installation Oshawa, garage door opener installation Oshawa, garage door spring repair Oshawa, garage door repair Durham Region, security camera installation Oshawa, locksmith Oshawa, lock rekeying Durham Region, car lockout Oshawa",
    siteUrl: "https://www.jdhomeservices.ca",
    ogImage: "/og-image.png",
    // No X/Twitter account exists for JD Home Services. Left empty on purpose —
    // the old value pointed at an unrelated company (JD Homesolutions, San Antonio TX).
    twitterHandle: "",
  },

  /* ==========================================
     SERVICES
     Order matters: primary services first, then add-ons.
     ========================================== */
  services: {
    categories: [
      {
        id: "garage-door-repair-installation",
        tier: "primary",
        name: "Garage Door Repair",
        shortName: "Garage Doors",
        shortDescription: "Garage door repairs in Oshawa and across Durham Region: springs, cables, openers, off-track and noisy doors, plus new doors and openers when you need them.",
        description: "We repair garage doors across Oshawa and Durham Region, from broken springs and cables to openers, off-track and noisy doors, and we install new doors and openers when a repair no longer makes sense. We explain your options in plain language and do the work carefully, with safety and long-term reliability in mind.",
        icon: "Warehouse",
        image: "garageService",
        features: [
          "New garage door installation and replacement",
          "Garage door opener installation and repair",
          "Broken spring and cable replacement",
          "Repairs for stuck, noisy, or off-track doors",
          "Remote and keypad setup",
          "Safety and balance check on every visit",
        ],
        seo: {
          title: "Garage Door Repair Oshawa | Springs, Openers | JD Home",
          description:
            "Broken spring, snapped cable or a door off its track? Oshawa-based garage door repair and installation across Durham. Free quotes: (289) 991-3277.",
          h1: "Garage Door Repair in Oshawa & Durham Region",
        },
        sections: [
          {
            heading: "Garage door repair in Oshawa: what we fix",
            paragraphs: [
              "We are based in Oshawa, and most of the garage door calls we take start the same way: a door that was fine yesterday is heavy, crooked, loud or simply refuses to move today. We look at the whole door rather than only the part that gave out, because one worn component usually puts extra strain on everything connected to it.",
              "These are the problems we repair most often, from the springs overhead to the opener on the ceiling:",
            ],
            bullets: [
              "Springs: a snapped spring is the usual reason a door suddenly feels far too heavy to lift or stops a few inches off the floor. Our garage door spring and cable repair service replaces it with a correctly matched part and rebalances the door.",
              "Cables: frayed, slack or broken lift cables leave one side of the door lower than the other. We replace the cable and check the drums it winds around so the door lifts evenly again.",
              "Rollers and hinges: worn rollers cause grinding, shaking and jerky travel. Swapping them out is often the simplest way to make a rough door run smoothly again.",
              "Off-track doors: a bump from a vehicle or a failed cable can pull rollers out of the track. We set the door back in place, straighten or replace bent track, and find out why it came off in the first place.",
              "Noisy doors: squealing, banging and rattling almost always point to a specific worn part. We track down the cause instead of just spraying lubricant and hoping.",
              "Damaged panels: a dented or cracked section can sometimes be replaced on its own, as long as a matching section is still available for your door.",
              "Openers: dead remotes, keypads that stop responding, blinking safety sensors and motors that hum without moving are all handled by our garage door opener installation and repair service.",
            ],
          },
          {
            heading: "Is it safe to use the door? What to do before we arrive",
            paragraphs: [
              "If the door looks crooked, made a loud bang, or suddenly feels much heavier than usual, leave it where it is. Running the opener against a broken spring or a slack cable can bend the track, strain the motor and turn one repair into several.",
              "Springs, cables and the bottom brackets hold a great deal of tension, so please do not try to loosen, adjust or remove them yourself. If the door is stuck open, unplug the opener and keep children, pets and vehicles away from the opening until it has been looked at.",
              "When you call, tell us what you see and hear: a gap in a spring, a cable hanging loose, a door sitting at an angle, or an opener that clicks without lifting. That helps us understand the problem before the visit, and we will confirm a realistic arrival window during the call.",
            ],
          },
          {
            heading: "What a repair visit looks like",
            paragraphs: [
              "Every repair follows the same straightforward order, so you always know what is happening and why:",
            ],
            bullets: [
              "Diagnose: we inspect the springs, cables, rollers, tracks, panels and opener, not only the part you called about.",
              "Explain: we tell you what we found in plain language, and whether repairing or replacing makes more sense for your door.",
              "Quote: you get a free, no-obligation quote before any work begins, with no pressure to go ahead.",
              "Fix: we carry out the work you approved, with safety and long-term reliability in mind.",
              "Check: every visit ends with a safety and balance check, including the auto-reverse and the safety sensors.",
              "Walk-through: we test everything and walk you through it before we leave, so you know how the door should feel and sound from now on.",
            ],
          },
          {
            heading: "Repair or replace?",
            paragraphs: [
              "Most problems with springs, cables, rollers and openers can be fixed, and on a door that is otherwise in good shape, a repair is usually the sensible choice. You get honest advice on repair versus replacement, and we will not talk you into a new door you do not need.",
              "Replacement starts to make sense when several panels are badly dented or rusted through, when the same parts keep failing, or when you want better insulation and a fresh look for the front of the house. Our guide on whether to repair or replace a garage door walks through the warning signs in more detail if you would like to read up before we visit.",
            ],
          },
          {
            heading: "New doors and openers",
            paragraphs: [
              "When a new door really is the better option, we take care of that too. Our new garage door installation service covers removal of the old door, installation, balancing, opener setup, and a full safety test. If the door itself is sound and only the opener is failing, a replacement opener can usually be fitted to the existing door once we have confirmed the springs and balance are right. Either way, the quote comes first and the walk-through comes last.",
            ],
          },
          {
            heading: "Who we work with",
            paragraphs: [
              "Most of our garage door work is for homeowners in Oshawa and the rest of Durham Region, from single doors on older houses to double doors on newer builds. Landlords and property managers call us to keep the doors at rental homes working between tenants, often alongside rekeying and cameras covering entrances and parking. For retail and small business clients, we also look after doors at small commercial properties such as storefronts and stock rooms.",
            ],
          },
        ],
        faqs: [
          {
            question: "Do you repair garage doors, or only install new ones?",
            answer:
              "We do both. Our garage door service covers repair and troubleshooting of existing doors as well as new door installation and replacement. If your door is off-track, noisy, or damaged, we diagnose the issue and let you know whether a repair or a replacement is the more sensible choice.",
          },
          {
            question: "My garage door is off-track or noisy. Can that be repaired?",
            answer:
              "In many cases, yes. Off-track, noisy, and rough-running doors are often caused by worn or misaligned tracks, rollers, cables, or other hardware, and we handle those adjustments and replacements as part of our repair service. It is best to stop using the door until it has been inspected, since operating an off-track door can cause further damage. Once the work is done, we complete a safety inspection and balance test.",
          },
          {
            question: "Do you install and set up garage door openers?",
            answer:
              "Yes. Opener setup and operational checks are part of our garage door service, whether the opener is going in with a new door or being added to an existing one. After installation we test the door's travel, balance, and safety features so the system runs smoothly and safely from the start.",
          },
          {
            question: "How do I know whether to repair or replace my garage door?",
            answer:
              "It depends on the condition of the door, its hardware, and how it has been operating. Isolated problems such as a worn roller, a frayed cable, or a door that has come off its track can usually be repaired, while a door that is badly damaged, unsafe, or repeatedly failing may be better replaced. We inspect the whole system, explain what we find, and give you a straightforward recommendation for repair versus replacement.",
          },
          {
            question: "Do you service garage doors outside Oshawa?",
            answer:
              "Yes. We repair and install garage doors from our Oshawa base across Durham Region, including Whitby, Ajax, Pickering, Courtice, and Bowmanville, and we also travel to nearby communities such as Port Perry, Uxbridge, Cobourg, Peterborough, and Lindsay. Call us with your location and we will confirm availability.",
          },
          {
            question: "Do you replace broken garage door springs?",
            answer:
              "Yes, it is one of the repairs we do most. We replace the broken spring with one matched to your door, check the cables and drums while we are there, and finish with a balance test and safety check. If your door uses a pair of springs, we will tell you whether replacing both together makes sense so the door stays balanced.",
          },
          {
            question: "How much does garage door repair cost?",
            answer:
              "Every job is different, so we don't publish set prices. The cost depends on what has failed (a spring, a cable, rollers or the opener), the size and weight of the door, and whether parts should be replaced in pairs. We inspect the door, explain what we found, and give you a free, no-obligation quote before any work begins.",
          },
        ],
      },
      {
        id: "security-camera-installation",
        tier: "primary",
        name: "Security Camera Installation",
        shortName: "Security Cameras",
        shortDescription: "Smart security cameras installed at your home or business, with alerts and live video on your phone.",
        description: "We plan and install security camera systems for homes, workplaces, and rental properties, and we service the systems we put in. Our smart cameras can tell people and cars apart, so you only get alerts that matter. Each camera connects with one wired cable that carries both power and video (known as PoE), recordings are saved on a recorder at your property, and you can watch live, replay footage, and search it from your phone.",
        icon: "Cctv",
        image: "cctvInstall",
        features: [
          "Indoor and outdoor cameras installed for homes and businesses",
          "Smart alerts that tell people and cars apart",
          "Find footage fast by typing what you're looking for",
          "Reliable wired cameras: one cable for power and video",
          "Recordings saved at your property, not in someone else's cloud",
          "Watch live and replay footage on your phone",
          "Wide-view, turn-and-zoom, and doorbell cameras",
          "Camera placement planning and a full walkthrough",
        ],
        seo: {
          title: "Security Camera Installation Oshawa & Durham | JD Home",
          description:
            "Smart security camera (CCTV) installation in Oshawa and Durham Region: people and car alerts, easy footage search, wired cameras, phone access.",
          h1: "Security Camera Installation in Oshawa & Durham Region",
        },
        sections: [
          {
            heading: "Wired camera systems for Oshawa and Durham Region properties",
            paragraphs: [
              "From our base in Oshawa, we install wired security camera systems for houses, rental properties and businesses across Durham Region. Each camera runs on a single PoE cable that carries both power and video, recordings are kept on a network video recorder (NVR) at the property, and the phone app lets you watch live, replay clips and receive alerts wherever you are.",
              "Smart detection separates people and vehicles from shadows, rain and passing animals, so your phone only buzzes for the events you care about. On systems that support it, smart search lets you type a short description and jump straight to the matching footage instead of scrolling through a whole afternoon of video.",
            ],
          },
          {
            heading: "Planning coverage before anything is mounted",
            paragraphs: [
              "Every install starts with a walk around the property to agree where each camera should go: front and side entrances, the driveway, the backyard, parking areas or a stock room. Getting the angles right does more for your coverage than simply adding more cameras. At rentals, we aim cameras at shared entrances and parking without pointing them into a neighbour's yard.",
              "On installation day we route the cabling as neatly as the building allows, set up the recorder and the app on your phone, and test every camera from your phone before we pack up. We finish with a full walkthrough so you know how to find a clip when you need one.",
            ],
          },
        ],
        faqs: [
          {
            question: "What does AI person detection actually do?",
            answer:
              "Smart cameras analyse what they see and can tell a person or a vehicle apart from things like swaying branches, headlights, or passing animals. That means your phone alerts are about the events you care about instead of every bit of movement, and recordings are tagged so they are easier to review later.",
          },
          {
            question: "Can I really search my footage instead of scrubbing through hours of video?",
            answer:
              "Yes, on systems that support smart search. Recordings are indexed as snapshots, so you can type a short description, such as a person near the side door or a vehicle in the driveway, and jump straight to matching moments across your cameras. We set this up during installation and show you how to use it.",
          },
          {
            question: "What is PoE, and why do you recommend wired cameras?",
            answer:
              "PoE stands for Power over Ethernet. A single network cable delivers both power and the video signal to each camera, so there is no need for a power outlet at every camera location. Wired PoE cameras avoid the dropouts and battery changes that can come with Wi-Fi cameras, which makes them a dependable choice for continuous recording.",
          },
          {
            question: "Where is my footage stored, and can I watch it on my phone?",
            answer:
              "Footage records to a network video recorder (NVR) installed at your home or business, so your recordings stay on your property. Once the system is connected to your internet, you can view live video, play back recordings, and receive alerts from the camera app on your phone.",
          },
          {
            question: "Do you install cameras for businesses as well as homes?",
            answer:
              "Yes. We install camera systems for houses, rental properties, offices, storefronts, and other workspaces. Every property is different, so we talk through what you want to cover, such as entrances, driveways, parking areas, or stock rooms, and recommend a camera layout that fits.",
          },
        ],
      },
      {
        id: "locksmith",
        tier: "addon",
        name: "Locksmith",
        shortName: "Locksmith",
        shortDescription: "New locks installed, old locks changed or rekeyed (so old keys stop working), and repairs for homes, rentals, and businesses.",
        description: "Our locksmith service covers the everyday security work property owners rely on. We handle lock changes, rekeying, deadbolt and knob replacement, hardware upgrades, lock repairs, and security checks for homes, offices, storefronts, and rental properties throughout Durham and surrounding areas. It pairs naturally with a camera install when you are upgrading a property's security.",
        icon: "KeyRound",
        image: "locksmith",
        features: [
          "Residential and commercial lock changes",
          "Lock repair, replacement, and alignment",
          "Rekeying for homes, offices, and rental units",
          "Deadbolt, knob, lever, and entry hardware installation",
          "Security upgrades after move-ins or tenant turnover",
          "Clear recommendations and professional workmanship",
        ],
        seo: {
          title: "Locksmith Oshawa | Lock Changes & Rekeying | JD Home",
          description:
            "Lock changes, rekeying after a move or tenant turnover, deadbolt installs and lock repair in Oshawa and Durham. Open 7 days. Free quotes: (289) 991-3277.",
          h1: "Locksmith Services in Oshawa & Durham Region",
        },
        sections: [
          {
            heading: "Lock changes and rekeying in Oshawa",
            paragraphs: [
              "From our base in Oshawa, we change and rekey locks for houses, rental units, offices and storefronts. Most of these calls come from people who have just moved in, landlords getting a unit ready between tenants, and owners who have simply lost track of how many keys are out there.",
              "Rekeying changes the pins inside the lock so the old keys stop working, while the existing hardware stays on the door. A lock change swaps the hardware itself, which is the better route when a lock is worn, damaged, or not the style or strength you want. We do both, and we will tell you plainly which one suits your doors.",
            ],
          },
          {
            heading: "Rekey or replace: which do you need?",
            paragraphs: [
              "If your locks turn smoothly and you are happy with how they look, rekeying is usually all you need. If a lock sticks, the bolt does not line up with the frame, or you want sturdier hardware, replacing it is the better choice. Our guide, Rekey or Replace Your Locks? What to Do After Moving In, explains the difference in more detail.",
            ],
          },
          {
            heading: "Deadbolts, knobs, levers and entry hardware",
            paragraphs: [
              "We install new deadbolts, door knobs, levers and handle sets, and we replace tired entry hardware on front, side and back doors. A good install is about more than the lock itself: we make sure the bolt fully extends, the strike plate lines up with the frame, and the door latches without being pushed or lifted.",
              "Doors shift as houses settle and seasons change, which is a common reason locks start to stick or stop latching. Lock repair and alignment can often fix that without replacing anything, and we will say so when it is the better option.",
            ],
            bullets: [
              "Deadbolt installation and replacement",
              "Door knob, lever and handle set installation",
              "Strike plate and latch alignment",
              "Repairs for sticking, stiff or worn locks",
            ],
          },
          {
            heading: "For landlords and property managers",
            paragraphs: [
              "Tenant turnover is the most common reason landlords call us. Rekeying between tenants means the previous occupant's keys no longer open the unit, without replacing the hardware every time a lease ends. Booking it for the days after a move-out inspection means the incoming tenant starts with keys that nobody else holds.",
              "Because we also install security cameras and look after garage doors, we can cover entrances and parking areas with cameras and keep the garage door at a rental home working, all from one local team. That means fewer contractors to coordinate and one number to call for the property.",
            ],
          },
          {
            heading: "For storefronts and offices",
            paragraphs: [
              "Businesses call us for lock changes after a staff member leaves, rekeying when keys have gone missing, and sturdier entry hardware on front doors, back doors and stock rooms. Let us know your opening hours when you call and we will plan the visit around them where we can. When a key has left with a former employee, rekeying the affected locks is usually less disruptive than replacing them.",
              "Many shops and offices pair a lock review with a security camera installation that covers the entrance, the counter and the stock room, so the doors that matter are both secured and recorded.",
            ],
          },
          {
            heading: "What our locksmith service covers",
            paragraphs: [
              "Our locksmith work is planned lock work during our regular hours, every day from 10 AM to 7 PM: lock changes, rekeying, deadbolt, knob and lever installs, lock repair and alignment, and security upgrades after a move-in or tenant turnover.",
              "If you are locked out of a vehicle, call our 24/7 car lockout line instead. For anything not listed here, call and ask, and we will tell you honestly whether it is something we handle.",
              "To get a quote, tell us how many doors are involved, whether you are after rekeying, new hardware or a repair, and roughly when you would like the work done. You get a free, no-obligation quote before any work begins, and we finish by testing every lock and key with you.",
            ],
          },
          {
            heading: "Locksmith work across Durham Region",
            paragraphs: [
              "We travel from Oshawa for lock changes and rekeying throughout Durham Region. In Whitby and Brooklin, we change locks for new homeowners and between tenants at rental units. In Ajax, we install deadbolts and replace worn entry hardware on houses and rentals. In Pickering, we handle lock changes for homes, offices and storefronts. In Courtice, part of the Municipality of Clarington, we make sure the old keys stop working for people who have just bought a home. In Bowmanville, also in Clarington, we repair and realign locks that no longer latch properly and install new deadbolts.",
            ],
          },
        ],
        faqs: [
          {
            question: "Should I rekey or replace my locks after moving in or changing tenants?",
            answer:
              "Rekeying keeps your existing hardware and changes the lock so previous keys no longer work, which is often enough after a move-in or tenant turnover when the locks are in good condition. Replacement makes more sense when the hardware is worn, damaged, or due for a security upgrade. We look at your doors and give you a clear recommendation rather than suggesting work you do not need.",
          },
          {
            question: "Can you install deadbolts and new door hardware?",
            answer:
              "Yes. We install deadbolts, knobs, levers, and other entry hardware for homes, offices, storefronts, and rental units, and we handle hardware upgrades and lock alignment on existing doors. Every install is finished with attention to fit and smooth, reliable operation.",
          },
          {
            question: "Which areas do you cover for locksmith service?",
            answer:
              "We are based in Oshawa and provide locksmith service throughout Durham Region, including Whitby, Ajax, Pickering, Courtice, and Bowmanville. We also travel to nearby communities such as Port Perry, Uxbridge, Stouffville, Cobourg, Peterborough, and Lindsay. If you are not sure whether we cover your location, call us and we will let you know.",
          },
          {
            question: "How do I get a quote for locksmith work?",
            answer:
              "Call us at (289) 991-3277 or send a request through our contact page with a short description of the job, such as how many doors are involved and whether you need rekeying, repair, or new hardware. We will talk through the options and give you clear recommendations before any work begins. Our regular hours are every day, 10 AM to 7 PM.",
          },
          {
            question: "Can you rekey all my locks to one key?",
            answer:
              "Often, yes, depending on the key type. When the locks on your doors take the same kind of key, we can usually rekey them so a single key opens the front, back and side doors. Locks that take different key types may not be compatible, so we check your hardware first and explain the options, including replacing a lock where that is the simpler fix.",
          },
          {
            question: "Do you handle lock changes for businesses?",
            answer:
              "Yes. We change and rekey locks for offices, storefronts and other workplaces, including back doors and stock rooms. It is a common request after a staff change or when keys go missing. Tell us how many doors are involved and when you are open, and we will give you a free, no-obligation quote and plan the work around your business where we can.",
          },
        ],
      },
      {
        id: "car-lockout",
        tier: "addon",
        name: "Car Lockout",
        shortName: "Car Lockout",
        shortDescription: "Damage-free vehicle entry, any time, anywhere in Durham and surrounding regions.",
        description: "Locked your keys in the car or dealing with a stuck vehicle lock? We provide car lockout help with damage-free entry methods whenever possible. Our goal is simple: get you back into your vehicle quickly, safely, and without adding more stress to your day.",
        icon: "Car",
        image: "carLockout",
        badge: "24/7",
        features: [
          "24/7 availability, including evenings and weekends",
          "Serving Oshawa, Durham Region and surrounding communities",
          "Damage-free vehicle entry whenever possible",
          "Help with keys locked inside or malfunctioning locks",
          "Service for most cars, SUVs, vans, and light trucks",
          "Upfront communication before work begins",
        ],
        seo: {
          title: "24/7 Car Lockout Service Oshawa & Durham | JD Home",
          description:
            "Locked out of your car in Oshawa or Durham Region? Get 24/7 car lockout help with damage-free entry when possible. Call JD Home Services: (289) 991-3277.",
          h1: "24/7 Car Lockout Service in Oshawa & Durham Region",
        },
        sections: [
          {
            heading: "Car lockout help in Oshawa and across Durham Region",
            paragraphs: [
              "Our car lockout line is answered 24/7, including evenings, weekends and holidays. Whether the keys are sitting on the seat in a parking lot in Oshawa or the lock has jammed in your own driveway in Whitby, Ajax, Pickering, Courtice or Bowmanville, call (289) 991-3277 at any hour and we will help you get back into the vehicle.",
              "We use damage-free entry methods whenever possible and explain what we plan to do before we start, so there are no surprises. Lockout service covers most cars, SUVs, vans and light trucks, and it is the one part of our work that runs outside our regular 10 AM to 7 PM hours.",
            ],
          },
          {
            heading: "What to expect when you call about a car lockout",
            paragraphs: [
              "Tell us where you are, what you are driving, and whether the keys are locked inside or the lock itself has stopped working. We confirm the details, give you a realistic arrival estimate based on your location, the time of day and traffic, and keep you posted by phone while you wait.",
              "Once the door is open, we check that the door and lock work normally before we leave. If the lock turns out to be damaged, we explain what we found and your options rather than guessing. Keep your phone switched on and nearby so we can reach you if we need directions to the vehicle.",
            ],
          },
        ],
        faqs: [
          {
            question: "Are you available 24/7 for car lockouts?",
            answer:
              "Yes. Car lockout help is available 24 hours a day, seven days a week, including evenings and weekends. Call (289) 991-3277 at any time and we will confirm your location and give you an arrival estimate.",
          },
          {
            question: "Will unlocking my car damage the door or lock?",
            answer:
              "We use damage-free entry methods whenever possible, so in most cases your door and lock are left exactly as they were. If the vehicle or the condition of the lock means damage-free entry is not realistic, we explain the situation and your options before any work begins.",
          },
          {
            question: "How quickly can you reach me in Oshawa or Durham Region?",
            answer:
              "Oshawa is our home base, so nearby areas are usually the quickest to reach, and we cover the rest of Durham Region and surrounding communities from there. Arrival time depends on your location, the time of day, and traffic. When you call, we will confirm where you are and give you a realistic arrival estimate before we head out.",
          },
          {
            question: "What kinds of vehicles can you open?",
            answer:
              "We provide lockout service for most cars, SUVs, vans, and light trucks. When you call, let us know the make and model of your vehicle so we can confirm we are able to help before we head out.",
          },
          {
            question: "What should I have ready when I call about a lockout?",
            answer:
              "Have your exact location ready, such as a street address, the nearest intersection, or the name of the parking lot, along with your vehicle's make, model, and colour. Let us know whether the keys are locked inside or the lock itself is not working, and keep your phone nearby so we can send arrival updates. We will confirm the details and explain the next steps before we head out.",
          },
        ],
      },
    ] as const satisfies readonly ServiceDefinition[],

    /**
     * Garage door hub + the three garage sub-service pages, for the header dropdown,
     * footer, and home page. Slugs are fixed by src/content/garageServices.ts; the
     * names double as link text, so keep them in step with the anchor map there
     * (any label containing "installation" must never point at the hub).
     */
    garageLinks: [
      {
        name: "All garage door repairs",
        href: "/services/garage-door-repair-installation/",
        icon: "Warehouse",
        description: "Springs, cables, rollers, openers, and off-track or noisy doors.",
      },
      {
        name: "New garage door installation",
        href: "/services/garage-door-installation/",
        icon: "DoorOpen",
        description: "Old or damaged doors replaced, balanced, and safety-tested.",
      },
      {
        name: "Garage door opener installation & repair",
        href: "/services/garage-door-opener-installation/",
        icon: "Cog",
        description: "Openers, remotes, keypads, and safety sensors.",
      },
      {
        name: "Garage door spring & cable repair",
        href: "/services/garage-door-spring-repair/",
        icon: "Zap",
        description: "Broken springs and cables replaced and the door rebalanced.",
      },
    ],
  },

  /* ==========================================
     CLIENT SEGMENTS
     ========================================== */
  clients: {
    segments: [
      {
        id: "homeowners",
        name: "Homeowners",
        description: "Garage door repairs and new doors, camera systems you can check from your phone, and lock changes after a move.",
        icon: "Home",
      },
      {
        id: "landlords",
        name: "Landlords & Property Managers",
        description: "Cameras for entrances and parking, garage door upkeep, and rekeying between tenants.",
        icon: "Building2",
      },
      {
        id: "businesses",
        name: "Retail & Small Business",
        description: "Camera coverage for storefronts, stock rooms, and lots, plus commercial doors and entry hardware.",
        icon: "Store",
      },
    ],
  },

  /* ==========================================
     COMPANY PARTNERS
     ========================================== */
  partners: {
    companies: [
      {
        id: "mtli",
        name: "MTLI",
        description: "Commercial and facility support projects.",
        logo: "/images/partners/mtli.svg",
      },
      {
        id: "tke",
        name: "TKE",
        description: "Reliable service coordination and on-site support.",
        logo: "/images/partners/tke.svg",
      },
      {
        id: "symposium-cafe",
        name: "Symposium Cafe",
        description: "Hospitality-focused service support for active restaurant locations.",
        logo: "/images/partners/symposiumcafe.svg",
      },
    ],
  },

  /* ==========================================
     TESTIMONIALS
     ========================================== */
  // Real Google reviews, quoted word for word (trimmed only at the ends). serviceIds drive which
  // pages show them; a review with none is general and shows wherever the full list does.
  testimonials: [
    {
      id: 1,
      quote: "I called to inquire about getting my garage door springs replaced and Jay arrived an hour later and had them replaced an hour after that. 2 hours from call to finished product. Pretty amazing!",
      author: "Dave K.",
      service: "Garage door spring repair",
      serviceIds: ["garage-door-repair-installation"],
      rating: 5,
    },
    {
      id: 2,
      quote: "Great work by Jay on our two garage doors. He installed new weather stripping, seals at base of doors and replaced some worn rollers. Also adjusted spring. Very knowledgeable and great customer service.",
      author: "Kirk L.",
      service: "Garage door repair",
      serviceIds: ["garage-door-repair-installation"],
      rating: 5,
    },
    {
      id: 3,
      quote: "Jay did a wonderful job in my home. I would hire him again for my locks. I would also consider hiring him for my garage door. He was very friendly and helpful!",
      author: "Laurie",
      service: "Locksmith",
      serviceIds: ["locksmith"],
      rating: 5,
    },
    {
      id: 4,
      quote: "I have used them for my broken garage. His Quality of work is really good. Explains well before doing anything.",
      author: "Prince M.",
      service: "Garage door repair",
      serviceIds: ["garage-door-repair-installation"],
      rating: 5,
    },
    {
      id: 5,
      quote: "Great fast & efficient service. Fair pricing. Good workmanship",
      author: "Val S.",
      service: "Home service",
      serviceIds: [],
      rating: 5,
    },
    {
      id: 6,
      quote: "Excellent service and very professional workmanship!",
      author: "Sai Teja P.",
      service: "Locks and garage door",
      serviceIds: ["locksmith", "garage-door-repair-installation"],
      rating: 5,
    },
  ],

  /* ==========================================
     FEATURE FLAGS
     ========================================== */
  features: {
    testimonials: true,
    analytics: true,
  },
} as const;

export type Theme = typeof theme;
export default theme;
