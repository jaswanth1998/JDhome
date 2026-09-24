import { Car, Clock, Mail, MapPin, Phone } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryForm } from "@/components/inquiry";
import { PageHero } from "@/components/sections";

const details = [
  {
    icon: Phone,
    label: "Phone",
    value: theme.contact.phone.display,
    href: `tel:${theme.contact.phone.tel}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: theme.contact.email,
    href: `mailto:${theme.contact.email}`,
  },
  {
    icon: MapPin,
    label: "Service area",
    value: `${theme.contact.address.city}, ${theme.contact.address.region} · ${theme.contact.address.serviceArea}`,
  },
  {
    icon: Clock,
    label: "Hours",
    value: `${theme.contact.hours.regular.display} · ${theme.contact.hours.emergency.display}`,
  },
];

export function ContactPageContent() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get a free quote"
        subtitle="Tell us what you need in about a minute. We'll get back to you during business hours with clear options and a quote."
        hideActions
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact/" },
        ]}
      />

      <section className="bg-paper-cool pb-16 md:pb-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Form card overlaps the hero */}
            <div className="relative z-10 -mt-8 rounded-[var(--radius-xl)] border border-line bg-white p-6 shadow-[var(--shadow-lg)] md:-mt-12 md:p-10">
              <InquiryForm />
            </div>

            <aside className="space-y-5 lg:pt-10">
              <a
                href={`tel:${theme.contact.phone.tel}`}
                className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-navy-900 p-6 text-white transition-colors hover:bg-navy-800"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                  <Car className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm text-white/70">Locked out of your car? We answer 24/7.</span>
                  <span className="block text-2xl font-bold">{theme.contact.phone.display}</span>
                </span>
              </a>

              <div className="rounded-[var(--radius-xl)] border border-line bg-white p-6">
                <h2 className="text-lg text-ink">Contact details</h2>
                <ul className="mt-5 space-y-5">
                  {details.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-paper-cool text-navy-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">
                          {label}
                        </span>
                        {href ? (
                          <a href={href} className="font-semibold text-ink hover:text-navy-700">
                            {value}
                          </a>
                        ) : (
                          <span className="text-ink-2">{value}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-line bg-white p-6">
                <h2 className="text-lg text-ink">What happens next</h2>
                <ol className="mt-4 space-y-3 text-[0.9375rem] text-ink-2">
                  <li className="flex gap-3">
                    <span className="font-bold text-gold-700">1.</span>
                    We review your request and call, text, or email you back, whichever you prefer.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-gold-700">2.</span>
                    We talk through options and book a visit that suits you.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-gold-700">3.</span>
                    You know the plan and the quote before any work begins.
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPageContent;
