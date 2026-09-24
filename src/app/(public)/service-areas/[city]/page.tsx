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
      ? `Garage door repair and installation and smart security camera systems in Oshawa, our home base. Locksmith and 24/7 car lockout too. Call ${phone}.`
      : `Garage door repair and installation and smart security camera systems in ${city.name}, served from Oshawa. Locksmith and lockouts too. Call ${phone}.`;

  return buildMetadata({
    title: `${city.name} Garage Door Repair & Security Cameras`,
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
