import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { Photo, Reveal, SectionHeading, ServiceIcon } from "@/components/ui";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";

const primaryServices = theme.services.categories.filter((s) => s.tier === "primary");

/** The two headline services, side by side with photos. */
export function CoreServices() {
  return (
    <section className="section bg-paper-warm">
      <div className="container">
        <SectionHeading
          eyebrow="What we do"
          title="Two specialties, done properly"
          subtitle="We keep our focus narrow so the work is right the first time: garage doors that run safely and smoothly, and camera systems you can actually rely on."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {primaryServices.map((service, index) => {
            const features: readonly string[] = service.features;
            return (
              <Reveal key={service.id} delay={index * 0.08}>
                <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white">
                  <Photo
                    image={service.image}
                    aspect={16 / 9}
                    sizes="(min-width: 1024px) 600px, 100vw"
                    className="aspect-[16/9] rounded-none"
                  />
                  <div className="flex flex-1 flex-col p-7 md:p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                        <ServiceIcon name={service.icon} className="h-5 w-5" />
                      </span>
                      <h3 className="text-2xl text-ink">{service.name}</h3>
                    </div>
                    <p className="leading-relaxed text-ink-2">{service.shortDescription}</p>
                    <ul className="mt-6 grid flex-1 gap-2.5 sm:grid-cols-2">
                      {features.slice(0, 6).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-ink-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                      <InquiryButton service={inquiryServiceForPage(service.id)} variant="navy">
                        Get a quote
                      </InquiryButton>
                      <Link
                        href={`/services/${service.id}/`}
                        className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900"
                      >
                        Learn more about {service.shortName.toLowerCase()}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CoreServices;
