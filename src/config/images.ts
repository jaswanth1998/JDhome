/**
 * Site photography.
 *
 * Every photo is served from the Unsplash CDN under the free Unsplash License
 * (https://unsplash.com/license). To use your own job photos instead, drop the
 * file into `public/images/` and set `src` to its path (e.g. "/images/job-1.jpg").
 *
 * Before adding a photo, view it at full resolution: equipment must show no
 * manufacturer logos or labels (several stock CCTV photos carry Hikvision
 * branding), and cameras should look current rather than weathered.
 */

type SiteImage = {
  /** Unsplash photo id (e.g. "photo-123-abc") or a local path starting with "/". */
  src: string;
  alt: string;
  credit?: string;
  /** Focal point (0-1 from left, 0-1 from top) kept in frame when the CDN crops. */
  focus?: readonly [number, number];
};

export const siteImages = {
  heroGarage: {
    src: "photo-1770756051811-1612ac8bedfa",
    alt: "Modern white home with two dark-framed glass garage doors and a wide concrete driveway",
    credit: "GoodLifeConstruction",
  },
  garageService: {
    src: "photo-1775430766327-ca7d9f93f563",
    alt: "Newly installed garage door with warm wood-look panels and a row of windows",
    credit: "Ryan Waldman",
  },
  garageHome: {
    src: "photo-1780080013093-4a4d8acc3c3a",
    alt: "Two-storey house with an attached single garage and a green lawn",
    credit: "Roger Starnes Sr",
  },
  garageDark: {
    src: "photo-1778226817693-7f42d8f27eb6",
    alt: "House with a large dark garage door framed by mature trees",
    credit: "Sergej",
  },
  cctvInstall: {
    src: "photo-1528312635006-8ea0bc49ec63",
    alt: "Modern white PTZ dome security camera on a pole-mounted bracket",
    credit: "Pawel Czerwinski",
    focus: [0.62, 0.5],
  },
  smartCamera: {
    src: "photo-1650214962171-8198a113621a",
    alt: "Modern PTZ dome security camera mounted on a red brick wall",
    credit: "Julian Gentile",
    focus: [0.55, 0.45],
  },
  cctvWall: {
    src: "photo-1756162674351-ab2d4be9e099",
    alt: "White dome security camera on a wall-mount bracket on a brick building",
    credit: "Alexis Dreher",
    focus: [0.5, 0.45],
  },
  cctvApp: {
    src: "photo-1713857297379-6fc26e70f581",
    alt: "Smartphone beside a smart indoor security camera and sensors",
    credit: "Jakub Żerdzicki",
  },
  poeSwitch: {
    src: "photo-1683322499436-f4383dd59f5a",
    alt: "Rows of blue network cables connected in an equipment rack",
    credit: "Scott Rodgerson",
  },
  locksmith: {
    src: "flagged/photo-1564767609213-c75ee685263a",
    alt: "Hands fitting a lever handle and lock to an interior door",
    credit: "Maria Ziegler",
  },
  carLockout: {
    src: "photo-1527937444527-466f6fd54936",
    alt: "Hand opening the door of a red car",
    credit: "Markus Spiske",
  },
  snowHouses: {
    src: "photo-1553550319-d8d5393e1c80",
    alt: "Row of houses and evergreen trees covered in fresh snow",
    credit: "Tracy Adams",
  },
  winterGarage: {
    src: "photo-1577992141014-c211608c9038",
    alt: "Red brick home with an attached garage during a snowfall",
    credit: "Erik Mclean",
  },
  garageInterior: {
    src: "photo-1734477127040-c5845f5af500",
    alt: "Clean garage interior with a pickup truck parked beside the door and opener rail overhead",
    credit: "Brian Wangenheim",
  },
  greyGarage: {
    src: "photo-1696992812596-3c0d4d2d1299",
    alt: "Grey insulated sectional garage door next to a brick wall",
    credit: "Simeon Galabov",
  },
  modernHome: {
    src: "photo-1777106322601-578dc9213ace",
    alt: "Modern two-storey house with a dark garage door",
    credit: "Troy Mortier",
  },
  familyHome: {
    src: "photo-1764339838883-4728d4bcfe49",
    alt: "White two-storey family home with an attached garage and large lawn",
    credit: "KK Buys Indy Homes",
  },
  suburbanStreet: {
    src: "photo-1748444146081-d141d1034fcb",
    alt: "Quiet residential street lined with mature leafy trees",
    credit: "Kenneth Running",
  },
  neighbourhoodAerial: {
    src: "photo-1565402170291-8491f14678db",
    alt: "Aerial view of a suburban neighbourhood with houses and green space",
    credit: "Avi Waxman",
  },
  nightStreet: {
    src: "photo-1781400868205-9af05a504017",
    alt: "Houses and parked cars on a residential street at night",
    credit: "Evangeline Bautista",
  },
  aiCamera: {
    src: "photo-1575571458835-600ee8cb1972",
    alt: "Modern white smart security camera with a wide-angle lens",
    credit: "Hunter Newton",
    focus: [0.5, 0.35],
  },
  phoneApp: {
    src: "photo-1593733925160-6f78dc0be8b6",
    alt: "Person checking an app on a smartphone",
    credit: "Kelli McClintock",
  },
  networkCables: {
    src: "photo-1531668383211-64743e924c66",
    alt: "Neatly bundled network patch cables in a wiring cabinet",
    credit: "Unsplash",
  },
  apartment: {
    src: "photo-1571236673892-13d222da2019",
    alt: "Brick apartment building with rows of balconies",
    credit: "Giulia May",
  },
  storefront: {
    src: "photo-1575663620136-5ebbfcc2c597",
    alt: "Open sign hanging in the window of a small business",
    credit: "Tim Mossholder",
  },
  houseKeys: {
    src: "photo-1741156386380-0236c72eb6f9",
    alt: "Hand holding house keys in front of an open entrance door",
    credit: "Jakub Żerdzicki",
  },
  keyInDoor: {
    src: "photo-1733244766159-f58f4184fd38",
    alt: "Hand turning a key in a front door lock",
    credit: "Jakub Żerdzicki",
  },
  frontDoor: {
    src: "photo-1493895565436-93db25637518",
    alt: "Black front door on a stone house with a small porch",
    credit: "Peter Boccia",
  },
  handTools: {
    src: "photo-1567361808960-dec9cb578182",
    alt: "Hammer, pliers, screwdrivers, and tape measure laid out on a wooden deck",
    credit: "Louis Hansel",
  },
} as const satisfies Record<string, SiteImage>;

export type SiteImageKey = keyof typeof siteImages;

/**
 * Build a sized image URL. Unsplash photos are cropped and compressed by the
 * CDN; local images are returned as-is.
 */
export function imageUrl(key: SiteImageKey, width = 1200, height?: number): string {
  const image: SiteImage = siteImages[key];
  const { src } = image;
  if (src.startsWith("/")) return src;
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    q: "75",
    w: String(width),
  });
  if (image.focus) {
    params.set("crop", "focalpoint");
    params.set("fp-x", String(image.focus[0]));
    params.set("fp-y", String(image.focus[1]));
  }
  if (height) params.set("h", String(height));
  return `https://images.unsplash.com/${src}?${params.toString()}`;
}

/** Responsive srcset for full-width or large images. */
export function imageSrcSet(key: SiteImageKey, widths: readonly number[], aspect?: number): string {
  return widths
    .map((w) => `${imageUrl(key, w, aspect ? Math.round(w / aspect) : undefined)} ${w}w`)
    .join(", ");
}
