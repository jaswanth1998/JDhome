import Link from "next/link";
import { Check, ChevronDown, MapPin, Phone } from "lucide-react";
import { theme, type ServiceFaq } from "@/config/theme";
import { GARAGE_SUB_SERVICES, HUB_FEATURE_LINKS, HUB_SLUG } from "@/content/garageServices";
import { assertInternalHref, coreCities, getService, getServiceSections, type ServiceCategory } from "@/lib/seo";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { InquiryButton } from "@/components/inquiry";
import { SectionHeading } from "@/components/ui";
import { ServiceLinkCard } from "@/components/ui/ServiceLinkCard";
import { CameraSystemDiagram, FinalCTA, GarageProblems, PageHero, Testimonials } from "@/components/sections";
import { GuidesStrip } from "@/components/blog";
import { getAllPosts, getPostsForService } from "@/lib/blog";

type LinkRule = { href: string; phrases: readonly string[] };

/**
 * Phrases in theme.ts section copy that become in-body links (first match per
 * page only, never to the page itself). Order matters: earlier rules win when
 * two phrases start at the same place. Anchor discipline (contract C6): link
 * text containing "installation" never points at the garage hub.
 */
function sectionLinkRules(): LinkRule[] {
  return [
    {
      href: "/services/garage-door-spring-repair/",
      phrases: ["garage door spring and cable repair", "spring and cable repair"],
    },
    {
      href: "/services/garage-door-opener-installation/",
      phrases: ["garage door opener installation and repair", "opener installation and repair"],
    },
    { href: "/services/garage-door-installation/", phrases: ["new garage door installation"] },
    { href: "/services/security-camera-installation/", phrases: ["security camera installation"] },
    { href: "/services/locksmith/", phrases: ["lock changes and rekeying"] },
    { href: "/services/car-lockout/", phrases: ["24/7 car lockout"] },
    { href: "/blog/repair-or-replace-garage-door/", phrases: ["whether to repair or replace a garage door"] },
    ...getAllPosts().map((post) => ({ href: `/blog/${post.slug}/`, phrases: [post.title] })),
  ];
}

const isWordChar = (ch: string | undefined) => !!ch && /[A-Za-z0-9]/.test(ch);

/** Find a whole-phrase, case-insensitive match of `phrase` in `text`. */
function findPhrase(text: string, phrase: string): number {
  const haystack = text.toLowerCase();
  const needle = phrase.toLowerCase();
  let from = 0;
  while (from <= haystack.length) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return -1;
    if (!isWordChar(text[at - 1]) && !isWordChar(text[at + needle.length])) return at;
    from = at + 1;
  }
  return -1;
}

const inBodyLinkClass = "font-semibold text-navy-700 underline decoration-gold-500/60 underline-offset-2 hover:text-navy-900";

/** Link the first unused phrase occurrences in a plain-text paragraph; `used` is shared across the page. */
function linkify(text: string, rules: readonly LinkRule[], used: Set<string>): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  for (;;) {
    let best: { at: number; length: number; href: string } | null = null;
    for (const rule of rules) {
      if (used.has(rule.href)) continue;
      for (const phrase of rule.phrases) {
        const at = findPhrase(rest, phrase);
        if (at !== -1 && (!best || at < best.at)) best = { at, length: phrase.length, href: rule.href };
        if (at !== -1) break;
      }
    }
    if (!best) break;
    assertInternalHref(best.href);
    used.add(best.href);
    if (best.at > 0) out.push(rest.slice(0, best.at));
    out.push(
      <Link key={best.href} href={best.href} className={inBodyLinkClass}>
        {rest.slice(best.at, best.at + best.length)}
      </Link>
    );
    rest = rest.slice(best.at + best.length);
  }
  if (rest) out.push(rest);
  return out;
}

interface ServicePageContentProps {
  service: ServiceCategory;
}

