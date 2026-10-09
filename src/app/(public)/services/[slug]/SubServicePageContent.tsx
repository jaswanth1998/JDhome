import Link from "next/link";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { theme } from "@/config/theme";
import { GARAGE_SUB_SERVICES, HUB_CARD, HUB_SLUG, type GarageSubService } from "@/content/garageServices";
import { coreCities } from "@/lib/seo";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { getPost, type BlogPost } from "@/lib/blog";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading } from "@/components/ui";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import { ServiceLinkCard } from "@/components/ui/ServiceLinkCard";
import { FinalCTA, PageHero, Testimonials } from "@/components/sections";
import { GuidesStrip } from "@/components/blog";

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Gold check bullet list used across the garage service pages. */
function CheckList({ items, columns = true }: { items: readonly string[]; columns?: boolean }) {
  return (
    <ul className={columns ? "mt-6 grid gap-3 sm:grid-cols-2" : "mt-5 space-y-3.5"}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-ink-2">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-800">
            <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />
          </span>
          <span>
            <RichText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function resolveGuides(slugs: readonly string[]): BlogPost[] {
  return slugs.map((slug) => {
    const post = getPost(slug);
    if (!post) throw new Error(`Garage sub-service guide "${slug}" does not exist in src/content/blog`);
    return post;
  });
}

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */

interface SubServicePageContentProps {
  sub: GarageSubService;
  /** Must match the BreadcrumbList JSON-LD emitted by page.tsx. */
  breadcrumbs: readonly BreadcrumbItem[];
}

/** Server component for the garage door sub-service pages under /services/. */
export function SubServicePageContent({ sub, breadcrumbs }: SubServicePageContentProps) {
  if (sub.faqs.length !== 5) throw new Error(`"${sub.slug}" must have exactly 5 FAQs`);
  const inquiryService = inquiryServiceForPage(sub.slug);
  const guides = resolveGuides(sub.relatedGuides);
  const otherSubs = GARAGE_SUB_SERVICES.filter((other) => other.slug !== sub.slug);

  return (
    <>
      <PageHero
        title={sub.seo.h1}
        subtitle={sub.subtitle}
        eyebrow="Garage door service"
        image={sub.image}
        service={inquiryService}
        showHours
        breadcrumbs={breadcrumbs}
      />

      {/* Intro, symptoms, what's included */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Overview" title={sub.introHeading} />
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-2">
                {sub.intro.map((paragraph) => (
                  <p key={paragraph}>
                    <RichText text={paragraph} />
                  </p>
                ))}
              </div>

              <h2 className="mt-14 text-balance text-3xl text-ink">{sub.signs.heading}</h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-2">
                {sub.signs.paragraphs.map((paragraph) => (
                  <p key={paragraph}>
                    <RichText text={paragraph} />
                  </p>
                ))}
              </div>
              <CheckList items={sub.signs.items} />
            </div>

            <div className="rounded-[var(--radius-xl)] border border-line bg-paper-warm p-7 md:p-8 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-xl text-ink">What&apos;s included</h2>
              <CheckList items={sub.included} columns={false} />
              <InquiryButton service={inquiryService} variant="navy" fullWidth className="mt-7">
                Request a quote
              </InquiryButton>
              <p className="mt-4 text-center text-sm text-ink-3">
                Or call{" "}
                <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
                  {theme.contact.phone.display}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Long-form sections */}
      <section className="section bg-paper-warm">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-14">
            {sub.sections.map((section) => (
              <article key={section.heading}>
                <h2 className="text-balance text-3xl text-ink">{section.heading}</h2>
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-2">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>
                      <RichText text={paragraph} />
                    </p>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 && <CheckList items={section.bullets} />}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading eyebrow="How it works" title={sub.stepsHeading} />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sub.steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col rounded-[var(--radius-xl)] border border-line bg-paper-cool p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-900">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-paper-cool">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently asked questions"
              subtitle={
                <>
                  Still have a question? Call{" "}
                  <a href={`tel:${theme.contact.phone.tel}`} className="font-semibold text-navy-700 underline">
                    {theme.contact.phone.display}
                  </a>
                  .
                </>
              }
            />
            <div className="space-y-3">
              {sub.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-[var(--radius-lg)] border border-line bg-white open:shadow-[var(--shadow-md)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown
                      className="h-5 w-5 flex-shrink-0 text-navy-600 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-6 leading-relaxed text-ink-2">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading align="center" eyebrow="Service area" title="Areas we serve" subtitle={sub.areasSubtitle} />
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {coreCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/service-areas/${city.slug}/`}
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-navy-600"
                >
                  <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  {city.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/service-areas/"
                className="block rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
              >
                All service areas
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <Testimonials serviceIds={[HUB_SLUG]} tone="cool" />

      {/* Other garage door services */}
      <section className="section bg-paper-warm">
        <div className="container">
          <SectionHeading eyebrow="Garage doors" title="Other garage door services" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <ServiceLinkCard
              href={`/services/${HUB_SLUG}/`}
              label={HUB_CARD.label}
              blurb={HUB_CARD.blurb}
              icon={HUB_CARD.icon}
              image={HUB_CARD.image}
            />
            {otherSubs.map((other) => (
              <ServiceLinkCard
                key={other.slug}
                href={`/services/${other.slug}/`}
                label={other.cardLabel}
                blurb={other.cardBlurb}
                icon={other.icon}
                image={other.image}
              />
            ))}
          </div>
        </div>
      </section>

      <GuidesStrip
        posts={guides}
        title={`Guides on ${sub.shortName.toLowerCase()}`}
        subtitle="Practical advice from our team before you book."
      />

      <FinalCTA title={sub.cta.title} subtitle={sub.cta.subtitle} service={inquiryService} />
    </>
  );
}

export default SubServicePageContent;
