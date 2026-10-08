import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { JsonLd } from "@/components/seo";
import { breadcrumbNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, coreCities } from "@/lib/seo";
import { SectionHeading } from "@/components/ui";
import { AreaServiceCard } from "./AreaServiceCard";
import { FinalCTA, PageHero } from "@/components/sections";

export const metadata: Metadata = buildMetadata({
  title: "Garage Door Repair Durham Region | Areas We Serve | JD Home",
  description:
    "Garage door repair, new doors and security cameras across Durham Region: Oshawa, Whitby, Ajax, Pickering, Clarington, Port Perry, Uxbridge and beyond.",
  path: "/service-areas/",
});

const allCities: readonly ServiceCity[] = theme.serviceCities;

const inlineLink = "font-semibold text-navy-700 underline underline-offset-2 hover:text-navy-900";

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
        title="Garage Door Repair & Installation Across Durham Region"
        subtitle="We provide garage door installation and repair and security camera systems throughout Durham Region and surrounding areas, with locksmith and 24/7 car lockout help as add-ons."
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
            title="Core Durham Region communities"
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

      <section className="section bg-paper-warm">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="East of Oshawa" title="Clarington: Courtice and Bowmanville" />
              <p className="mt-6 text-lg leading-relaxed text-ink-2">
                Courtice and Bowmanville both belong to the Municipality of Clarington, just east of our Oshawa base.{" "}
                <Link href="/service-areas/courtice/" className={inlineLink}>
                  Courtice
                </Link>{" "}
                starts where Oshawa ends, and{" "}
                <Link href="/service-areas/bowmanville/" className={inlineLink}>
                  Bowmanville
                </Link>{" "}
                lies a little farther east along Highway 401; each has its own page with local details. We also travel to
                Newcastle and the smaller Clarington communities for garage door repairs, new doors and camera systems.
              </p>
            </div>
            <div>
              <SectionHeading eyebrow="North Durham" title="Port Perry, Uxbridge and north Durham" />
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-2">
                <p id="port-perry" className="scroll-mt-28">
                  <strong className="text-ink">Port Perry</strong> sits on the shore of Lake Scugog in the Township of
                  Scugog, straight up Simcoe Street from Oshawa. We come up for spring and opener repairs, replacement
                  doors on lakeside and country homes, and camera systems that watch a driveway or a detached garage set
                  back from the road.
                </p>
                <p id="uxbridge" className="scroll-mt-28">
                  <strong className="text-ink">Uxbridge</strong>, in the north-west corner of Durham Region, pairs an
                  older downtown with rural lots and long lanes. Garage door repairs and new installs are booked there
                  like anywhere else, and on larger properties it usually makes sense to place cameras at the lane
                  entrance, the outbuildings and the garage itself. Share your address when you call so we can plan the trip.
                </p>
              </div>
            </div>
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
              <AreaServiceCard
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
