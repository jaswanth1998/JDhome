import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, coreCities } from "@/lib/seo";
import { SectionHeading, ServiceCard } from "@/components/ui";
import { FinalCTA, PageHero } from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Areas We Serve | Oshawa & Durham Region | JD Home Services",
  description:
    "Garage door repair, security cameras, locksmith, and car lockout service for Oshawa, Whitby, Ajax, Pickering, Courtice, Bowmanville, and nearby areas.",
  path: "/service-areas/",
});

const allCities: readonly ServiceCity[] = theme.serviceCities;

/** Non-core cities grouped by region, Durham Region first, otherwise in theme order. */
function groupOtherCitiesByRegion() {
  const groups: { region: string; cities: ServiceCity[] }[] = [];

  for (const city of allCities) {
    if (city.core) continue;
    const group = groups.find((g) => g.region === city.region);
    if (group) {
      group.cities.push(city);
    } else {
      groups.push({ region: city.region, cities: [city] });
    }
  }

  return groups.sort((a, b) => {
    if (a.region === b.region) return 0;
    if (a.region === "Durham Region") return -1;
    if (b.region === "Durham Region") return 1;
    return 0;
  });
}

export default function ServiceAreasPage() {
  const otherRegions = groupOtherCitiesByRegion();

  return (
    <>
      <JsonLd
        data={withGraph([
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Service Areas", path: "/service-areas/" },
          ]),
        ])}
      />

      <PageHero
        eyebrow="Service areas"
        title="Areas we serve across Durham Region and beyond"
        subtitle="Based in Oshawa, we provide garage door repair and installation and security camera systems throughout Durham Region and nearby communities, with locksmith and 24/7 car lockout help as add-ons."
        image="garageDark"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Service Areas", href: "/service-areas/" },
        ]}
      />

      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Core communities"
            title="Closest to our Oshawa base"
            subtitle="Each of these communities has its own page with details on the services available there."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreCities.map((city) => (
              <Link
                key={city.slug}
                href={`/service-areas/${city.slug}/`}
                className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-lg)]"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg text-ink">{city.name}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">{city.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                  Services in {city.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper-cool">
        <div className="container">
          <SectionHeading
            eyebrow="Farther afield"
            title="Other communities we travel to"
            subtitle="Call us with your location and we will confirm availability."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherRegions.map((group) => (
              <div key={group.region} className="rounded-[var(--radius-lg)] border border-line bg-white p-6">
                <h3 className="text-base text-ink">{group.region}</h3>
                <ul className="mt-3 space-y-2">
                  {group.cities.map((city) => (
                    <li key={city.slug} className="flex items-center gap-2 text-ink-2">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
                      {city.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="Services" title="What we do in every area" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {theme.services.categories.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                shortDescription={service.shortDescription}
                icon={service.icon}
                image={service.image}
                badge={"badge" in service ? service.badge : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
