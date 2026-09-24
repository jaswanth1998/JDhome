import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { FinalCTA, PageHero } from "@/components/sections";
import { Photo, SectionHeading, ServiceIcon } from "@/components/ui";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { cn } from "@/lib/utils";

type ServiceCategory = (typeof theme.services.categories)[number];

const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");
const addonServices = theme.services.categories.filter((s) => s.tier === "addon");

function ServiceRow({ service, reverse }: { service: ServiceCategory; reverse: boolean }) {
  const features: readonly string[] = service.features;
  const badge = "badge" in service ? service.badge : undefined;

  return (
    <article id={service.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Photo
        image={service.image}
        aspect={4 / 3}
        sizes="(min-width: 1024px) 560px, 100vw"
        className={cn("aspect-[4/3]", reverse && "lg:order-2")}
      />
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
            <ServiceIcon name={service.icon} className="h-5 w-5" />
          </span>
          {badge && <span className="badge badge-gold">{badge}</span>}
        </div>
        <h2 className="text-3xl text-ink">{service.name}</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{service.description}</p>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[0.9375rem] text-ink-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
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
        </div>
      </div>
    </article>
  );
}

export function ServicesPageContent() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Garage doors and security cameras, plus the extras"
        subtitle="Two core specialties from one Oshawa-based team: garage door repair and installation, and smart CCTV systems. Locksmith work and 24/7 car lockout help are available as add-ons."
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
