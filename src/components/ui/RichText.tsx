import Link from "next/link";
import { assertInternalHref } from "@/lib/seo";

const inlineLinkClass = "font-semibold text-navy-700 underline decoration-gold-500/60 underline-offset-2 hover:text-navy-900";

/**
 * Render `[anchor](/path/)` markers in garageServices.ts copy as next/link anchors.
 * Server-only (assertInternalHref reads the blog content on disk): import it by
 * path, never through the `@/components/ui` barrel that client components use.
 */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const [whole, label, href] = match;
    const start = match.index ?? 0;
    assertInternalHref(href);
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <Link key={`${href}-${start}`} href={href} className={inlineLinkClass}>
        {label}
      </Link>
    );
    last = start + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export default RichText;
