import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteImageKey } from "@/config/images";
import { cn } from "@/lib/utils";
import { Photo } from "./Photo";
import { ServiceIcon } from "./ServiceIcon";

interface ServiceCardProps {
  id: string;
  name: string;
  shortDescription: string;
  icon: string;
  image: SiteImageKey;
  badge?: string;
  className?: string;
}

/** Photo card linking to a service page. */
export function ServiceCard({ id, name, shortDescription, icon, image, badge, className }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${id}/`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <div className="relative">
        <Photo
          image={image}
          aspect={16 / 10}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
          className="aspect-[16/10] rounded-none"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {badge && <span className="badge badge-gold absolute left-4 top-4">{badge}</span>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
            <ServiceIcon name={icon} className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-lg text-ink">{name}</h3>
        </div>
        <p className="flex-1 text-[0.9375rem] leading-relaxed text-ink-2">{shortDescription}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
          Learn more
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

export default ServiceCard;
