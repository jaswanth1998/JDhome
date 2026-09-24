import { theme, type ServiceFaq } from "@/config/theme";
import { SITE_URL, absoluteUrl, type ServiceCategory } from "@/lib/seo";

type JsonLdObject = Record<string, unknown>;

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const ALL_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function serviceUrl(serviceId: string): string {
  return absoluteUrl(`/services/${serviceId}/`);
}

/** 14 City nodes from theme.serviceCities plus the Durham Region area. */
export function areaServedNodes(): JsonLdObject[] {
  return [
    ...theme.serviceCities.map((city) => ({ "@type": "City", name: city.name })),
    { "@type": "AdministrativeArea", name: "Durham Region" },
  ];
}

export function businessNode(): JsonLdObject {
  return {
    "@type": ["HomeAndConstructionBusiness", "Locksmith"],
    "@id": BUSINESS_ID,
    name: theme.brand.name,
    description: `${theme.brand.description} Car lockout help is available 24/7.`,
    url: `${SITE_URL}/`,
    telephone: theme.contact.phone.tel,
    email: theme.contact.email,
    image: absoluteUrl(theme.seo.ogImage),
    logo: absoluteUrl(theme.brand.logo.primary),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: theme.contact.address.city,
      addressRegion: "ON",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: theme.contact.address.geo.latitude,
      longitude: theme.contact.address.geo.longitude,
    },
    areaServed: areaServedNodes(),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...theme.contact.hours.regular.days],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    sameAs: [theme.contact.social.instagram, theme.contact.social.facebook],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Garage Door, Security Camera, and Locksmith Services",
      itemListElement: theme.services.categories.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          "@id": `${serviceUrl(service.id)}#service`,
          name: service.name,
          url: serviceUrl(service.id),
          description: service.shortDescription,
        },
      })),
    },
  };
}

export function websiteNode(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: theme.brand.name,
    description: theme.seo.defaultDescription,
    inLanguage: "en-CA",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** Site-wide graph rendered once from the public layout. */
export function buildSiteGraph(): JsonLdObject {
  return withGraph([businessNode(), websiteNode()]);
}

export function serviceNode(service: ServiceCategory): JsonLdObject {
  const url = serviceUrl(service.id);
  const node: JsonLdObject = {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url,
    provider: { "@id": BUSINESS_ID },
    areaServed: areaServedNodes(),
  };

  if (service.id === "car-lockout") {
    node.hoursAvailable = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_WEEK,
        opens: "00:00",
        closes: "23:59",
      },
    ];
  }

  return node;
}

export function faqPageNode(faqs: readonly ServiceFaq[]): JsonLdObject {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbNode(
  items: readonly { name: string; path: string }[]
): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function withGraph(nodes: JsonLdObject[]): JsonLdObject {
  return { "@context": "https://schema.org", "@graph": nodes };
}

type ArticleLike = {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  keywords: readonly string[];
  wordCount: number;
  category: { name: string };
  imageUrl: string;
};

/** BlogPosting for a guide; the business is both author and publisher. */
export function blogPostingNode(post: ArticleLike): JsonLdObject {
  const url = absoluteUrl(`/blog/${post.slug}/`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    image: [post.imageUrl, absoluteUrl(`/og/blog/${post.slug}.png`)],
    datePublished: post.published,
    dateModified: post.updated,
    articleSection: post.category.name,
    keywords: post.keywords.join(", "),
    wordCount: post.wordCount,
    inLanguage: "en-CA",
    author: { "@id": BUSINESS_ID },
    publisher: { "@id": BUSINESS_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** CollectionPage + ItemList for the guides index and category pages. */
export function collectionPageNode(
  path: string,
  name: string,
  description: string,
  posts: readonly { slug: string; title: string }[]
): JsonLdObject {
  const url = absoluteUrl(path);
  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    description,
    inLanguage: "en-CA",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}/`),
        name: post.title,
      })),
    },
  };
}
