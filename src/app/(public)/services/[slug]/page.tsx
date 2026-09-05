import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { theme } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import {
  breadcrumbNode,
  faqPageNode,
  serviceNode,
  withGraph,
} from "@/lib/jsonld";
import { buildMetadata, getService } from "@/lib/seo";
import { ServicePageContent } from "./ServicePageContent";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

// Static export: every service page is pre-rendered from theme.services.categories.
export const dynamicParams = false;

export function generateStaticParams() {
  return theme.services.categories.map((service) => ({ slug: service.id }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${slug}/`,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

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
