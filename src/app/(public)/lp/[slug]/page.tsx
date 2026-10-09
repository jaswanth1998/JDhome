import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ChevronDown, MapPin, Phone } from "lucide-react";
import { theme, type ServiceCity, type ServiceFaq } from "@/config/theme";
import { InquiryForm } from "@/components/inquiry";
import { FinalCTA, Testimonials } from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import { buildMetadata, getService } from "@/lib/seo";
import { LANDING_PAGES, getLandingPage } from "../landingPages";

type LandingPageProps = {
  params: Promise<{ slug: string }>;
};

// Static export: every ad landing page is pre-rendered from LANDING_PAGES.
export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/lp/${slug}/`,
    noIndex: true,
  });
}

const cities: readonly ServiceCity[] = theme.serviceCities;
const durhamCities = cities.filter((city) => city.region === "Durham Region").map((city) => city.name);

/** Google Ads landing page: one service, the quote form open on it, and a call button. */
export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  const service = page && getService(page.serviceId);
  if (!page || !service) notFound();
  const faqs: readonly ServiceFaq[] = service.faqs;

  return (
    <>
      {/* Hero: pitch + call on the left, the quote form on the right (below on phones) */}
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="container grid gap-10 py-10 md:py-16 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
          <div>
            <p className="eyebrow eyebrow-light mb-4">{page.eyebrow}</p>
            <h1 className="text-balance text-4xl leading-[1.08] text-white md:text-5xl">{page.h1}</h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-white/80">{page.intro}</p>
            <ul className="mt-6 space-y-3">
              {page.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-500">
                    <Check className="h-3 w-3 text-navy-900" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-primary btn-lg mt-8 w-full sm:w-auto">
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              Call {theme.contact.phone.display}
            </a>
          </div>

          <div
            id="quote"
            className="rounded-[var(--radius-xl)] bg-white p-6 text-ink shadow-[var(--shadow-xl)] md:p-8"
          >
            <InquiryForm defaultService={page.inquiryService} />
          </div>
        </div>
      </section>

      {/* What we fix / what you get */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading align="center" eyebrow={service.shortName} title={page.listTitle} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.list.map((item) => (
              <div key={item.title} className="card p-6">
                <h3 className="text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-ink-2">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Durham service area */}
      <section className="bg-paper-cool py-12">
        <div className="container text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl text-ink">
            <MapPin className="h-6 w-6 text-gold-600" aria-hidden="true" />
            Local to Durham Region
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-2">
            Based in Oshawa, serving {durhamCities.join(", ")} and nearby communities.
          </p>
        </div>
      </section>

      <Testimonials />

      {/* FAQs */}
      <section className="section bg-paper-warm">
        <div className="container max-w-3xl">
          <SectionHeading align="center" eyebrow="Questions" title="Before you call" />
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group card p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 flex-shrink-0 text-ink-3 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 leading-relaxed text-ink-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        title="Get your free quote today"
        subtitle={`Call ${theme.contact.phone.display} during business hours, or send the form and we'll get back to you.`}
        service={page.inquiryService}
      />
    </>
  );
}
