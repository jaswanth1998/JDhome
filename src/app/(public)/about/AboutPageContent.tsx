import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Handshake, MessageSquareText, ShieldCheck } from "lucide-react";
import { theme, type ServiceCity } from "@/config/theme";
import { FinalCTA, PageHero } from "@/components/sections";
import { Photo, Reveal, SectionHeading } from "@/components/ui";

const principles = [
  {
    icon: MessageSquareText,
    title: "Straight answers",
    body: "We explain what we find in plain language and give you options before any work begins.",
  },
  {
    icon: ClipboardCheck,
    title: "Tested before we leave",
    body: "Garage doors get a safety and balance check; camera systems get a full walkthrough on your phone.",
  },
  {
    icon: Handshake,
    title: "No overselling",
    body: "If a repair makes more sense than a replacement, or two cameras will do instead of six, we'll say so.",
  },
  {
    icon: ShieldCheck,
    title: "Respect for your property",
    body: "Clean, tidy installs with cabling done properly and the work area left the way we found it.",
  },
];

const values = [
  "Integrity in every interaction",
  "Quality workmanship",
  "Transparent, upfront communication",
  "Practical recommendations based on real needs",
  "Respect for your property and time",
  "Follow-through after the job is done",
];

const serviceCities: readonly ServiceCity[] = theme.serviceCities;

export function AboutPageContent() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A local team for garage doors and home security"
        subtitle="JD Home Services is based in Oshawa and focused on two things: garage doors that run safely and smoothly, and security camera systems people can rely on."
        image="modernHome"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about/" },
        ]}
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Our story" title={theme.brand.tagline} />
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-2">
                <p>
                  {theme.brand.name} was founded with a simple mission: give Durham Region homeowners and businesses
                  trustworthy, professional service they can rely on, with the same care on every job.
                </p>
                <p>
                  Today our work centres on garage door repair and installation, and on smart security camera systems
                  with AI detection, PoE wiring, local recording, and phone access. We also help with locksmith work and
                  24/7 car lockouts, so one call covers the doors, locks, and cameras that keep a property secure.
                </p>
                <p>
                  Ongoing training and practical field experience help us recommend the right solution for your home or
                  business without selling you work you don&apos;t need.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Photo
                image="garageService"
                aspect={3 / 4}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="aspect-[3/4]"
              />
              <Photo
                image="cctvWall"
                aspect={3 / 4}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="mt-10 aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-paper-cool">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="How we work"
            title="What you can expect from us"
            subtitle="The same standards on every job, whether it's a noisy garage door or an eight-camera install."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 0.06}
                className="rounded-[var(--radius-lg)] border border-line bg-white p-6"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg text-ink">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Our values" title="What we stand for" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {values.map((value) => (
                  <li key={value} className="flex items-start gap-3 text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-xl)] bg-navy-900 p-8 text-white md:p-10">
              <p className="eyebrow eyebrow-light mb-4">Service area</p>
              <h2 className="text-2xl text-white md:text-3xl">Proudly serving Oshawa and Durham Region</h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {serviceCities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={city.core ? `/service-areas/${city.slug}/` : "/service-areas/"}
                      className="block rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-gold-500 hover:text-gold-500"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}

export default AboutPageContent;