/** Server component for /services/[slug]/. */
export function ServicePageContent({ service }: ServicePageContentProps) {
  const badge = "badge" in service ? service.badge : undefined;
  const features: readonly string[] = service.features;
  const faqs: readonly ServiceFaq[] = service.faqs;
  const inquiryService = inquiryServiceForPage(service.id);
  const relatedServices = theme.services.categories.filter((other) => other.id !== service.id);
  const isLockout = service.id === "car-lockout";
  const isGarageHub = service.id === HUB_SLUG;
  const pagePath = `/services/${service.id}/`;
  const sections = getServiceSections(service);
  const linkRules = sectionLinkRules().filter((rule) => rule.href !== pagePath);
  const usedLinks = new Set<string>();

  // Contract C6: the hub's theme name is its link text everywhere (nav, footer,
  // breadcrumbs, related cards), so it must never contain "installation".
  const hubName = getService(HUB_SLUG)?.name;
  if (!hubName || /installation/i.test(hubName)) {
    throw new Error(`Garage hub "${HUB_SLUG}" must exist and its name must not contain "installation" (contract C6)`);
  }

  if (isGarageHub) {
    for (const feature of Object.keys(HUB_FEATURE_LINKS)) {
      if (!features.includes(feature)) {
        throw new Error(`Hub feature "${feature}" (HUB_FEATURE_LINKS) is missing from theme.ts; keep the strings identical`);
      }
    }
  }

  return (
    <>
      <PageHero
        title={service.seo.h1}
        subtitle={service.shortDescription}
        eyebrow={service.tier === "addon" ? "Add-on service" : "Core service"}
        badge={badge ? `${badge} available` : undefined}
        image={service.image}
        service={inquiryService}
        showHours={!isLockout}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services/" },
          { name: service.name, href: `/services/${service.id}/` },
        ]}
      />

      {/* Overview + what's included */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Overview" title="About this service" />
              <p className="mt-6 text-lg leading-relaxed text-ink-2">{service.description}</p>
              {isLockout && (
                <a
                  href={`tel:${theme.contact.phone.tel}`}
                  className="mt-8 flex items-center gap-4 rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">Locked out right now? Call any time.</span>
                    <span className="block text-xl font-bold text-navy-800">{theme.contact.phone.display}</span>
                  </span>
                </a>
              )}
            </div>
            <div className="rounded-[var(--radius-xl)] border border-line bg-paper-warm p-7 md:p-8">
              <h2 className="text-xl text-ink">What&apos;s included</h2>
              <ul className="mt-5 space-y-3.5">
                {features.map((feature) => {
                  const featureHref = isGarageHub ? HUB_FEATURE_LINKS[feature] : undefined;
                  return (
                    <li key={feature} className="flex items-start gap-3 text-ink-2">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-800">
                        <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />
                      </span>
                      {featureHref ? (
                        <Link href={featureHref} className={inBodyLinkClass}>
                          {feature}
                        </Link>
                      ) : (
                        feature
                      )}
                    </li>
                  );
                })}
              </ul>
              <InquiryButton service={inquiryService} variant="navy" fullWidth className="mt-7">
                Request a quote
              </InquiryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Long-form sections from theme.ts */}
      {sections.length > 0 && (
        <section className="section bg-paper-warm">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-14">
              {sections.map((section) => (
                <article key={section.heading}>
                  <h2 className="text-balance text-3xl text-ink">{section.heading}</h2>
                  <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-2">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{linkify(paragraph, linkRules, usedLinks)}</p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-6 space-y-3.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-ink-2">
                          <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-800">
                            <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />
                          </span>
                          <span className="leading-relaxed">{linkify(bullet, linkRules, usedLinks)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Garage hub: the three sub-service pages */}
      {isGarageHub && (
        <section className="section bg-paper-cool">
          <div className="container">
            <SectionHeading
              eyebrow="Specialist services"
              title="Garage door services"
              subtitle="New doors, openers, and springs and cables each have their own page with the details and answers that matter for that job."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {GARAGE_SUB_SERVICES.map((sub) => (
                <ServiceLinkCard
                  key={sub.slug}
                  href={`/services/${sub.slug}/`}
                  label={sub.cardLabel}
                  blurb={sub.cardBlurb}
                  icon={sub.icon}
                  image={sub.image}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {service.id === "security-camera-installation" && <CameraSystemDiagram />}
      {isGarageHub && <GarageProblems />}

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
              {faqs.map((faq) => (
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
          <SectionHeading
            align="center"
            eyebrow="Service area"
            title="Areas we serve"
            subtitle="We offer this service throughout Durham Region and surrounding areas."
          />
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

      <Testimonials serviceIds={[service.id]} tone="cool" />

      {/* Related */}
      <section className="section bg-paper-warm">
        <div className="container">
          <SectionHeading eyebrow="More from JD Home Services" title="Related services" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {relatedServices.map((related) => (
              <ServiceLinkCard
                key={related.id}
                href={`/services/${related.id}/`}
                label={related.name}
                blurb={related.shortDescription}
                icon={related.icon}
                image={related.image}
                badge={"badge" in related ? related.badge : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <GuidesStrip
        posts={getPostsForService(service.id)}
        title={`${service.shortName} guides`}
        subtitle="Practical advice from our team before you book."
      />

      <FinalCTA service={inquiryService} />
    </>
  );
}

export default ServicePageContent;
