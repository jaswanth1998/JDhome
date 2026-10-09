import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { theme } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import { GARAGE_SUB_SERVICES, HUB_SLUG, type GarageSubService } from "@/content/garageServices";
import {
  breadcrumbNode,
  faqPageNode,
  serviceNode,
  subServiceNode,
  withGraph,
} from "@/lib/jsonld";
import { buildMetadata, getService, getSubService } from "@/lib/seo";
import { ServicePageContent } from "./ServicePageContent";
import { SubServicePageContent } from "./SubServicePageContent";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

// Static export: every service page is pre-rendered from theme.services.categories,
// plus the garage door sub-service pages from src/content/garageServices.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = [
    ...theme.services.categories.map((service) => service.id),
    ...GARAGE_SUB_SERVICES.map((sub) => sub.slug),
  ];
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) throw new Error(`Duplicate /services/ slug: "${slug}"`);
    seen.add(slug);
  }
  return slugs.map((slug) => ({ slug }));
}

/**
 * Home › Services › Garage Door Repair (hub) › sub-service; shared by the visible
 * breadcrumbs and the JSON-LD so the two always match.
 */
function subServiceCrumbs(sub: GarageSubService): { name: string; path: string }[] {
  const hub = getService(HUB_SLUG);
  if (!hub) throw new Error(`Garage door hub "${HUB_SLUG}" is missing from theme.services.categories`);
  return [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services/" },
    { name: hub.name, path: `/services/${HUB_SLUG}/` },
    { name: sub.name, path: `/services/${sub.slug}/` },
  ];
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (service) {
    return buildMetadata({
      title: service.seo.title,
      description: service.seo.description,
      path: `/services/${slug}/`,
    });
  }

  const sub = getSubService(slug);
  if (!sub) return {};
  return buildMetadata({
    title: sub.seo.title,
    description: sub.seo.description,
    path: `/services/${sub.slug}/`,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (service) {
    return (
      <>
        <JsonLd
          data={withGraph([
            serviceNode(service),
            faqPageNode(service.faqs),
            breadcrumbNode([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services/" },
              { name: service.name, path: `/services/${slug}/` },
            ]),
          ])}
        />
        <ServicePageContent service={service} />
      </>
    );
  }

  const sub = getSubService(slug);
  if (!sub) notFound();
  const crumbs = subServiceCrumbs(sub);

  return (
    <>
      <JsonLd data={withGraph([subServiceNode(sub), faqPageNode(sub.faqs), breadcrumbNode(crumbs)])} />
      <SubServicePageContent
        sub={sub}
        breadcrumbs={crumbs.map((crumb) => ({ name: crumb.name, href: crumb.path }))}
      />
    </>
  );
}
