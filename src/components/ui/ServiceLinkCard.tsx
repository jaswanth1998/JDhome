import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteImageKey } from "@/config/images";
import { assertInternalHref } from "@/lib/seo";
import { Photo } from "./Photo";
import { ServiceIcon } from "./ServiceIcon";

/**
 * Photo card linking to a service or sub-service page. The visible title is the
 * anchor text; there is deliberately no generic call-to-action label.
 * Server-only (assertInternalHref reads the blog content on disk): import it by
 * path, never through the `@/components/ui` barrel that client components use.
 */
export function ServiceLinkCard({
  href,
  label,
  blurb,
  icon,
  image,
  badge,
}: {
  href: string;
  label: string;
  blurb: string;
  icon: string;
  image: SiteImageKey;
  badge?: string;
}) {
  assertInternalHref(href);
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
    >
      <div className="relative">
        <Photo
          image={image}
          decorative
          aspect={16 / 10}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 100vw"
          className="aspect-[16/10] rounded-none"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {badge && <span className="badge badge-gold absolute left-4 top-4">{badge}</span>}
      </div>
      <div className="flex flex-1 items-start gap-3 p-6">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
          <ServiceIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <div className="flex-1">
          <h3 className="text-lg text-ink">{label}</h3>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{blurb}</p>
        </div>
        <ArrowUpRight
          className="mt-1 h-5 w-5 flex-shrink-0 text-navy-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export default ServiceLinkCard;
