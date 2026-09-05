/**
 * JD Home Services - CENTRALIZED THEME CONFIGURATION
 *
 * This file contains ALL customizable branding elements for the website.
 * Edit colors, typography, logos, contact info, and spacing from this single file.
 *
 * How to use:
 * 1. Update values in this file to change branding across the entire site
 * 2. Import this theme in components: import { theme } from '@/config/theme'
 * 3. Access values: theme.colors.primary.main, theme.typography.fontFamily.heading, etc.
 */

export type ServiceCity = {
  slug: string;
  name: string;
  region: string;
  core: boolean;
  blurb?: string;
};

export type ServiceFaq = { question: string; answer: string };

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
    blurb: "Oshawa is our home base, so it is the area we can usually reach most quickly for locksmith work, car lockouts, and garage door repair.",
  },
  {
    slug: "whitby",
    name: "Whitby",
    region: "Durham Region",
    core: true,
    blurb: "Whitby sits directly west of Oshawa along the Highway 401 corridor, a short trip from our base for lock changes, car lockouts, and garage door work, including Brooklin to the north.",
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
    blurb: "Pickering is the westernmost lakeshore city in Durham Region and borders Toronto. We serve Pickering from our Oshawa base with the same three services we offer at home.",
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
    blurb: "Bowmanville is the largest community in Clarington, east of Courtice along Highway 401. We serve Bowmanville from our Oshawa base for lock changes, car lockouts, and garage door repair and installation.",
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

export const theme = {
  /* ==========================================
     BRAND IDENTITY
     ========================================== */
  brand: {
    name: "JD Home Services",
    tagline: "From Install to Repair. Finished to Perfection.",
    description: "Professional locksmith, car lockout, and garage door repair services in Oshawa, Ontario.",

    logo: {
      primary: "/images/logo.png",
      pdf: "/images/logo-pdf.png",
    },

    favicon: "/favicon.ico",
  },

  /* ==========================================
     COLOR PALETTE
     ========================================== */
  colors: {
    primary: {
      main: "#1B3A5F",
      light: "#2B4A6F",
      dark: "#0B2A4F",
      contrast: "#FFFFFF",
    },

    secondary: {
      main: "#4A5568",
      light: "#5A6578",
      dark: "#3A4558",
      contrast: "#FFFFFF",
    },

    accent: {
      teal: "#06B6D4",
      tealHover: "#0891B2",
      orange: "#F59E0B",
      orangeHover: "#D97706",
    },

    neutral: {
      white: "#FFFFFF",
      offWhite: "#FAFAFA",
      lightestGray: "#F9FAFB",
      lightGray: "#F3F4F6",
      gray: "#9CA3AF",
      mediumGray: "#6B7280",
      darkGray: "#4B5563",
      charcoal: "#1F2937",
      black: "#111827",
    },

    text: {
      primary: "#1F2937",
      secondary: "#4A5568",
      muted: "#6B7280",
      inverse: "#FFFFFF",
    },

    background: {
      primary: "#FFFFFF",
      secondary: "#F3F4F6",
      dark: "#1F2937",
      darker: "#111827",
    },

    button: {
      primary: {
        bg: "#06B6D4",
        text: "#FFFFFF",
        hover: "#0891B2",
        active: "#0E7490",
      },
      emergency: {
        bg: "#F59E0B",
        text: "#FFFFFF",
        hover: "#D97706",
        active: "#B45309",
      },
      secondary: {
        bg: "#4A5568",
        text: "#FFFFFF",
        hover: "#374151",
        active: "#1F2937",
      },
      outline: {
        bg: "transparent",
        text: "#1B3A5F",
        border: "#1B3A5F",
        hover: "#1B3A5F",
        hoverText: "#FFFFFF",
      },
    },

    border: {
      light: "#E5E7EB",
      medium: "#D1D5DB",
      dark: "#9CA3AF",
      focus: "#06B6D4",
    },

    states: {
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
    },

    serviceCategories: {
      smartLock: "#06B6D4",
      emergency: "#F59E0B",
      traditional: "#1B3A5F",
      garageDoor: "#8B5CF6",
    },
  },

  /* ==========================================
     TYPOGRAPHY
     ========================================== */
  typography: {
    fontFamily: {
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Courier New', monospace",
    },

    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },

    headings: {
      h1: {
        fontSize: "3rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "2.25rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.5,
      },
    },

    headingsMobile: {
      h1: {
        fontSize: "2.25rem",
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
    },
  },

  /* ==========================================
     SPACING & LAYOUT
     ========================================== */
  spacing: {
    0: "0",
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
  },

  layout: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
      "2xl": "1400px",
      full: "100%",
    },

    section: {
      paddingY: {
        mobile: "2.5rem",
        tablet: "4rem",
        desktop: "5rem",
      },
      paddingX: {
        mobile: "1rem",
        tablet: "1.5rem",
        desktop: "2rem",
      },
    },

    grid: {
      gap: {
        mobile: "1.25rem",
        desktop: "1.875rem",
      },
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
      },
    },

    header: {
      height: "80px",
      heightMobile: "64px",
    },
    footer: {
      minHeight: "400px",
    },
  },

  /* ==========================================
     BORDER RADIUS
     ========================================== */
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    full: "9999px",
  },

  /* ==========================================
     SHADOWS
     ========================================== */
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    primaryGlow: "0 10px 30px -5px rgba(6, 182, 212, 0.3)",
    emergencyGlow: "0 10px 30px -5px rgba(245, 158, 11, 0.3)",
  },

  /* ==========================================
     ANIMATION & TRANSITIONS
     ========================================== */
  animation: {
    duration: {
      instant: "75ms",
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      slower: "700ms",
      slowest: "1000ms",
    },

    easing: {
      linear: "linear",
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },

    transitions: {
      default: "all 300ms ease-in-out",
      fast: "all 150ms ease-in-out",
      color: "color 300ms ease-in-out, background-color 300ms ease-in-out",
      transform: "transform 300ms ease-in-out",
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
        display: "Mon-Fri 8AM-6PM",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        time: "8:00 AM - 6:00 PM",
      },
      emergency: {
        display: "24/7 Available",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        time: "24 Hours",
      },
    },

    social: {
      instagram: "https://instagram.com/jdhomesolutions",
      facebook: "https://facebook.com/jdhomesolutions",
    },

    responseTime: {
      regular: "Within 2 hours during business hours",
      emergency: "Typically 20-30 minutes for emergency lockouts",
    },
  },

  /* ==========================================
     SERVICE CITIES (see serviceCities above)
     ========================================== */
  serviceCities,

  /* ==========================================
     SEO & META INFORMATION
     ========================================== */
  seo: {
    defaultTitle: "Locksmith & Garage Door Repair Oshawa | JD Home Services",
    titleTemplate: "%s | JD Home Services",
    defaultDescription: "Oshawa locksmith for lock changes and rekeying, 24/7 car lockout help, and garage door repair and installation across Durham Region. Call (289) 991-3277.",
    keywords: "locksmith Oshawa, car lockout Oshawa, garage door repair Oshawa, garage door installation Durham Region, locksmith Durham Region",
    siteUrl: "https://www.jdhomeservices.ca",
    ogImage: "/og-image.png",
    twitterHandle: "@jdhomesolutions",
  },

  /* ==========================================
     SERVICES CONFIGURATION
     ========================================== */
  services: {
    categories: [
      {
        id: "locksmith",
        name: "Locksmith",
        shortDescription: "Residential and commercial locksmith service for lock changes, repairs, rekeying, and new hardware installs",
        description: "Our general locksmith service covers the everyday security work property owners rely on. We handle lock changes, rekeying, deadbolt and knob replacement, hardware upgrades, lock repairs, and security checks for homes, offices, storefronts, and rental properties throughout Durham and surrounding areas.",
        icon: "Lock",
        color: "#1B3A5F",
        featured: true,
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
              "Call us at (289) 991-3277 or send a message through our contact page with a short description of the job, such as how many doors are involved and whether you need rekeying, repair, or new hardware. We will talk through the options and give you clear recommendations before any work begins. Our regular hours are Monday to Friday, 8 AM to 6 PM.",
          },
        ],
      },
      {
        id: "car-lockout",
        name: "Car Lockout",
        shortDescription: "Fast, damage-free vehicle entry when you are locked out anywhere in Durham and surrounding regions",
        description: "Locked your keys in the car or dealing with a stuck vehicle lock? We provide rapid-response car lockout assistance with non-destructive entry methods whenever possible. Our goal is simple: get you back into your vehicle quickly, safely, and without adding more stress to your day.",
        icon: "Car",
        color: "#F59E0B",
        badge: "24/7 AVAILABLE",
        featured: true,
        features: [
          "24/7 emergency availability",
          "Fast response across Durham and surrounding regions",
          "Damage-free vehicle entry whenever possible",
          "Help with keys locked inside or malfunctioning locks",
          "Service for most cars, SUVs, vans, and light trucks",
          "Upfront communication before work begins",
        ],
        seo: {
          title: "24/7 Car Lockout Service Oshawa & Durham | JD Home Services",
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
              "Response time is typically 20-30 minutes for emergency lockouts, depending on your location and traffic. Oshawa is our home base, so nearby areas are usually the quickest to reach, and we cover the rest of Durham Region and surrounding communities from there. When you call, we will confirm where you are and give you a realistic arrival estimate.",
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
      {
        id: "garage-door-repair-installation",
        name: "Garage Door Repair & Installation",
        shortDescription: "Reliable garage door repair, replacement, and new installation for safe, smooth daily operation",
        description: "We repair and install garage doors and related hardware for homeowners who need dependable performance and safe operation. Whether your system is off-track, noisy, damaged, or ready for replacement, we diagnose the issue clearly and complete the work with attention to safety, fit, and long-term reliability.",
        icon: "Home",
        color: "#4A5568",
        featured: true,
        features: [
          "Garage door repair and troubleshooting",
          "New garage door installation and replacement",
          "Track, roller, cable, and hardware adjustments",
          "Opener setup and operational checks",
          "Safety inspection and balance testing",
          "Professional recommendations for repair vs. replacement",
        ],
        seo: {
          title: "Garage Door Repair & Installation Oshawa | JD Home Services",
          description:
            "Garage door repair, replacement, and new installation in Oshawa and Durham Region: track, roller, cable, and opener work with safety and balance checks.",
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
        description: "Lock changes, rekeying, garage door repairs, and practical security upgrades for day-to-day peace of mind.",
        icon: "Home",
        highlights: ["Move-ins & lock changes", "Garage door repair"],
      },
      {
        id: "landlords",
        name: "Landlords & Property Managers",
        description: "Dependable service for rental turnovers, tenant lock issues, hardware updates, and access control needs.",
        icon: "Building2",
        highlights: ["Rekeying between tenants", "Common entry hardware"],
      },
      {
        id: "businesses",
        name: "Retail & Small Business",
        description: "Commercial locksmith support for storefronts, offices, service doors, and everyday security maintenance.",
        icon: "Store",
        highlights: ["Lock repair & replacement", "Entry door hardware"],
      },
      {
        id: "drivers",
        name: "Drivers Across Durham",
        description: "Fast car lockout help for commuters, families, and working drivers who need careful, damage-aware entry.",
        icon: "Car",
        highlights: ["Emergency lockout response", "Clear arrival updates"],
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
     TRUST INDICATORS
     ========================================== */
  trustIndicators: {
    badges: [
      {
        id: "licensed",
        text: "Licensed & Insured",
        description: "Fully licensed, bonded, and insured for your protection and peace of mind",
        icon: "Award",
      },
      {
        id: "fast-response",
        text: "Fast Response Time",
        description: "On-call service with quick response times, especially for emergency lockouts",
        icon: "Clock",
      },
      {
        id: "smart-home",
        text: "Focused Service Line",
        description: "Specialized in locksmith work, car lockouts, and garage door repair and installation",
        icon: "Cpu",
      },
      {
        id: "satisfaction",
        text: "100% Satisfaction",
        description: "From install to repair, every job is finished to perfection or we make it right",
        icon: "Star",
      },
    ],

    guarantees: [
      "Licensed, bonded, and insured",
      "Upfront pricing with no hidden fees",
      "Quality workmanship guarantee",
      "Fast response times",
      "Professional, courteous service",
    ],
  },

  /* ==========================================
     TESTIMONIALS
     ========================================== */
  testimonials: [
    {
      id: 1,
      quote: "Fast, professional service when we got locked out at 11 PM. They arrived within 30 minutes and had us back inside quickly. Highly recommend!",
      author: "Sarah M.",
      service: "Car Lockout",
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
      id: 3,
      quote: "Reliable and trustworthy. They fixed our garage door issue quickly and explained exactly what needed repair. Quality work at a fair price.",
      author: "Jennifer L.",
      service: "Garage Door Repair & Installation",
      rating: 5,
    },
  ],

  /* ==========================================
     UI COMPONENTS SETTINGS
     ========================================== */
  components: {
    button: {
      sizes: {
        sm: {
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          height: "36px",
        },
        md: {
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          height: "44px",
        },
        lg: {
          padding: "1rem 2rem",
          fontSize: "1.125rem",
          height: "52px",
        },
      },
      minWidth: {
        sm: "80px",
        md: "120px",
        lg: "160px",
      },
    },

    input: {
      height: "48px",
      padding: "0.75rem 1rem",
      fontSize: "1rem",
      borderRadius: "0.5rem",
      borderWidth: "1px",
      focusRing: "2px",
      focusOffset: "2px",
    },

    card: {
      padding: {
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
      borderRadius: "0.5rem",
      borderWidth: "1px",
      shadow: "md",
      hoverShadow: "lg",
    },

    icon: {
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
      xl: "3rem",
      "2xl": "4rem",
    },
  },

  /* ==========================================
     FEATURE FLAGS
     ========================================== */
  features: {
    darkMode: false,
    blog: false,
    testimonials: true,
    liveChat: false,
    bookingSystem: false,
    multiLanguage: false,
    analytics: true,
    cookieConsent: true,
  },
} as const;

export type Theme = typeof theme;
export default theme;
