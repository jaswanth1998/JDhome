import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, coreCities } from "@/lib/seo";
import { Breadcrumbs, ServiceCard } from "@/components/ui";
import { FinalCTA } from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Areas We Serve | Oshawa & Durham Region | JD Home Services",
  description:
    "Locksmith, car lockout, and garage door service for Oshawa, Whitby, Ajax, Pickering, Courtice, Bowmanville, and nearby areas in and around Durham Region.",
  path: "/service-areas/",
});

const sectionHeading =
  "text-3xl md:text-4xl font-bold text-[var(--text-primary)]";

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

      {/* Hero */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <Breadcrumbs
            light
            className="mb-8"
            items={[
              { name: "Home", href: "/" },
              { name: "Service Areas", href: "/service-areas/" },
            ]}
          />
          <div className="max-w-3xl">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "white" }}
            >
              Areas We Serve Across Durham Region and Beyond
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              Based in Oshawa, we provide locksmith service, 24/7 car lockout
              help, and garage door repair and installation throughout Durham
              Region and nearby communities.
            </p>
          </div>
        </div>
      </section>

      {/* Core cities */}
      <section className="section bg-white">
        <div className="container">
          <h2 className={`${sectionHeading} mb-4 text-center`}>
            Core Durham Region Communities
          </h2>
          <p className="text-lg text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-12">
            These are the communities closest to our Oshawa base. Each one has
            its own page with details on the services available there.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCities.map((city) => (
              <Link
                key={city.slug}
                href={`/service-areas/${city.slug}/`}
                className="group block h-full bg-white rounded-2xl border border-[var(--border-light)] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                  <MapPin
                    className="w-6 h-6 text-[var(--accent-teal)]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-teal)] transition-colors">
                  {city.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                  {city.blurb}
                </p>
                <span className="inline-flex items-center gap-1 text-[var(--accent-teal)] text-sm font-medium">
                  Services in {city.name}
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other communities */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className={`${sectionHeading} mb-4 text-center`}>
              Other Communities We Travel To
            </h2>
            <p className="text-lg text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-12">
              We also travel to these communities for locksmith, car lockout,
              and garage door work. Call us with your location and we will
              confirm availability.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherRegions.map((group) => (
                <div
                  key={group.region}
                  className="bg-white rounded-2xl border border-[var(--border-light)] p-6"
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                    {group.region}
                  </h3>
                  <ul className="space-y-2">
                    {group.cities.map((city) => (
                      <li
                        key={city.slug}
                        className="flex items-center gap-2 text-[var(--text-secondary)]"
                      >
                        <MapPin
                          className="w-4 h-4 text-[var(--accent-teal)] flex-shrink-0"
                          aria-hidden="true"
                        />
                        {city.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-white">
        <div className="container">
          <h2 className={`${sectionHeading} mb-4 text-center`}>Our Services</h2>
          <p className="text-lg text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-12">
            Three focused services from one Oshawa-based team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theme.services.categories.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                shortDescription={service.shortDescription}
                icon={service.icon}
                color={service.color}
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
