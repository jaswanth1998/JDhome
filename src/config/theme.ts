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
    blurb: "Oshawa is our home base, so it is the area we can usually reach most quickly for garage door repairs, security camera installs, and add-on locksmith work.",
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
    blurb: "Bowmanville is the largest community in Clarington, east of Courtice along Highway 401. We serve Bowmanville from our Oshawa base for garage door repair and installation and security camera systems.",
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
  faqs: readonly ServiceFaq[];
};

export const theme = {
  /* ==========================================
     BRAND IDENTITY
     ========================================== */
  brand: {
    name: "JD Home Services",
    tagline: "From Install to Repair. Finished to Perfection.",
    description: "Garage door repair and installation and smart security camera systems in Oshawa and Durham Region, with locksmith and car lockout help as add-on services.",

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
    email: "Info@jdhomeservices.ca",

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
        display: "Mon–Fri 8AM–6PM",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        time: "8:00 AM - 6:00 PM",
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
  },

  /* ==========================================
     SEO & META INFORMATION
     ========================================== */
  seo: {
    defaultTitle: "Garage Door Repair & Security Cameras Oshawa | JD Home",
    titleTemplate: "%s | JD Home Services",
    defaultDescription: "Garage door repair and installation plus smart security cameras in Oshawa and Durham Region. Locksmith and 24/7 car lockout too. Call (289) 991-3277.",
    keywords: "garage door repair Oshawa, garage door installation Durham Region, garage door spring repair Oshawa, security camera installation Oshawa, CCTV installation Durham Region, PoE camera system, locksmith Oshawa, car lockout Oshawa",
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
        name: "Garage Door Repair & Installation",
        shortName: "Garage Doors",
        shortDescription: "Repairs, spring and cable work, openers, and new door installation for safe, smooth daily operation.",
        description: "We repair and install garage doors and related hardware for homeowners and businesses who need dependable performance and safe operation. Whether your door is stuck, off-track, noisy, damaged, or ready for replacement, we diagnose the issue clearly, explain your options, and complete the work with attention to safety, fit, and long-term reliability.",
        icon: "Warehouse",
        image: "garageService",
        features: [
          "Garage door repair and troubleshooting",
          "Broken spring and cable replacement",
          "Track, roller, and hinge adjustments",
          "Opener installation, repair, and remote setup",
          "New garage door installation and replacement",
          "Safety inspection and balance testing on every visit",
        ],
        seo: {
          title: "Garage Door Repair & Installation Oshawa | JD Home",
          description:
            "Garage door repair, spring and cable replacement, opener work, and new door installation in Oshawa and Durham Region, with safety and balance checks.",
          h1: "Garage Door Repair & Installation in Oshawa & Durham Region",
        },
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
        ],
      },
      {
        id: "security-camera-installation",
        tier: "primary",
        name: "CCTV & Smart Security Cameras",
        shortName: "Security Cameras",
        shortDescription: "AI-powered camera systems for homes and businesses: PoE wiring, local recording, smart search, and live view on your phone.",
        description: "We design and install security camera systems for homes, workplaces, and rental properties. Our installs use modern smart cameras with AI person and vehicle detection, wired with Power over Ethernet (PoE) so a single cable carries both power and video. Footage records to a network video recorder (NVR) kept at your property, and you can watch live, play back recordings, and search your footage from your phone.",
        icon: "Cctv",
        image: "cctvInstall",
        features: [
          "Indoor and outdoor camera installation for homes and businesses",
          "AI person and vehicle detection to cut down on false alerts",
          "Smart search: describe what you are looking for and find matching snapshots",
          "Power over Ethernet (PoE) wiring: one cable for power and video",
          "Local recording to an NVR at your property",
          "Live view, playback, and alerts on your phone",
          "Dome, bullet, turret, PTZ, 360° panoramic, and doorbell cameras",
          "Camera placement planning and a full walkthrough of your system",
        ],
        seo: {
          title: "Security Camera & CCTV Installation Oshawa | JD Home",
          description:
            "Smart CCTV installation in Oshawa and Durham Region: AI person detection, smart footage search, PoE wiring, local NVR recording, and phone access.",
          h1: "Security Camera & CCTV Installation in Oshawa & Durham Region",
        },
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
        shortDescription: "Lock changes, rekeying, repairs, and new hardware for homes, rentals, and businesses.",
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
          title: "Locksmith in Oshawa & Durham Region | JD Home Services",
          description:
            "Lock changes, rekeying, deadbolt installs, and lock repair for homes, rentals, and businesses in Oshawa and Durham Region. Licensed and insured.",
          h1: "Locksmith Services in Oshawa & Durham Region",
        },
        faqs: [
          {
            question: "Do you handle both residential and commercial locksmith work?",
            answer:
              "Yes. Our locksmith service covers homes, offices, storefronts, and rental properties throughout Durham Region and surrounding areas. Typical jobs include lock changes, lock repair and alignment, rekeying, and installing new deadbolts, knobs, levers, and entry hardware.",
          },
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
              "Call us at (289) 991-3277 or send a request through our contact page with a short description of the job, such as how many doors are involved and whether you need rekeying, repair, or new hardware. We will talk through the options and give you clear recommendations before any work begins. Our regular hours are Monday to Friday, 8 AM to 6 PM.",
          },
        ],
      },
      {
        id: "car-lockout",
        tier: "addon",
        name: "Car Lockout",
        shortName: "Car Lockout",
        shortDescription: "Damage-free vehicle entry, any time, anywhere in Durham and surrounding regions.",
        description: "Locked your keys in the car or dealing with a stuck vehicle lock? We provide car lockout assistance with non-destructive entry methods whenever possible. Our goal is simple: get you back into your vehicle quickly, safely, and without adding more stress to your day.",
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
        faqs: [
          {
            question: "Are you available 24/7 for car lockouts?",
            answer:
              "Yes. Car lockout help is available 24 hours a day, seven days a week, including evenings and weekends. Call (289) 991-3277 at any time and we will confirm your location and give you an arrival estimate.",
          },
          {
            question: "Will unlocking my car damage the door or lock?",
            answer:
              "We use non-destructive entry methods whenever possible, so in most cases your door and lock are left exactly as they were. If the vehicle or the condition of the lock means damage-free entry is not realistic, we explain the situation and your options before any work begins.",
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
  testimonials: [
    {
      id: 3,
      quote: "Reliable and trustworthy. They fixed our garage door issue quickly and explained exactly what needed repair. Quality work at a fair price.",
      author: "Jennifer L.",
      service: "Garage Door Repair & Installation",
      rating: 5,
    },
    {
      id: 2,
      quote: "We needed our locks changed after moving in. The work was clean, the advice was honest, and everything feels much more secure now.",
      author: "David K.",
      service: "Locksmith",
      rating: 5,
    },
    {
      id: 1,
      quote: "Fast, professional service when we got locked out at 11 PM. They arrived within 30 minutes and had us back inside quickly. Highly recommend!",
      author: "Sarah M.",
      service: "Car Lockout",
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
