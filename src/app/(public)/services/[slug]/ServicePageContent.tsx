import Link from "next/link";
import {
  ArrowRight,
  Car,
  Check,
  ChevronDown,
  Home,
  Lock,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { theme, type ServiceFaq } from "@/config/theme";
import { coreCities, type ServiceCategory } from "@/lib/seo";
import { Breadcrumbs, ServiceCard } from "@/components/ui";
import { FinalCTA } from "@/components/sections";

// Icon names stored in theme.services.categories[].icon
const serviceIcons: Record<string, LucideIcon> = { Lock, Car, Home };

const sectionHeading =
  "text-3xl md:text-4xl font-bold text-[var(--text-primary)]";

interface ServicePageContentProps {
  service: ServiceCategory;
}

/** Server component: static content, no client JS beyond the shared CTA/cards. */
export function ServicePageContent({ service }: ServicePageContentProps) {
  const badge = "badge" in service ? service.badge : undefined;
  const Icon = serviceIcons[service.icon];
  const features: readonly string[] = service.features;
  const faqs: readonly ServiceFaq[] = service.faqs;
  const relatedServices = theme.services.categories.filter(
    (other) => other.id !== service.id
  );

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
              { name: "Services", href: "/services/" },
              { name: service.name, href: `/services/${service.id}/` },
            ]}
          />

          <div className="max-w-3xl">
            {badge && (
              <span className="inline-block px-4 py-1 rounded-full bg-[var(--accent-orange)] text-white text-sm font-medium mb-4">
                {badge}
              </span>
            )}

            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "white" }}
            >
              {service.seo.h1}
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8">
              {service.shortDescription}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${theme.contact.phone.tel}`}
                className="btn btn-emergency btn-lg"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>Call Now: {theme.contact.phone.display}</span>
              </a>
              <Link href="/contact/" className="btn btn-primary btn-lg">
                <span>Get a Free Quote</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About this service */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className={`${sectionHeading} mb-6`}>About This Service</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                {service.description}
              </p>
            </div>

            <div className="relative aspect-square w-full max-w-md mx-auto">
              <div
                className="absolute inset-8 rounded-3xl opacity-10"
                style={{ backgroundColor: service.color }}
              />
              <div className="relative h-full flex items-center justify-center">
                <div
                  className="w-48 h-48 md:w-64 md:h-64 rounded-3xl shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: service.color }}
                >
                  {Icon && (
                    <Icon
                      className="w-24 h-24 md:w-32 md:h-32 text-white"
                      strokeWidth={1}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className={`${sectionHeading} mb-8 text-center`}>
              What&apos;s Included
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 bg-white rounded-2xl border border-[var(--border-light)] p-5"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <Check
                      className="w-4 h-4"
                      style={{ color: service.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className={`${sectionHeading} mb-8 text-center`}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-[var(--border-light)] bg-white open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown
                      className="w-5 h-5 flex-shrink-0 text-[var(--accent-teal)] transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Areas we serve */}
      <section className="section bg-[var(--primary-main)] text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <MapPin
                className="w-8 h-8 text-[var(--accent-teal)]"
                aria-hidden="true"
              />
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "white" }}
            >
              Areas We Serve
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Based in Oshawa, we offer this service throughout Durham Region
              and the nearby communities below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {coreCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/service-areas/${city.slug}/`}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  {city.name}
                </Link>
              ))}
              <Link
                href="/service-areas/"
                className="px-4 py-2 rounded-full bg-[var(--accent-teal)] text-white text-sm font-medium hover:bg-[var(--accent-teal-hover)] transition-colors"
              >
                All service areas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container">
          <h2 className={`${sectionHeading} mb-8 text-center`}>
            Related Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {relatedServices.map((related) => (
              <ServiceCard
                key={related.id}
                id={related.id}
                name={related.name}
                shortDescription={related.shortDescription}
                icon={related.icon}
                color={related.color}
                badge={"badge" in related ? related.badge : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

export default ServicePageContent;
