import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog";
import { JsonLd } from "@/components/seo";
import { FinalCTA, PageHero } from "@/components/sections";
import { BLOG_CATEGORIES, getAllPosts, getCategory, getPostsByCategory } from "@/lib/blog";
import { breadcrumbNode, collectionPageNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.slug }));
}

function pageTitle(name: string) {
  return `${name} Guides | Oshawa & Durham | JD Home`;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    title: pageTitle(category.name),
    description: category.description,
    path: `/blog/category/${category.slug}/`,
  });
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(category.slug);
  const path = `/blog/category/${category.slug}/`;

  return (
    <>
      <JsonLd
        data={withGraph([
          collectionPageNode(path, pageTitle(category.name), category.description, posts),
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog/" },
            { name: category.name, path },
          ]),
        ])}
      />
      <PageHero
        eyebrow="Guides & advice"
        title={`${category.name} guides`}
        subtitle={category.description}
        image={category.image}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/blog/" },
          { name: category.name, href: path },
        ]}
      />

      <section className="section bg-paper-warm">
        <div className="container">
          <nav aria-label="Guide categories" className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/blog/"
              className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-navy-600 hover:text-navy-800"
            >
              All guides ({getAllPosts().length})
            </Link>
            {BLOG_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}/`}
                aria-current={c.slug === category.slug ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  c.slug === category.slug
                    ? "bg-navy-800 font-semibold text-white"
                    : "border border-line-strong bg-white font-medium text-ink-2 hover:border-navy-600 hover:text-navy-800",
                )}
              >
                {c.name} ({getPostsByCategory(c.slug).length})
              </Link>
            ))}
          </nav>
          <h2 className="sr-only">{category.name} guides</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
