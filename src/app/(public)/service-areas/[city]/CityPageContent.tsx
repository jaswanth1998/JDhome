import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { coreCities } from "@/lib/seo";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading, ServiceCard } from "@/components/ui";
import { FinalCTA, PageHero } from "@/components/sections";
import { GuidesStrip } from "@/components/blog";
import { getPost } from "@/lib/blog";

const cityGuideSlugs = ["garage-door-wont-open", "where-to-place-security-cameras", "winter-garage-door-maintenance-ontario"];

const inlineLink = "font-semibold text-navy-700 underline underline-offset-2 hover:text-navy-900";

interface CityPageContentProps {
  city: ServiceCity;
}

/** Server component for the core-city service-area pages. */
export function CityPageContent({ city }: CityPageContentProps) {
  const isHomeBase = city.slug === "oshawa";
  const bookingLeads: Record<string, string> = {
    oshawa: "Because we are based right here in Oshawa, you are calling your local team directly.",
    whitby: "Whitby is a short drive west of our Oshawa base, so booking a visit is straightforward.",
    ajax: "For Ajax jobs we head west along Highway 401 from Oshawa, so calling ahead with your address helps us plan the trip.",
    pickering:
      "Pickering is the farthest west of our core Durham communities, so please share your location when you call so we can plan the drive from Oshawa.",
    courtice: "Courtice sits right next door to Oshawa, so it is one of the shortest trips we make.",
    bowmanville:
      "For Bowmanville and the rest of Clarington we travel east from Oshawa along Highway 401, so let us know your address when you call.",
  };
  const bookingLead = bookingLeads[city.slug] ?? `We are happy to help in ${city.name}.`;
  const nearbyCities = coreCities.filter((other) => other.slug !== city.slug);
  const { phone, hours } = theme.contact;

  return (
    <>
      <PageHero
        eyebrow={city.region}
        title={`Garage Door & Security Camera Services in ${city.name}`}
        subtitle={city.blurb}
        image="garageHome"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Service Areas", href: "/service-areas/" },
          { name: city.name, href: `/service-areas/${city.slug}/` },
        ]}
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid items-start gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading eyebrow="Local service" title={`What we do in ${city.name}`} />
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-2">
                <p>
                  {isHomeBase
                    ? "Oshawa is our home base, so it is where we handle our services most often."
                    : `In ${city.name}, we provide the same services we offer at home in Oshawa.`}{" "}
                  That starts with garage door repair and installation, including spring, cable, track, roller, and
                  opener work backed by safety and balance checks, and smart security camera systems with AI detection,
                  PoE wiring, local recording, and phone access for homes and businesses. We also offer residential and
                  commercial locksmith work and 24/7 car lockout help as add-on services.
                </p>
                <p>
                  {bookingLead} To book a visit or ask a question, call us at{" "}
                  <a href={`tel:${phone.tel}`} className={inlineLink}>
                    {phone.display}
                  </a>{" "}
                  or send a request through our{" "}
                  <Link href="/contact/" className={inlineLink}>
                    contact page
                  </Link>
                  . Regular hours are {hours.regular.display}, and car lockout help is available 24/7. When you call, we
                  confirm your location and give you a clear arrival estimate before we head out.
                </p>
              </div>
            </div>

            <aside className="rounded-[var(--radius-xl)] border border-line bg-paper-warm p-7">
              <h2 className="text-lg text-ink">Reach us</h2>
              <ul className="mt-5 space-y-4 text-ink-2">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                  <a href={`tel:${phone.tel}`} className="font-semibold text-ink hover:text-navy-700">
                    {phone.display}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                  <span>
                    {hours.regular.display}
                    <br />
                    <span className="text-sm text-ink-3">{hours.emergency.display}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                  <span>{isHomeBase ? "Based in Oshawa, Durham Region" : `Serving ${city.name} from our Oshawa base`}</span>
                </li>
              </ul>
              <InquiryButton variant="navy" fullWidth className="mt-7">
                Request a quote
              </InquiryButton>
            </aside>
          </div>
        </div>
      </section>

      <section className="section bg-paper-cool">
        <div className="container">
          <SectionHeading eyebrow="Services" title={`Services available in ${city.name}`} />
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

      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Nearby"
            title="Nearby areas"
            subtitle="We also serve these Durham Region communities from Oshawa."
          />
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {nearbyCities.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/service-areas/${other.slug}/`}
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-navy-600"
                >
                  <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  {other.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/service-areas/"
                className="block rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
              >
                All service areas
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <GuidesStrip
        posts={cityGuideSlugs.map(getPost).filter((post) => post !== undefined)}
        title={`Guides for ${city.name} homeowners`}
        className="section bg-paper-warm"
      />

      <FinalCTA />
    </>
  );
}

export default CityPageContent;
