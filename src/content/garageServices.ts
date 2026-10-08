import type { SiteImageKey } from "@/config/images";
import type { ServiceFaq } from "@/config/theme";

/**
 * Garage door sub-service pages: /services/{slug}/ for new doors, openers and
 * springs. Each one sits under the garage door hub
 * (/services/garage-door-repair-installation/) and owns one transactional intent.
 *
 * Rendered by src/app/(public)/services/[slug]/SubServicePageContent.tsx.
 * Keep this module free of value imports (only the two type imports above):
 * src/lib/seo.ts and src/lib/jsonld.ts import it, so importing them back would
 * create an ESM cycle.
 *
 * Inline links: write `[anchor text](/path/)` inside a paragraph or bullet. The
 * page renders it with next/link and fails the build if the href does not end
 * with "/" or points at a guide, service or city page that does not exist.
 *
 * Content rules (CLAUDE.md and the SEO brief): Canadian English, only claims the
 * site already makes, no response-time promises, garage work is regular hours
 * only, and FAQ answers carry no numbers.
 */

/** The garage door hub every sub-service page links up to. */
export const HUB_SLUG = "garage-door-repair-installation";

export type GarageSubSlug =
  | "garage-door-installation"
  | "garage-door-opener-installation"
  | "garage-door-spring-repair";

