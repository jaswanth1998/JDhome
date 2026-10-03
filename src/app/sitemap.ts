import type { MetadataRoute } from "next";
import { siteImages, type SiteImageKey } from "@/config/images";
import { theme } from "@/config/theme";
import { BLOG_CATEGORIES, getAllPosts } from "@/lib/blog";
import { SITE_CONTENT_UPDATED, SITE_ROUTES, absoluteUrl } from "@/lib/seo";

/** Main photo shown on each static page, listed as a sitemap image for Google Images. */
const staticPageImages: Record<string, SiteImageKey> = {
  "/": "heroGarage",
  "/services/": "garageService",
  "/service-areas/": "garageDark",
  "/about/": "modernHome",
  ...Object.fromEntries(theme.services.categories.map((s) => [`/services/${s.id}/`, s.image])),
  ...Object.fromEntries(
    theme.serviceCities.filter((c) => c.core).map((c) => [`/service-areas/${c.slug}/`, "garageHome"])
  ),
};

const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
// Next.js does not XML-escape sitemap image URLs, so keep them free of "&":
// a single `w` parameter is enough for Google Images.
const photo = (key: SiteImageKey) => {
  const { src } = siteImages[key];
  return src.startsWith("/") ? absoluteUrl(src) : `https://images.unsplash.com/${src}?w=1200`;
};

/** Header photo plus any inline ![caption](imageKey) photos in a guide. */
function guideImages(image: SiteImageKey, body: string): string[] {
  const inline = [...body.matchAll(/^!\[[^\]]*\]\(([A-Za-z]+)\)\s*$/gm)]
    .map((m) => m[1])
    .filter((key): key is SiteImageKey => key in siteImages);
  return [...new Set([image, ...inline])].map((key) => photo(key as SiteImageKey));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newestPost = posts.reduce((latest, post) => (post.updated > latest ? post.updated : latest), "");
  const guidesUpdated = toDate(newestPost > SITE_CONTENT_UPDATED ? newestPost : SITE_CONTENT_UPDATED);

  return [
    ...SITE_ROUTES.map((route) => {
      const image = staticPageImages[route.path];
      return {
        url: absoluteUrl(route.path),
        lastModified: toDate(SITE_CONTENT_UPDATED),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        ...(image ? { images: [photo(image)] } : {}),
      };
    }),
    {
      url: absoluteUrl("/blog/"),
      lastModified: guidesUpdated,
      changeFrequency: "weekly",
      priority: 0.7,
      images: [photo("garageInterior")],
    },
    ...BLOG_CATEGORIES.map((category) => {
      const categoryPosts = posts.filter((post) => post.category.slug === category.slug);
      const updated = categoryPosts.reduce((latest, post) => (post.updated > latest ? post.updated : latest), SITE_CONTENT_UPDATED);
      return {
        url: absoluteUrl(`/blog/category/${category.slug}/`),
        lastModified: toDate(updated),
        changeFrequency: "weekly" as const,
        priority: 0.5,
        images: [photo(category.image)],
      };
    }),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}/`),
      lastModified: toDate(post.updated),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: guideImages(post.image, post.body),
    })),
  ];
}

export const dynamic = "force-static";
