import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { theme } from "@/config/theme";
import { GARAGE_SUB_SERVICES, HUB_SLUG } from "@/content/garageServices";
import { InquiryButton } from "@/components/inquiry";
import { FeatureRow, FinalCTA, PageHero } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";

type ServiceCategory = (typeof theme.services.categories)[number];

const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");
const addonServices = theme.services.categories.filter((s) => s.tier === "addon");

function ServiceRow({ service, reverse }: { service: ServiceCategory; reverse: boolean }) {
  return (
    <FeatureRow
      id={service.id}
      image={service.image}
      icon={service.icon}
      badge={"badge" in service ? service.badge : undefined}
      title={service.name}
      description={service.description}
      points={service.features}
      reverse={reverse}
      actions={
        <>
          <InquiryButton service={inquiryServiceForPage(service.id)} variant="navy">
            Get a quote
          </InquiryButton>
          <Link
            href={`/services/${service.id}/`}
            className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900"
          >
            Details &amp; FAQs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {service.id === HUB_SLUG && <GarageSubServiceLinks />}
        </>
      }
    />
  );
}

/** Compact row linking the garage door sub-service pages (contract C6 labels). */
function GarageSubServiceLinks() {
  return (
    <div className="w-full pt-2">
      <p className="text-sm font-semibold text-ink">Garage door services</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {GARAGE_SUB_SERVICES.map((sub) => (
          <li key={sub.slug}>
            <Link
              href={`/services/${sub.slug}/`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-navy-600 hover:text-navy-800"
            >
              {sub.cardLabel}
              <ArrowRight className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesPageContent() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Garage doors and security cameras, plus the extras"
        subtitle="Two core specialties from one local team serving Durham Region and surrounding areas: garage door installation and repair, and smart security camera installation. Locksmith work and 24/7 car lockout help are available as add-ons."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services/" },
        ]}
        image="garageService"
      />

      <section className="section bg-white">
        <div className="container space-y-20 md:space-y-28">
          {primaryServices.map((service, i) => (
            <ServiceRow key={service.id} service={service} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section className="section bg-paper-warm">
        <div className="container">
          <SectionHeading
            eyebrow="Add-on services"
            title="Locks and lockouts, handled too"
            subtitle="Handy when you're already upgrading a property's security, or when you need help getting back into your car."
          />
          <div className="mt-14 space-y-20 md:space-y-28">
            {addonServices.map((service, i) => (
              <ServiceRow key={service.id} service={service} reverse={i % 2 === 0} />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

export default ServicesPageContent;
