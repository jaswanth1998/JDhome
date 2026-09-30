import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading } from "@/components/ui";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { FeatureRow } from "./FeatureRow";

type ServiceCategory = (typeof theme.services.categories)[number];

const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");
const addonServices = theme.services.categories.filter((s) => s.tier === "addon");

const learnMoreClass =
  "inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900";

function ServiceActions({ service }: { service: ServiceCategory }) {
  return (
    <>
      {service.id === "car-lockout" ? (
        <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-primary">
          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
          Call {theme.contact.phone.display}
        </a>
      ) : (
        <InquiryButton service={inquiryServiceForPage(service.id)} variant="navy">
          Get a quote
        </InquiryButton>
      )}
      <Link href={`/services/${service.id}/`} className={learnMoreClass}>
        Learn more
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </>
  );
}

/** Home page services, in the same photo + text rows as the /services/ hub. */
export function ServicesShowcase() {
  return (
    <>
      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="What we do"
            title="Installation and repair, done properly"
            subtitle="New garage doors and openers, smart security cameras, and repairs for what you already have, all from one local team."
          />
          <div className="mt-14 space-y-20 md:space-y-28">
            {primaryServices.map((service, i) => (
              <FeatureRow
                key={service.id}
                image={service.image}
                icon={service.icon}
                headingAs="h3"
                title={service.name}
                description={service.shortDescription}
                points={service.features.slice(0, 6)}
                reverse={i % 2 === 1}
                actions={<ServiceActions service={service} />}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper-warm">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Also available"
            title="Locks and lockouts, handled too"
            subtitle="Handy when you're upgrading a property's security, or when you're locked out of your car."
          />
          <div className="mt-14 space-y-20 md:space-y-28">
            {addonServices.map((service, i) => (
              <FeatureRow
                key={service.id}
                image={service.image}
                icon={service.icon}
                badge={"badge" in service ? service.badge : undefined}
                headingAs="h3"
                title={service.name}
                description={service.shortDescription}
                points={service.features.slice(0, 4)}
                reverse={i % 2 === 0}
                actions={<ServiceActions service={service} />}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Three-step "how it works" row with a strong quote prompt. */
export function HowItWorks() {
  return (
    <section className="section bg-white">
      <div className="container">
        <FeatureRow
          image="garageInterior"
          eyebrow="How it works"
          title="From first message to finished job"
          description="No pressure and no surprises. You'll know the plan and the quote before we start."
          numbered
          points={[
            "Tell us what's going on. Send a quick request online or give us a call.",
            "We get back to you during business hours, talk through options, and book a time that suits you.",
            "We do the work, test everything, and walk you through it before we leave.",
          ]}
          actions={
            <InquiryButton size="lg" attention="shine">
              Start my free quote
            </InquiryButton>
          }
        />
      </div>
    </section>
  );
}

export default ServicesShowcase;
