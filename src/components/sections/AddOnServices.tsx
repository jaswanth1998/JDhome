import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { Photo, SectionHeading, ServiceIcon } from "@/components/ui";

const addons = theme.services.categories.filter((s) => s.tier === "addon");

/** Locksmith and car lockout, presented as extra services. */
export function AddOnServices() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Also available"
            title="Add-on services"
            subtitle="Upgrading your security? We can take care of the locks too, and we're on call 24/7 if you're ever locked out of your car."
          />
          <Link
            href="/services/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900"
          >
            See all services
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {addons.map((service) => {
            const badge = "badge" in service ? service.badge : undefined;
            return (
              <Link
                key={service.id}
                href={`/services/${service.id}/`}
                className="group grid overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white transition-shadow hover:shadow-[var(--shadow-lg)] sm:grid-cols-[200px_1fr]"
              >
                <Photo
                  image={service.image}
                  aspect={1}
                  sizes="(min-width: 640px) 200px, 100vw"
                  className="aspect-[16/9] rounded-none sm:aspect-auto sm:h-full"
                  imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <ServiceIcon name={service.icon} className="h-5 w-5 text-navy-700" />
                    <h3 className="text-lg text-ink">{service.name}</h3>
                    {badge && <span className="badge badge-gold ml-auto">{badge}</span>}
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-2">{service.shortDescription}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                    {service.id === "car-lockout" ? (
                      <>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        Call any time: {theme.contact.phone.display}
                      </>
                    ) : (
                      <>
                        Learn more
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AddOnServices;
