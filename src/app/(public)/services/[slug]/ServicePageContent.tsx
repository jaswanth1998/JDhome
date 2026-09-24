import Link from "next/link";
import { Check, ChevronDown, MapPin, Phone } from "lucide-react";
import { theme, type ServiceFaq } from "@/config/theme";
import { coreCities, type ServiceCategory } from "@/lib/seo";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading, ServiceCard } from "@/components/ui";
import { CameraSystemDiagram, FinalCTA, GarageProblems, PageHero } from "@/components/sections";
import { GuidesStrip } from "@/components/blog";
import { getPostsForService } from "@/lib/blog";

interface ServicePageContentProps {
  service: ServiceCategory;
}

/** Server component for /services/[slug]/. */
export function ServicePageContent({ service }: ServicePageContentProps) {
  const badge = "badge" in service ? service.badge : undefined;
  const features: readonly string[] = service.features;
  const faqs: readonly ServiceFaq[] = service.faqs;
  const inquiryService = inquiryServiceForPage(service.id);
  const relatedServices = theme.services.categories.filter((other) => other.id !== service.id);
  const isLockout = service.id === "car-lockout";

  return (
    <>
      <PageHero
        title={service.seo.h1}
        subtitle={service.shortDescription}
        eyebrow={service.tier === "addon" ? "Add-on service" : "Core service"}
        badge={badge ? `${badge} available` : undefined}
        image={service.image}
        service={inquiryService}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services/" },
          { name: service.name, href: `/services/${service.id}/` },
        ]}
      />

      {/* Overview + what's included */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Overview" title="About this service" />
              <p className="mt-6 text-lg leading-relaxed text-ink-2">{service.description}</p>
              {isLockout && (
                <a
                  href={`tel:${theme.contact.phone.tel}`}
                  className="mt-8 flex items-center gap-4 rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">Locked out right now? Call any time.</span>
                    <span className="block text-xl font-bold text-navy-800">{theme.contact.phone.display}</span>
                  </span>
                </a>
              )}
            </div>
            <div className="rounded-[var(--radius-xl)] border border-line bg-paper-warm p-7 md:p-8">
              <h2 className="text-xl text-ink">What&apos;s included</h2>
              <ul className="mt-5 space-y-3.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-ink-2">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-800">
                      <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <InquiryButton service={inquiryService} variant="navy" fullWidth className="mt-7">
                Request a quote
              </InquiryButton>
            </div>
          </div>
        </div>
      </section>

      {service.id === "security-camera-installation" && <CameraSystemDiagram />}
      {service.id === "garage-door-repair-installation" && <GarageProblems />}

      {/* FAQ */}
      <section className="section bg-paper-cool">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently asked questions"
              subtitle={
                <>
                  Still have a question? Call{" "}
                  <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
                    {theme.contact.phone.display}
                  </a>
                  .
                </>
              }
            />
            <div className="space-y-3">
              {faqs.map((faq) => (
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

      {/* Areas */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Service area"
            title="Areas we serve"
            subtitle="Based in Oshawa, we offer this service throughout Durham Region and nearby communities."
          />
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {coreCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/service-areas/${city.slug}/`}
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-navy-600"
                >
                  <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  {city.name}
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

      {/* Related */}
      <section className="section bg-paper-warm">
        <div className="container">
          <SectionHeading eyebrow="More from JD Home Services" title="Related services" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {relatedServices.map((related) => (
              <ServiceCard
                key={related.id}
                id={related.id}
                name={related.name}
                shortDescription={related.shortDescription}
                icon={related.icon}
                image={related.image}
                badge={"badge" in related ? related.badge : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <GuidesStrip
        posts={getPostsForService(service.id)}
        title={`${service.shortName} guides`}
        subtitle="Practical advice from our team before you book."
      />

      <FinalCTA service={inquiryService} />
    </>
  );
}

export default ServicePageContent;
