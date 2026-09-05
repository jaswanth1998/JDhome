import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  /** Use on dark backgrounds such as the gradient hero. */
  light?: boolean;
  className?: string;
}

/**
 * Visible breadcrumb trail (server component). Pair it with a
 * `breadcrumbNode()` JSON-LD entry on the same page.
 */
export function Breadcrumbs({ items, light = false, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-2 text-sm",
          light ? "text-white/70" : "text-[var(--text-muted)]"
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    "font-medium",
                    light ? "text-white" : "text-[var(--text-primary)]"
                  )}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    light ? "hover:text-white" : "hover:text-[var(--accent-teal)]"
                  )}
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="w-4 h-4 opacity-60" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
