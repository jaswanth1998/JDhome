import type { Metadata, MetadataRoute } from "next";
import { theme, type ServiceCity } from "@/config/theme";

/** Canonical site origin, without a trailing slash. */
export const SITE_URL = theme.seo.siteUrl;

/**
 * Turn a site path into an absolute URL.
 *
 * Page paths get a trailing slash to match `trailingSlash: true` in
 * next.config.ts ("/about" and "/about/" both become ".../about/"). A path whose
 * last segment has a file extension (e.g. "/og-image.png") gets no slash.
 */
export function absoluteUrl(path: string): string {
  const trimmed = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (trimmed === "") return `${SITE_URL}/`;
  const lastSegment = trimmed.slice(trimmed.lastIndexOf("/") + 1);
  const isFile = /\.[A-Za-z0-9]+$/.test(lastSegment);
  return `${SITE_URL}/${trimmed}${isFile ? "" : "/"}`;
}

export type BuildMetadataInput = {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/services/" */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
};

/**
 * Build the full per-page Metadata object.
 *
 * `title.absolute` bypasses the root title template so the brand is never
 * doubled. `openGraph` is spelled out in full because a page-level openGraph
 * replaces the entire inherited block (images included).
 */
export function buildMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  noIndex,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(theme.seo.ogImage);
  const socialTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: theme.brand.name,
      url,
      title: socialTitle,
      description: socialDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${theme.brand.name} - ${theme.brand.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: theme.seo.twitterHandle || undefined,
      creator: theme.seo.twitterHandle || undefined,
      title: socialTitle,
      description: socialDescription,
      images: [image],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export type SiteRoute = {
  /** Site-relative path with a trailing slash. */
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

export type ServiceCategory = (typeof theme.services.categories)[number];

/** Cities that get a dedicated /service-areas/{slug}/ page. */
export const coreCities: readonly ServiceCity[] = theme.serviceCities.filter(
  (city) => city.core
);

/** Every indexable public route, in sitemap order. */
export const SITE_ROUTES: readonly SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services/", changeFrequency: "monthly", priority: 0.9 },
  ...theme.services.categories.map(
    (service): SiteRoute => ({
      path: `/services/${service.id}/`,
      changeFrequency: "monthly",
      priority: 0.9,
    })
  ),
  { path: "/service-areas/", changeFrequency: "monthly", priority: 0.7 },
  ...coreCities.map(
    (city): SiteRoute => ({
      path: `/service-areas/${city.slug}/`,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  ),
  { path: "/about/", changeFrequency: "yearly", priority: 0.6 },
  { path: "/contact/", changeFrequency: "yearly", priority: 0.8 },
  { path: "/privacy-policy/", changeFrequency: "yearly", priority: 0.2 },
];

export function getService(slug: string): ServiceCategory | undefined {
  return theme.services.categories.find((service) => service.id === slug);
}

export function getCity(slug: string): ServiceCity | undefined {
  return theme.serviceCities.find((city) => city.slug === slug);
}
