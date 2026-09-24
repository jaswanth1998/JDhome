import { Car, Cctv, CheckCircle2, Phone, Warehouse, Wrench } from "lucide-react";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { Photo } from "@/components/ui";
import type { InquiryService } from "@/lib/inquiries/schema";

const quickPicks: { label: string; service: InquiryService; icon: typeof Wrench }[] = [
  { label: "Garage door repair", service: "garage-repair", icon: Wrench },
  { label: "New garage door", service: "garage-install", icon: Warehouse },
  { label: "Security cameras", service: "security-cameras", icon: Cctv },
  { label: "Car lockout", service: "car-lockout", icon: Car },
];

const assurances = [
  "Free, no-obligation quotes",
  "Clear options before any work begins",
  "Safety check on every garage door job",
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <Photo
        image="heroGarage"
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 rounded-none"
        imgClassName="object-[70%_50%]"
      />
      {/* Readability overlay: solid navy on the text side, fading toward the photo */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,20,42,0.96)_0%,rgba(6,20,42,0.88)_45%,rgba(6,20,42,0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(6,20,42,0.82)_0%,rgba(6,20,42,0.94)_100%)]"
        aria-hidden="true"
      />

      <div className="container py-16 md:py-24 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-light mb-5">Oshawa &amp; Durham Region</p>
          <h1 className="text-balance text-[2.5rem] leading-[1.05] text-white md:text-6xl">
            Garage doors fixed right. <span className="text-gold-500">Cameras</span> that keep watch.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/80">
            Local technicians for garage door repair and installation, and smart CCTV systems with AI detection, PoE
            wiring, and phone access, for homes and businesses across Durham Region.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <InquiryButton size="lg">Get a free quote</InquiryButton>
            <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-ghost-light btn-lg">
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              {theme.contact.phone.display}
            </a>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick start */}
        <div className="mt-12 max-w-3xl rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md md:mt-16 md:p-5">
          <p className="mb-3 px-1 text-sm font-semibold text-white">What can we help with?</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {quickPicks.map(({ label, service, icon: Icon }) => (
              <InquiryButton
                key={service}
                service={service}
                variant="ghost-light"
                icon={null}
                className="!justify-start !whitespace-normal !px-3 !py-3 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px] flex-shrink-0 text-gold-500" aria-hidden="true" />
                  {label}
                </span>
              </InquiryButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