export type GarageSubSection = {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type GarageSubStep = { title: string; body: string };

export type GarageSubService = {
  slug: GarageSubSlug;
  /** Breadcrumb, JSON-LD and card name. */
  name: string;
  shortName: string;
  /** Link label used in cards, nav and chips (contract C6). */
  cardLabel: string;
  /** One-line card description (kept under 60 characters so it never trips duplicate-sentence checks). */
  cardBlurb: string;
  icon: string;
  image: SiteImageKey;
  seo: { title: string; description: string; h1: string };
  /** 1-2 sentences under the H1. */
  subtitle: string;
  introHeading: string;
  intro: readonly string[];
  /** The page's first H2: symptoms or reasons, with a short checklist. */
  signs: { heading: string; paragraphs: readonly string[]; items: readonly string[] };
  /** "What's included" card items, built only from published claims. */
  included: readonly string[];
  sections: readonly GarageSubSection[];
  stepsHeading: string;
  steps: readonly GarageSubStep[];
  /** Exactly 5. */
  faqs: readonly ServiceFaq[];
  areasSubtitle: string;
  cta: { title: string; subtitle: string };
  /** Blog slugs in src/content/blog (the page fails the build if one is missing). */
  relatedGuides: readonly string[];
};

/** Hub link label. Kept equal to the hub's theme name ("Garage Door Repair"); must never contain "installation" (contract C6). */
export const HUB_LINK_NAME = "Garage Door Repair";

/** Card shown for the hub in "Other garage door services" grids (contract C6 label). */
export const HUB_CARD = {
  label: "All garage door repairs",
  blurb: "Springs, cables, rollers, openers and more.",
  icon: "Warehouse",
  image: "garageService",
} as const satisfies { label: string; blurb: string; icon: string; image: SiteImageKey };

export const GARAGE_SUB_SERVICES: readonly GarageSubService[] = [
  /* ------------------------------------------------------------------
     NEW DOORS
     ------------------------------------------------------------------ */
  {
    slug: "garage-door-installation",
    name: "Garage Door Installation & Replacement",
    shortName: "New Garage Doors",
    cardLabel: "New garage door installation",
    cardBlurb: "Replacement doors, fitted, balanced and tested.",
    icon: "DoorOpen",
    image: "greyGarage",
    seo: {
      title: "Garage Door Installation & Replacement Oshawa | JD Home",
      description:
        "Replacing an old, dented or failing garage door? New doors and openers installed in Oshawa and Durham, balanced and safety-tested. Free quotes, 7 days.",
      h1: "Garage Door Installation & Replacement in Oshawa",
    },
    subtitle:
      "Trade a tired, dented or failing door for a new one that suits your home and runs quietly. We take out the old door, install and balance the new one, and test everything before we leave.",
    introHeading: "A new door, fitted and set up properly",
    intro: [
      "A garage door is the largest moving part of most houses, and on plenty of Oshawa streets it is also the first thing visitors notice. When the old one is past sensible repair, or you simply want a door that looks better and keeps the cold out, we handle the replacement from start to finish: helping you choose, taking out the old door and installing the new one.",
      "Good garage door installation depends as much on the setup as on the door itself. You get a free, no-obligation quote first, honest advice on whether replacement is really the right call, and a door that is balanced and safety-tested before it goes into daily use. If you are still weighing it up, we are happy to talk it through with no pressure to buy.",
    ],
    signs: {
      heading: "When a new garage door makes sense",
      paragraphs: [
        "Plenty of tired doors can be brought back with new springs, cables or rollers, and we say so when that is the case. Replacement starts to make more sense when the door itself, not just its hardware, is the weak point. Our honest guide on [whether to repair or replace a garage door](/blog/repair-or-replace-garage-door/) walks through the trade-offs, and if a fix is all you need, our page on [garage door repair in Oshawa](/services/garage-door-repair-installation/) covers the parts we mend most often.",
      ],
      items: [
        "Several panels are dented, cracked or rusting through",
        "The door was hit and its sections no longer line up",
        "Repairs keep coming back, one part after another",
        "Wood panels are rotting, warping or splitting",
        "An attached garage stays cold because the door has no insulation",
        "You are renovating and the old door no longer suits the house",
      ],
    },
    included: [
      "Free, no-obligation quote and honest advice",
      "Help choosing material, insulation, windows and colour",
      "Removal of the old door",
      "Installation and balancing of the new door",
      "Opener setup, new or existing",
      "Full safety test and a walk-through before we leave",
    ],
    sections: [
      {
        heading: "Choosing the door: material, insulation, windows and colour",
        paragraphs: [
          "Steel is the most popular choice around Durham Region because it handles our winters well and needs little upkeep. Wood and wood-look finishes add warmth to a traditional front, while aluminum and glass suit modern homes. Insulation is worth considering if the garage is attached, heated or doubles as a workshop. Windows bring in daylight, and colour is easiest to judge against your brick, siding and front door.",
          "We talk through these choices during the quote and help you narrow them down without upselling. For a deeper look at styles and insulation, read our guide to [choosing a new garage door](/blog/choosing-a-new-garage-door/) before we meet.",
        ],
      },
      {
        heading: "Pairing your new door with the right opener",
        paragraphs: [
          "A new door is the natural moment to look at the opener too. If your current unit runs smoothly and its safety features still work, it can often be reconnected and adjusted to the weight and travel of the replacement. If it is loud, unreliable or already giving trouble, replacing it at the same time means both are set up and tuned together.",
          "When that is the better route, we can fit [a new garage door opener](/services/garage-door-opener-installation/) alongside the door, pair your remotes and keypad, and test the sensors and auto-reverse with everything in place.",
        ],
      },
      {
        heading: "What installation day includes",
        paragraphs: [
          "Installation day follows a clear order. We take down and remove the old door, then install the new sections, tracks, springs and hardware. The door is balanced so it holds its position when lifted part-way by hand, the opener is set up and adjusted, and the safety reversal and sensors are tested.",
          "Before we leave, we run the door through several full open-and-close cycles, show you the manual release and how the remotes work, and answer your questions. We test everything and walk you through it, so you know exactly how it should look, feel and sound.",
        ],
      },
      {
        heading: "Replacing one damaged panel or the whole door",
        paragraphs: [
          "A single dented section does not always mean a whole new door. If the rest of the door is sound and a matching section is still made, replacing just that piece can be the sensible fix. The catch is that panels fade and designs are discontinued, so a new section on an older door may not match its neighbours.",
          "When the damage is spread over several sections, the frame has twisted, or no matching panel exists, a full replacement usually gives the better result. We look at the door with you, explain both routes in plain language, and let you decide.",
        ],
      },
      {
        heading: "New garage doors across Durham Region",
        paragraphs: [
          "We install new doors from our Oshawa base throughout [Durham Region](/service-areas/), and each community brings its own mix of homes.",
          "In [Whitby](/service-areas/whitby/), including Brooklin to the north, we replace doors on everything from older bungalows to recent subdivision homes. Homeowners in [Ajax](/service-areas/ajax/) tend to call once a door has been dented one too many times and patching it no longer adds up. In [Pickering](/service-areas/pickering/), we fit new doors on established houses near the lake and on newer builds further north. East of Oshawa, we cover [Courtice](/service-areas/courtice/) and [Bowmanville](/service-areas/bowmanville/), both in the Municipality of Clarington.",
          "Share your address when you call and we will book a convenient time to look at the opening and prepare your quote.",
        ],
      },
    ],
    stepsHeading: "How a garage door replacement works",
    steps: [
      {
        title: "Tell us about the door",
        body: "Describe the door you have, what bothers you about it, and what you would like instead. Photos help if you have them.",
      },
      {
        title: "Choose and quote",
        body: "We look at the opening, talk through materials, insulation, windows and colour, and give you a free quote with no obligation.",
      },
      {
        title: "Out with the old",
        body: "The old door comes down, the new one goes up, and its springs, tracks and opener are set up and balanced.",
      },
      {
        title: "Test and hand over",
        body: "We check the auto-reverse and sensors, then show you the manual release and remotes so you are comfortable using it.",
      },
    ],
    faqs: [
      {
        question: "Do you give free quotes for a new garage door?",
        answer:
          "Yes. Quotes for new doors are free and come with no obligation. We look at the opening, the condition of your current door and opener, and what you want from the new one, then explain the options in plain language. If a repair would serve you better than a replacement, we will tell you that too.",
      },
      {
        question: "Can you install a new door on a detached garage?",
        answer:
          "Yes. Detached garages are common on older streets in Oshawa and across Durham, and we replace doors on them just as we do on attached garages. If the building has no power for an opener, the new door can be set up for manual use, and we can talk about adding an opener later.",
      },
      {
        question: "Will you check the springs and opener when you install a new door?",
        answer:
          "Yes. A new door is set up with springs suited to its weight, and they are adjusted and balanced as part of the install. If you keep your existing opener, we check that it runs smoothly, adjust it to the replacement, and test the auto-reverse and sensors. Every visit ends with a safety and balance check.",
      },
      {
        question: "Should I replace the opener at the same time as the door?",
        answer:
          "Not always. If your opener is reliable, reasonably quiet and its safety features work, it can usually be reconnected and reused. If it is loud, struggling or already giving trouble, replacing both together means one setup and one round of testing. We look at the opener during the quote and give you an honest recommendation.",
      },
      {
        question: "Which Durham Region communities do you install new garage doors in?",
        answer:
          "We are based in Oshawa and install new doors across Durham Region, including Whitby, Ajax, Pickering, Courtice and Bowmanville, and we travel to nearby communities such as Port Perry and Uxbridge. Share your address when you call and we will confirm availability and arrange a time for your free quote.",
      },
    ],
    areasSubtitle: "New doors fitted from our Oshawa base across Durham.",
    cta: {
      title: "Ready for a new garage door?",
      subtitle: "Tell us about the door you have now and what you would like instead. We'll come back with clear choices and a free quote.",
    },
    relatedGuides: ["choosing-a-new-garage-door", "repair-or-replace-garage-door", "choosing-a-garage-door-opener"],
  },

  /* ------------------------------------------------------------------
     OPENERS
     ------------------------------------------------------------------ */
  {
    slug: "garage-door-opener-installation",
    name: "Garage Door Opener Installation & Repair",
    shortName: "Garage Door Openers",
    cardLabel: "Garage door opener installation & repair",
    cardBlurb: "Remotes, keypads, sensors and new openers.",
    icon: "Cog",
    image: "garageInterior",
    seo: {
      title: "Garage Door Opener Installation & Repair Oshawa | JD Home",
      description:
        "Opener not responding, remote or keypad dead, or sensors blinking? We repair and install garage door openers in Oshawa and Durham. Free quotes, 7 days.",
      h1: "Garage Door Opener Installation & Repair in Oshawa",
    },
    subtitle:
      "Remote dead, keypad ignored, sensor light blinking or a motor that hums and goes nowhere? We find the real cause, repair it or fit a new opener, and check the whole door while we are there.",
    introHeading: "Openers that respond every time",
    intro: [
      "A garage door opener is only one part of the system. It has to work with the door, the springs and the safety sensors, so a problem that looks like an opener fault sometimes turns out to be something else. We diagnose the whole setup first, then repair what is actually wrong, or recommend a replacement when the unit has reached the end of the road.",
      "Working from our Oshawa base, we service openers across Durham Region on attached and detached garages alike. You get honest advice on repairing versus replacing and a free, no-obligation quote. If the trouble turns out to be the door itself, such as rollers, panels or tracks, our main page on [garage door repair in Oshawa](/services/garage-door-repair-installation/) explains how we handle it.",
    ],
    signs: {
      heading: "Signs your opener needs attention",
      paragraphs: [
        "Openers rarely quit without warning. These are the symptoms people describe most often when they get in touch:",
      ],
      items: [
        "The motor hums or clicks, but the door does not move",
        "Remotes or the wall keypad work only some of the time",
        "The door stops part-way or reverses for no clear reason",
        "A sensor light is blinking, or one sensor has no light at all",
        "Grinding, rattling or straining from the motor unit",
        "The door jerks or moves unevenly under power",
      ],
    },
    included: [
      "Diagnosis of the opener, door and springs together",
      "Remote and keypad programming",
      "Safety sensor alignment and testing",
      "Travel and force adjustment",
      "A new opener when repair is not worth it",
      "Safety and balance check on every visit",
    ],
    sections: [
      {
        heading: "Opener repairs: remotes, keypads, safety sensors, travel and force",
        paragraphs: [
          "Many opener complaints come down to settings and small parts rather than a failed motor. Remotes and keypads lose their programming or need fresh codes after a move. Safety sensors get bumped, drift out of line or collect dirt on the lenses, and the opener will refuse to close until they can see each other again. Our guide to [garage door safety sensors](/blog/garage-door-safety-sensors/) covers the simple checks you can try first.",
          "Travel limits tell the opener where to stop at the top and bottom, and the force setting tells it how hard to push before backing off. When either one drifts, the door stops short, reverses before reaching the floor or closes too hard. We reset both, then confirm the door reverses when it meets an obstruction.",
        ],
        bullets: [
          "Reprogramming remotes and wall keypads",
          "Realigning and cleaning safety sensors",
          "Resetting travel limits and closing force",
          "Replacing worn drive parts where it makes sense",
        ],
      },
      {
        heading: "Why we check the springs and balance first",
        paragraphs: [
          "An opener is not built to lift a garage door on its own. The springs carry most of the weight, and the motor only guides the door up and down. When a spring weakens or snaps, the opener strains, hums or gives up, and swapping in a new opener would not solve anything.",
          "That is why every opener visit starts with the door released from the motor and lifted by hand. If it feels heavy, drifts down or will not stay put part-way, the real problem is the springs or cables, and we will point you to [broken spring and cable repair](/services/garage-door-spring-repair/) before touching the opener.",
        ],
      },
      {
        heading: "Installing a new opener",
        paragraphs: [
          "When an opener is worn out, unreliable or missing modern safety features, replacement is often the better choice. Chain drives are rugged and simple, belt drives run more quietly, which helps with a bedroom above the garage, and wall-mount units sit beside the door to free up the ceiling. Our guide to [choosing a garage door opener](/blog/choosing-a-garage-door-opener/) compares them in plain language.",
          "We remove the old unit, mount and wire the new one, pair your remotes and keypad, set the travel and force, and test the sensors and safety reversal. If a door has never had an opener, we first confirm it is balanced and suitable for one.",
        ],
      },
      {
        heading: "Opener service across Durham Region",
        paragraphs: [
          "We repair and install openers from our Oshawa base across [Durham Region](/service-areas/).",
          "In [Whitby](/service-areas/whitby/) and Brooklin, we reprogram remotes and keypads, realign sensors and replace tired openers on garages of every age. [Ajax](/service-areas/ajax/) homeowners get the same diagnosis-first approach, whether their opener is humming, reversing or completely silent. In [Pickering](/service-areas/pickering/), we install new openers on recent builds and add them to older doors that have always been lifted by hand. To the east, [Courtice](/service-areas/courtice/) and [Bowmanville](/service-areas/bowmanville/) in the Municipality of Clarington are on our regular route as well.",
          "Get in touch during regular hours, tell us where the garage is, and we will confirm a realistic arrival window.",
        ],
      },
    ],
    stepsHeading: "How an opener visit works",
    steps: [
      {
        title: "Describe the symptoms",
        body: "Tell us what the opener is doing, or not doing, and whether the door moves by hand. That helps us prepare for the visit.",
      },
      {
        title: "Check the whole system",
        body: "We test the door, springs and balance first, then the opener, remotes, keypad and safety sensors.",
      },
      {
        title: "Repair or replace",
        body: "You get a clear explanation and a free quote. Many fixes are adjustments or small parts; we only suggest a new opener when it makes sense.",
      },
      {
        title: "Test it together",
        body: "We run the door, check the auto-reverse and sensors, and show you how the remotes, keypad and manual release work.",
      },
    ],
    faqs: [
      {
        question: "My opener hums but the door will not move. What is wrong?",
        answer:
          "A humming motor usually means the opener is trying to work but something is stopping it. Common causes are a broken spring or cable that leaves the door too heavy, a door that is still locked or disconnected, or a worn gear inside the unit. Avoid pressing the button again and again, which strains the motor, and call us so we can find the cause.",
      },
      {
        question: "Should I repair or replace an opener that keeps acting up?",
        answer:
          "It depends on what is failing and the condition of the rest of the system. Remotes, sensors and settings are usually worth repairing. If the motor or drive is worn, parts are hard to find, or the opener lacks modern safety features, replacing it is often the better value. We explain both options and give you an honest recommendation.",
      },
      {
        question: "Can you set up new remotes and a keypad?",
        answer:
          "Yes. We program new or replacement remotes and wall or outdoor keypads to work with your opener, and we can clear old codes so lost or borrowed remotes stop working. If your opener is too old to accept current remotes, we tell you before anything is bought, so you are not left with accessories that will not pair.",
      },
      {
        question: "Why does my door reverse before it reaches the floor?",
        answer:
          "The usual reasons are safety sensors that are misaligned, dirty or blocked, a closing force or travel limit that has drifted, or something in the track that makes the door work harder near the bottom. The reversal is a safety feature doing its job, so it should be fixed rather than bypassed. We find the cause, adjust it and retest.",
      },
      {
        question: "Can you add an opener to a door that has never had one?",
        answer:
          "Usually, yes. Before installing one, we check that the door is balanced, the springs suit its weight and the tracks are in good shape, because an opener should never be used to make up for a heavy door. The garage also needs a power outlet close to where the unit will be mounted. We look at the door and tell you what is needed.",
      },
    ],
    areasSubtitle: "Opener repairs and new openers throughout Durham.",
    cta: {
      title: "Opener giving you trouble?",
      subtitle: "Describe what it is doing and we'll help you work out whether it needs an adjustment, a repair or a replacement.",
    },
    relatedGuides: ["choosing-a-garage-door-opener", "garage-door-safety-sensors", "garage-door-wont-open"],
  },

  /* ------------------------------------------------------------------
     SPRINGS AND CABLES
     ------------------------------------------------------------------ */
  {
    slug: "garage-door-spring-repair",
    name: "Garage Door Spring & Cable Repair",
    shortName: "Springs & Cables",
    cardLabel: "Garage door spring & cable repair",
    cardBlurb: "Broken springs and cables, carefully replaced.",
    icon: "Zap",
    image: "handTools",
    seo: {
      title: "Garage Door Spring Repair Oshawa | JD Home Services",
      description:
        "Broken garage door spring or cable in Oshawa or Durham Region? Matched replacement parts, balance and safety check on every visit. Call (289) 991-3277.",
      h1: "Garage Door Spring & Cable Repair in Oshawa",
    },
    subtitle:
      "A loud bang from the garage, a door that suddenly feels heavy, or a cable hanging loose? Stop using the door and call us. We replace springs and cables with correctly matched parts and finish with a balance and safety check.",
    introHeading: "Springs and cables, replaced with care",
    intro: [
      "Springs do the heavy lifting on a garage door. They are wound under high tension so the door feels light in your hands and the opener only has to guide it. When one breaks, the full weight of the door lands on the opener and on anyone trying to lift it, and the cables that run beside the door can slip off their drums.",
      "We are based in Oshawa and repair springs and cables across Durham Region. We match the replacement to your door, inspect the cables, drums and bearings while we are there, and test the balance before handing the door back. Spring and cable work is one part of our wider [garage door repair in Oshawa](/services/garage-door-repair-installation/) service, which also covers rollers, tracks and panels.",
    ],
    signs: {
      heading: "Signs of a broken spring or cable",
      paragraphs: [
        "Most people discover a failed spring the first time they try to use the door afterwards. Our guide to [a broken garage door spring](/blog/broken-garage-door-spring/) explains what you are seeing in more depth; the short version is below.",
      ],
      items: [
        "A sharp bang from the garage, often when nobody is in it",
        "A visible gap in the coil of the spring above the door",
        "The door feels very heavy or barely lifts by hand",
        "The opener strains, lifts the door a little and stops",
        "A cable hanging loose, or the door sitting crooked",
        "The door drops quickly instead of staying put part-way",
      ],
    },
    included: [
      "Correctly matched replacement springs",
      "Cables, drums and bearings inspected",
      "Frayed or broken cables replaced",
      "Door rebalanced and tested by hand",
      "Opener checked once the door is balanced",
      "Safety and balance check on every visit",
    ],
    sections: [
      {
        heading: "Why spring work is not a DIY job",
        paragraphs: [
          "Garage door springs store enough energy to cause serious injury when they are wound or released without the right tools and training. Winding bars slip, set screws let go, and a cable under load can whip back without warning. Online videos make it look routine; it is not.",
          "Please do not adjust, unwind or replace a spring yourself, and do not keep running the opener to force the door up. Leave the door where it is, keep people and pets clear, and call us. If the door is stuck open, we will explain how to secure the garage until the repair.",
        ],
      },
      {
        heading: "What a spring and cable repair includes",
        paragraphs: [
          "We start by confirming exactly what has failed. Springs come in different types and sizes, and the right replacement depends on the weight, height and setup of your door, so we match the new parts to the door rather than guessing. On doors with two springs, we explain whether replacing both together makes sense for yours.",
          "With the new spring in place, we inspect the cables for fraying, check that the drums and bearings turn freely, and replace anything that is worn. Then we balance the door so it stays put part-way open, run it by hand and under power, and finish with the safety check. If the motor was damaged while straining against the broken spring, we can take care of [opener repairs](/services/garage-door-opener-installation/) as well.",
        ],
      },
      {
        heading: "Broken cables and doors hanging crooked",
        paragraphs: [
          "Lift cables run from the bottom corners of the door up to drums beside the springs. When a cable frays, snaps or jumps off its drum, one side of the door drops lower than the other, and the door can jam or slip out of its tracks. Do not try to pull a crooked door down or run it with the opener.",
          "We secure the door, replace or re-seat the cable, check the drum and spring on that side, and bring the door back into line. If rollers have come out of the track as well, our guide to [a garage door off its track](/blog/garage-door-off-track/) explains what happens next and why it needs care.",
        ],
      },
      {
        heading: "Spring and cable repair across Durham Region",
        paragraphs: [
          "We replace springs and cables from our Oshawa base throughout [Durham Region](/service-areas/).",
          "In [Whitby](/service-areas/whitby/), from the lakeshore up to Brooklin, a snapped spring is one of the most common reasons a door stops working without warning. In [Ajax](/service-areas/ajax/), we replace springs and cables on doors of every age and check the rest of the hardware while we are there. Cold snaps put extra stress on springs, and we repair them in [Pickering](/service-areas/pickering/) homes from the waterfront to the newer northern neighbourhoods. In the Municipality of Clarington, we cover [Courtice](/service-areas/courtice/), right next door to Oshawa, and [Bowmanville](/service-areas/bowmanville/) further east along Highway 401.",
          "Phone us during regular hours with your address and a quick description of the door, and we will let you know when we can be there.",
        ],
      },
    ],
    stepsHeading: "From a broken spring to a balanced door",
    steps: [
      {
        title: "Stop and call",
        body: "Leave the door where it is, keep clear of the springs and cables, and tell us what happened.",
      },
      {
        title: "Inspect and quote",
        body: "We confirm what has failed, look over the rest of the hardware and give you a free, no-obligation quote before any work starts.",
      },
      {
        title: "Replace and rebalance",
        body: "Springs and any worn cables are replaced with matched parts, then the door is balanced so it moves smoothly by hand.",
      },
      {
        title: "Test with the opener",
        body: "We reconnect the opener, check its travel and safety reversal, and walk you through what we did.",
      },
    ],
    faqs: [
      {
        question: "What should I do until the spring is replaced?",
        answer:
          "Stop using the door and the opener, and unplug the opener if you can reach the plug without standing under the door. Keep children, pets and vehicles clear of the opening, and do not touch the springs or cables. If the door is stuck open, call us and we will talk you through the safest way to secure the garage until the repair.",
      },
      {
        question: "Can a broken spring damage my opener?",
        answer:
          "It can. With a broken spring, the opener tries to lift weight it was never designed to carry, which strains the motor, gears and drive. Running it again and again can turn a spring repair into an opener repair as well. After replacing the spring, we test the opener and tell you if anything was damaged.",
      },
      {
        question: "Do you check the cables when you replace a spring?",
        answer:
          "Yes, every time. Cables and springs work together, and a cable that has frayed or slipped off its drum can fail soon after a new spring goes on. We inspect both cables, the drums and the bearings during every spring repair, recommend replacement only if they are worn, and explain what we found.",
      },
      {
        question: "How much does garage door spring repair cost?",
        answer:
          "Every job is different, so we don't publish set prices. It depends on the type and size of the springs your door uses, whether both should be replaced together, and whether the cables need attention too. We look over the door, tell you what we found and quote the work for free, with no obligation, before anything is replaced.",
      },
      {
        question: "Is it safe to leave the car in the garage with a broken spring?",
        answer:
          "If the door is closed and staying closed, the car is usually fine where it is, but do not try to open the door to get it out. Lifting a door with a broken spring, by hand or with the opener, can make it drop suddenly. Call us, explain where the car is, and we will help you plan around it.",
      },
    ],
    areasSubtitle: "Spring and cable repairs right across Durham.",
    cta: {
      title: "Broken spring or cable?",
      subtitle: "Leave the door where it is and give us a call. We'll explain what has failed and quote the repair for free before any work starts.",
    },
    relatedGuides: ["broken-garage-door-spring", "garage-door-off-track", "garage-door-wont-open"],
  },
];

/**
 * The three hub "What's included" feature strings (theme.ts, contract C7) that
 * link to their sub-service page. ServicePageContent fails the build if a key
 * is missing from the hub's features.
 */
export const HUB_FEATURE_LINKS: Record<string, string> = {
  "New garage door installation and replacement": "/services/garage-door-installation/",
  "Garage door opener installation and repair": "/services/garage-door-opener-installation/",
  "Broken spring and cable replacement": "/services/garage-door-spring-repair/",
};
