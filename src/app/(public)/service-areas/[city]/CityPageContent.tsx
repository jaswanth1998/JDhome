import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { coreCities } from "@/lib/seo";
import { Breadcrumbs, ServiceCard } from "@/components/ui";
import { FinalCTA } from "@/components/sections";

const sectionHeading =
  "text-3xl md:text-4xl font-bold text-[var(--text-primary)]";

const inlineLink =
  "text-[var(--accent-teal)] underline underline-offset-2 hover:text-[var(--accent-teal-hover)] transition-colors";
// Inline colour because the global `a { color: inherit }` rule is unlayered and beats text utilities.
const inlineLinkStyle = { color: "var(--accent-teal)" };

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
    pickering: "Pickering is the farthest west of our core Durham communities, so please share your location when you call so we can plan the drive from Oshawa.",
    courtice: "Courtice sits right next door to Oshawa, so it is one of the shortest trips we make.",
    bowmanville: "For Bowmanville and the rest of Clarington we travel east from Oshawa along Highway 401, so let us know your address when you call.",
  };
  const bookingLead = bookingLeads[city.slug] ?? `We are happy to help in ${city.name}.`;
  const nearbyCities = coreCities.filter((other) => other.slug !== city.slug);
  const { phone, hours } = theme.contact;

  return (
    <>
      {/* Hero */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <Breadcrumbs
            light
            className="mb-8"
            items={[
              { name: "Home", href: "/" },
              { name: "Service Areas", href: "/service-areas/" },
              { name: city.name, href: `/service-areas/${city.slug}/` },
            ]}
          />

          <div className="max-w-3xl">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "white" }}
            >
              Locksmith, Car Lockout &amp; Garage Door Services in {city.name}
            </h1>

            {city.blurb && (
              <p className="text-lg md:text-xl text-white/80 mb-8">
                {city.blurb}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <a href={`tel:${phone.tel}`} className="btn btn-emergency btn-lg">
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>Call Now: {phone.display}</span>
              </a>
              <Link href="/contact/" className="btn btn-primary btn-lg">
                <span>Get a Free Quote</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we do here + how to reach us */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <h2 className={`${sectionHeading} mb-6`}>
                What We Do in {city.name}
              </h2>
              <div className="space-y-5 text-lg text-[var(--text-secondary)] leading-relaxed">
                <p>
                  {isHomeBase
                    ? "Oshawa is our home base, so it is where we handle all three of our services most often."
                    : `In ${city.name}, we provide the same three services we offer at home in Oshawa.`}{" "}
                  That means residential and commercial locksmith work such as
                  lock changes, rekeying, lock repair, and new deadbolt and
                  entry hardware for houses, rental units, offices, and
                  storefronts; 24/7 car lockout help with damage-free entry
                  whenever possible; and garage door repair and installation,
                  including track, roller, cable, and opener work backed by
                  safety and balance checks.
                </p>
                <p>
                  {bookingLead} To book a visit or ask a question, call us at{" "}
                  <a
                    href={`tel:${phone.tel}`}
                    className={inlineLink}
                    style={inlineLinkStyle}
                  >
                    {phone.display}
                  </a>{" "}
                  or send a message through our{" "}
                  <Link
                    href="/contact/"
                    className={inlineLink}
                    style={inlineLinkStyle}
                  >
                    contact page
                  </Link>
                  . Regular hours are {hours.regular.display}, and car lockout
                  help is available 24/7. When you call, we confirm your
                  location and give you a clear arrival estimate before we head
                  out.
                </p>
              </div>
            </div>

            <aside className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Reach Us
              </h3>
              <ul className="space-y-4 text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <Phone
                    className="w-5 h-5 mt-0.5 text-[var(--accent-teal)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${phone.tel}`}
                    className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-teal)] transition-colors"
                  >
                    {phone.display}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock
                    className="w-5 h-5 mt-0.5 text-[var(--accent-teal)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p>{hours.regular.display}</p>
                    <p className="text-[var(--accent-orange)] font-medium">
                      24/7 for car lockouts
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin
                    className="w-5 h-5 mt-0.5 text-[var(--accent-teal)] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {isHomeBase
                      ? "Based in Oshawa, Durham Region"
                      : `Serving ${city.name} from our Oshawa base`}
                  </span>
                </li>
              </ul>
              <Link href="/contact/" className="btn btn-primary w-full mt-6">
                <span>Request a Quote</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Services available here */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <h2 className={`${sectionHeading} mb-8 text-center`}>
            Services Available in {city.name}
          </h2>
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

      {/* Nearby areas */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className={`${sectionHeading} mb-4`}>Nearby Areas</h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              We also serve these Durham Region communities from Oshawa.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {nearbyCities.map((other) => (
                <Link
                  key={other.slug}
                  href={`/service-areas/${other.slug}/`}
                  className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--border-medium)] transition-colors"
                >
                  {other.name}
                </Link>
              ))}
              <Link
                href="/service-areas/"
                className="px-4 py-2 rounded-full bg-[var(--accent-teal)] text-white text-sm font-medium hover:bg-[var(--accent-teal-hover)] transition-colors"
                style={{ color: "white" }}
              >
                All service areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

export default CityPageContent;
