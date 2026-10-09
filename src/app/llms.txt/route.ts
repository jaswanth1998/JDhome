import { theme } from "@/config/theme";
import { GARAGE_SUB_SERVICES } from "@/content/garageServices";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, coreCities } from "@/lib/seo";

// Pre-rendered at build time into out/llms.txt (static export). A plain-markdown summary of the
// business for AI assistants (llmstxt.org), built from the same config as the pages.
export const dynamic = "force-static";

export function GET() {
  const { contact, brand, services } = theme;
  const reviews = contact.googleReviews;
  const otherCities = theme.serviceCities.filter((city) => !city.core).map((city) => city.name);

  const serviceLines = [
    ...services.categories.map(
      (service) => `- [${service.name}](${absoluteUrl(`/services/${service.id}/`)}): ${service.shortDescription}`,
    ),
    ...GARAGE_SUB_SERVICES.map(
      (sub) => `- [${sub.name}](${absoluteUrl(`/services/${sub.slug}/`)}): ${sub.cardBlurb}`,
    ),
  ];

  const cityLines = coreCities.map(
    (city) => `- [${city.name}](${absoluteUrl(`/service-areas/${city.slug}/`)})${city.blurb ? `: ${city.blurb}` : ""}`,
  );

  const guideLines = getAllPosts().map(
    (post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}/`)}): ${post.description}`,
  );

  const body = `# ${brand.name}

> ${brand.description} Based in ${contact.address.city}, ${contact.address.region}, ${contact.address.country}.

## Key facts

- Business name: ${brand.name}
- Website: ${absoluteUrl("/")}
- Phone: ${contact.phone.display} (${contact.phone.tel})
- Email: ${contact.email}
- Based in: ${contact.address.city}, ${contact.address.region}, ${contact.address.country}
- Service area: ${contact.address.serviceArea}: ${coreCities.map((city) => city.name).join(", ")}, plus ${otherCities.join(", ")}
- Hours: ${contact.hours.regular.display}; ${contact.hours.emergency.display}
- Google rating: ${reviews.rating.toFixed(1)} out of 5 from ${reviews.count} reviews (as of ${reviews.asOf}): ${reviews.url}
- Pricing: every job is different, so set prices are not published; quotes are free and given after looking at the job
- Get a quote: ${absoluteUrl("/contact/")}

## Services

${serviceLines.join("\n")}

## Service areas

${cityLines.join("\n")}
- [All service areas](${absoluteUrl("/service-areas/")})

## Guides

${guideLines.join("\n")}

## Optional

- [About ${brand.name}](${absoluteUrl("/about/")})
- [Contact and free quote](${absoluteUrl("/contact/")})
- [Instagram](${contact.social.instagram})
- [Facebook](${contact.social.facebook})
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
