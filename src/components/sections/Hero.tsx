import { CheckCircle2, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { theme } from "@/config/theme";
import { Photo } from "@/components/ui";
import { HeroQuoteButton } from "./HeroQuoteButton";
import { HeroVideo } from "./HeroVideo";
import { QuoteStarterCard } from "./QuoteStarterCard";

const assurances = [
  { icon: CheckCircle2, text: "Free, no-obligation quotes" },
  { icon: ShieldCheck, text: "100% satisfaction guaranteed" },
  { icon: Clock, text: "24/7 car lockout line" },
];

/**
 * Light, two-column home hero: benefit-led headline + one clear action on the left,
 * a photo with a "start your quote" card on the right so visitors can begin in one tap.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--paper-warm)_0%,var(--paper)_100%)]">
      {/* Soft gold glow behind the photo */}
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-gold-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="container relative grid items-center gap-12 py-8 sm:py-12 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        {/* Copy */}
        <div className="max-w-xl">
          {/* Phones and tablets: video banner with the service-area label on it */}
          <HeroVideo className="mb-6 lg:hidden">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium min-[380px]:text-xs text-ink-2 shadow-[var(--shadow-sm)] backdrop-blur">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden="true" />
              Serving {theme.contact.address.serviceArea}
            </p>
          </HeroVideo>
          {/* Desktop label (unchanged) */}
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-2 shadow-[var(--shadow-sm)] max-lg:hidden sm:text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
            Serving {theme.contact.address.serviceArea}
          </p>
          {/* Smaller on narrow phones so the quote button stays on the first screen */}
          <h1 className="text-balance text-[2.125rem] leading-[1.06] text-ink min-[380px]:text-[2.5rem] md:text-[3.25rem]">
            Garage doors &amp; security cameras.{" "}
            <span className="text-navy-600">
              Durham&apos;s installation and repair{" "}
              <span className="relative whitespace-nowrap">
                experts
                <span
                  className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-gold-500/70"
                  aria-hidden="true"
                />
              </span>
              .
            </span>
          </h1>
          <p className="mt-5 text-pretty text-base leading-relaxed text-ink-2 min-[380px]:mt-6 min-[380px]:text-lg">
            Local specialists who get the job done quickly and done right, from
            brand-new installs to repairs. Free quote up front and 100%
            satisfaction guaranteed.
          </p>

          {/* Extra top margin leaves room for the button's speech bubble */}
          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
            <HeroQuoteButton />
            <a
              href={`tel:${theme.contact.phone.tel}`}
              className="btn btn-outline btn-lg"
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              {theme.contact.phone.display}
            </a>
          </div>
          <p className="mt-3 text-sm text-ink-3">
            Takes about a minute. We reply during business hours.
          </p>

          <ul className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-2 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {assurances.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gold-600" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo + quote starter */}
        <div className="relative lg:pb-10">
          <Photo
            image="heroGarage"
            priority
            aspect={5 / 4}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="aspect-[5/4] shadow-[var(--shadow-xl)] max-lg:hidden"
            imgClassName="object-[70%_50%]"
          />
          <QuoteStarterCard className="lg:absolute lg:-bottom-2 lg:-left-10 lg:w-[380px]" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
