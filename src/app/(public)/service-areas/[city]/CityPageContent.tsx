import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Clock, MapPin, Phone } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { coreCities } from "@/lib/seo";
import type { CityPageCopy } from "@/content/cities";
import { HUB_SLUG } from "@/content/garageServices";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading } from "@/components/ui";
import { AreaServiceCard } from "../AreaServiceCard";
import { FinalCTA, PageHero } from "@/components/sections";
import { GuidesStrip } from "@/components/blog";
import { getPost } from "@/lib/blog";

const HUB_HREF = `/services/${HUB_SLUG}/`;

/** Garage link chips (contract C6 labels). The hub chip is replaced by an in-body link on the Oshawa page. */
const garageChips = [
  { label: "All garage door repairs", href: HUB_HREF },
  { label: "New garage door installation", href: "/services/garage-door-installation/" },
  { label: "Garage door opener installation & repair", href: "/services/garage-door-opener-installation/" },
  { label: "Garage door spring & cable repair", href: "/services/garage-door-spring-repair/" },
] as const;

const cameraChips = [{ label: "Security camera installation", href: "/services/security-camera-installation/" }] as const;

const lockChips = [
  { label: "Lock changes and rekeying", href: "/services/locksmith/" },
  { label: "24/7 car lockout", href: "/services/car-lockout/" },
] as const;

const inlineLink = "font-semibold text-navy-700 underline underline-offset-2 hover:text-navy-900";
const proseClass = "space-y-5 text-lg leading-relaxed text-ink-2";

interface CityPageContentProps {
  city: ServiceCity;
  copy: CityPageCopy;
}

function LinkChips({ links }: { links: readonly { label: string; href: string }[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-600 hover:text-navy-900"
          >
            {link.label}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className={proseClass}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Server component for the core-city service-area pages; every CityPageCopy field is rendered in order. */
export function CityPageContent({ city, copy }: CityPageContentProps) {
  const isHomeBase = city.slug === "oshawa";
  const nearbyCities = coreCities.filter((other) => other.slug !== city.slug);
  const { phone, hours } = theme.contact;

  const guides = copy.guideSlugs.map((slug) => {
    const post = getPost(slug);
    if (!post) throw new Error(`City page "${city.slug}": guide slug "${slug}" does not resolve to a blog post.`);
    return post;
  });

  const garageHeading = copy.garage.heading ?? `Garage door repair and installation in ${city.name}`;
  const cameraHeading = copy.cameras.heading ?? `Security camera installation in ${city.name}`;
  const locksHeading = copy.locks.heading ?? `Locksmith and car lockout in ${city.name}`;
  const garageLinks = isHomeBase ? garageChips.filter((chip) => chip.href !== HUB_HREF) : garageChips;

  return (
    <>
      <PageHero
        eyebrow={city.region}
        title={copy.h1}
        subtitle={copy.subtitle}
        image={copy.image}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Service Areas", href: "/service-areas/" },
          { name: city.name, href: `/service-areas/${city.slug}/` },
        ]}
      />

      {/* Intro + Reach us */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid items-start gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeading eyebrow="Local service" title={isHomeBase ? "Your local team in Oshawa" : `Serving ${city.name}`} />
              <div className="mt-6">
                <Paragraphs paragraphs={copy.intro} />
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
              <p className="mt-4 text-center text-sm text-ink-3">
                Or use our{" "}
                <Link href="/contact/" className={inlineLink}>
                  contact page
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* City-only local angle */}
      <section className="section bg-paper-cool">
        <div className="container">
          <div className="max-w-3xl">
            <SectionHeading eyebrow={`About ${city.name}`} title={copy.localAngle.heading} />
            <div className="mt-6">
              <Paragraphs paragraphs={copy.localAngle.paragraphs} />
            </div>
          </div>
        </div>
      </section>

      {/* Garage, cameras, locks */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Garage doors" title={garageHeading} />
              <div className="mt-6">
                <Paragraphs paragraphs={copy.garage.paragraphs} />
                {isHomeBase && (
                  <p className="mt-5 text-lg leading-relaxed text-ink-2">
                    Full details of the repairs we handle are on our{" "}
                    <Link href={HUB_HREF} className={inlineLink}>
                      garage door repair in Oshawa
                    </Link>{" "}
                    page.
                  </p>
                )}
              </div>
              <LinkChips links={garageLinks} />
            </div>
            <div className="self-start rounded-[var(--radius-xl)] border border-line bg-paper-warm p-7 md:p-8">
              <h3 className="text-xl text-ink">Problems we fix in {city.name}</h3>
              <ul className="mt-5 space-y-3.5">
                {copy.garage.commonIssues.map((issue) => (
                  <li key={issue} className="flex items-start gap-3 text-ink-2">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-800">
                      <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 grid gap-12 border-t border-line pt-16 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Security cameras" title={cameraHeading} />
              <div className="mt-6">
                <Paragraphs paragraphs={copy.cameras.paragraphs} />
              </div>
              <LinkChips links={cameraChips} />
            </div>
            <div>
              <SectionHeading eyebrow="Locks & lockouts" title={locksHeading} />
              <div className="mt-6">
                <Paragraphs paragraphs={copy.locks.paragraphs} />
              </div>
              <LinkChips links={lockChips} />
            </div>
          </div>
        </div>
      </section>

      {/* Neighbourhoods: prose first, then a short list of names */}
      <section className="section bg-paper-warm" aria-labelledby="city-neighbourhoods">
        <div className="container">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Local areas</p>
            <h2 id="city-neighbourhoods" className="text-balance text-3xl text-ink md:text-[2.5rem] md:leading-[1.1]">
              {copy.neighbourhoods.heading}
            </h2>
            <div className="mt-6">
              <Paragraphs paragraphs={copy.neighbourhoods.paragraphs} />
            </div>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {copy.neighbourhoods.names.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink"
                >
                  <MapPin className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently asked questions"
              subtitle={
                <>
                  Still have a question? Call{" "}
                  <a href={`tel:${phone.tel}`} className="font-semibold text-navy-700 underline">
                    {phone.display}
                  </a>
                  .
                </>
              }
            />
            <div className="space-y-3">
              {copy.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-[var(--radius-lg)] border border-line bg-white open:shadow-[var(--shadow-md)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown
                      className="h-5 w-5 flex-shrink-0 text-navy-600 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-6 leading-relaxed text-ink-2">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-paper-cool">
        <div className="container">
          <SectionHeading eyebrow="Services" title={`Services available in ${city.name}`} />
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

      <GuidesStrip posts={guides} title={`Guides for ${city.name} homeowners`} className="section bg-paper-warm" />

      <FinalCTA />
    </>
  );
}

export default CityPageContent;
