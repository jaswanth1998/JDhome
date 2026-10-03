import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Photo } from "@/components/ui";
import type { BlogPost } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  post: BlogPost;
  /** Larger horizontal layout for a featured post. */
  featured?: boolean;
  className?: string;
}

export function ArticleCard({ post, featured = false, className }: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className={cn(
        "group flex h-full overflow-hidden rounded-[var(--radius-xl)] border border-line bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        featured ? "flex-col lg:grid lg:grid-cols-[1.2fr_1fr]" : "flex-col",
        className,
      )}
    >
      <Photo
        image={post.image}
        aspect={featured ? 4 / 3 : 16 / 10}
        sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"}
        className={cn("rounded-none", featured ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/10]")}
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className={cn("flex flex-1 flex-col", featured ? "p-7 md:p-10" : "p-6")}>
        <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="text-gold-700">{post.category.name}</span>
          <span className="flex items-center gap-1 normal-case tracking-normal text-ink-3">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.readingMinutes} min read
          </span>
        </div>
        <h3 className={cn("text-balance text-ink", featured ? "text-2xl md:text-3xl" : "text-lg")}>{post.title}</h3>
        <p className={cn("mt-3 flex-1 leading-relaxed text-ink-2", featured ? "text-base" : "text-[0.9375rem]")}>
          {post.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
          Read the guide
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

export default ArticleCard;
