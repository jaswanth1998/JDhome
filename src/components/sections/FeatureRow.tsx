import { Check } from "lucide-react";
import type { SiteImageKey } from "@/config/images";
import { Photo, Reveal, ServiceIcon } from "@/components/ui";
import { cn } from "@/lib/utils";

interface FeatureRowProps {
  image: SiteImageKey;
  title: string;
  description: string;
  /** Checklist items (or numbered steps when `numbered` is set). */
  points?: readonly string[];
  numbered?: boolean;
  /** Photo on the right instead of the left (on large screens). */
  reverse?: boolean;
  icon?: string;
  eyebrow?: string;
  badge?: string;
  /** Heading level: rows directly under the page heading use h2. */
  headingAs?: "h2" | "h3";
  id?: string;
  /** Buttons and links under the text. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Photo + text row: the layout used on the /services/ hub, reused on the home page
 * so every block reads the same way (photo, short intro, checklist, clear next step).
 */
export function FeatureRow({
  image,
  title,
  description,
  points = [],
  numbered = false,
  reverse = false,
  icon,
  eyebrow,
  badge,
  headingAs: Heading = "h2",
  id,
  actions,
  className,
}: FeatureRowProps) {
  const List = numbered ? "ol" : "ul";

  return (
    <article id={id} className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16", className)}>
      <Reveal className={cn(reverse && "lg:order-2")}>
        <Photo image={image} aspect={4 / 3} sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3]" />
      </Reveal>
      <Reveal delay={0.08}>
        {(icon || badge || eyebrow) && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                <ServiceIcon name={icon} className="h-5 w-5" />
              </span>
            )}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {badge && <span className="badge badge-gold">{badge}</span>}
          </div>
        )}
        <Heading className="text-balance text-3xl text-ink">{title}</Heading>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-2">{description}</p>
        {points.length > 0 && (
          <List className={cn("mt-6 grid gap-2.5", !numbered && "sm:grid-cols-2")}>
            {points.map((point, i) => (
              <li key={point} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-2">
                {numbered ? (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-900">
                    {i + 1}
                  </span>
                ) : (
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
                )}
                <span className={cn(numbered && "pt-0.5")}>{point}</span>
              </li>
            ))}
          </List>
        )}
        {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
      </Reveal>
    </article>
  );
}

export default FeatureRow;
