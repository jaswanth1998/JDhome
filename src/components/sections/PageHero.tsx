import { Phone } from "lucide-react";
import { theme } from "@/config/theme";
import type { SiteImageKey } from "@/config/images";
import { InquiryButton } from "@/components/inquiry";
import { Breadcrumbs, Photo } from "@/components/ui";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import type { InquiryService } from "@/lib/inquiries/schema";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  image?: SiteImageKey;
  badge?: string;
  /** Pre-select a service in the quote dialog. */
  service?: InquiryService;
  /** Hide the quote/call buttons (e.g. on the contact page). */
  hideActions?: boolean;
}

/** Navy page header used by every inner page, with an optional photo on the right. */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  breadcrumbs,
  image,
  badge,
  service,
  hideActions = false,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      {image && (
        <>
          <Photo
            image={image}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="absolute inset-y-0 right-0 -z-10 w-full rounded-none lg:w-[55%]"
          />
          <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#06142A_0%,#06142A_45%,rgba(6,20,42,0.55)_75%,rgba(6,20,42,0.25)_100%)] max-lg:bg-[rgba(6,20,42,0.86)]"
            aria-hidden="true"
          />
        </>
      )}
      <div className="container py-14 md:py-20">
        {breadcrumbs && <Breadcrumbs light className="mb-8" items={breadcrumbs} />}
        <div className="max-w-2xl">
          {badge && <span className="badge badge-gold mb-5">{badge}</span>}
          {eyebrow && !badge && <p className="eyebrow eyebrow-light mb-5">{eyebrow}</p>}
          <h1 className="text-balance text-4xl leading-[1.08] text-white md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 text-pretty text-lg leading-relaxed text-white/80">{subtitle}</p>}
          {!hideActions && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InquiryButton service={service} size="lg">
                Get a free quote
              </InquiryButton>
              <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-ghost-light btn-lg">
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                {theme.contact.phone.display}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PageHero;
