import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo";
import { getCityPage } from "@/content/cities";
import { breadcrumbNode, faqPageNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, coreCities, getCity } from "@/lib/seo";
import { CityPageContent } from "./CityPageContent";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

// Static export: only core cities get a page; everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return coreCities.map((city) => {
    const copy = getCityPage(city.slug);
    if (!copy || !copy.seo.title.trim() || !copy.h1.trim()) {
      throw new Error(`City page "${city.slug}" is missing its seo.title or h1 in src/content/cities/.`);
    }
    if (copy.faqs.length < 4) {
      throw new Error(`City page "${city.slug}" needs at least 4 FAQs (has ${copy.faqs.length}).`);
    }
    return { city: city.slug };
  });
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  const copy = getCityPage(slug);
  if (!city || !city.core || !copy) return {};

  return buildMetadata({
    title: copy.seo.title,
    description: copy.seo.description,
    path: `/service-areas/${city.slug}/`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getCity(slug);
  const copy = getCityPage(slug);
  if (!city || !city.core || !copy) notFound();

  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Service Areas", path: "/service-areas/" },
            { name: city.name, path: `/service-areas/${city.slug}/` },
          ]),
          faqPageNode(copy.faqs),
        ])}
      />
      <CityPageContent city={city} copy={copy} />
    </>
  );
}
