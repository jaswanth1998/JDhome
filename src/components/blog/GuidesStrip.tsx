import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui";
import type { BlogPost } from "@/lib/blog";
import { ArticleCard } from "./ArticleCard";

interface GuidesStripProps {
  posts: readonly BlogPost[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/** Three guide cards with a link to the full guides index; used on home, service, and city pages. */
export function GuidesStrip({
  posts,
  eyebrow = "Guides & advice",
  title = "Helpful guides from our team",
  subtitle,
  className = "section bg-white",
}: GuidesStripProps) {
  if (!posts.length) return null;
  return (
    <section className={className}>
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <Link href="/blog/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900">
            All guides
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GuidesStrip;
