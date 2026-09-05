import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { theme } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, coreCities, getCity } from "@/lib/seo";
import { CityPageContent } from "./CityPageContent";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

// Static export: only core cities get a page; everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return coreCities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city || !city.core) return {};

  const phone = theme.contact.phone.display;
  const description =
    city.slug === "oshawa"
      ? `Locksmith, 24/7 car lockout, and garage door repair and installation in Oshawa, our home base in Durham Region. Call JD Home Services at ${phone}.`
      : `Locksmith, 24/7 car lockout, and garage door repair and installation in ${city.name}, served from our Oshawa base. Call JD Home Services at ${phone}.`;

  return buildMetadata({
    title: `${city.name} Locksmith, Car Lockout & Garage Door Services`,
    description,
    path: `/service-areas/${city.slug}/`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city || !city.core) notFound();

  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Service Areas", path: "/service-areas/" },
            { name: city.name, path: `/service-areas/${city.slug}/` },
          ]),
        ])}
      />
      <CityPageContent city={city} />
    </>
  );
}
