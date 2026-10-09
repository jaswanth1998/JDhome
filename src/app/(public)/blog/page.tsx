import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/blog";
import { JsonLd } from "@/components/seo";
import { FinalCTA, PageHero } from "@/components/sections";
import { BLOG_CATEGORIES, getAllPosts, getPostsByCategory } from "@/lib/blog";
import { breadcrumbNode, collectionPageNode, withGraph } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Garage Door & Security Camera Guides | JD Home";
const DESCRIPTION =
  "Practical guides from an Oshawa team: garage door repair, openers, springs, security cameras, PoE, NVRs, locks, and lockouts across Durham Region.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blog/",
  alternateTypes: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "JD Home Services Guides" }] },
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={withGraph([
          collectionPageNode("/blog/", TITLE, DESCRIPTION, posts),
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog/" },
          ]),
        ])}
      />
      <PageHero
        eyebrow="Guides & advice"
        title="Garage door and home security guides"
        subtitle="Straight answers from a local Durham Region team. Learn what's going on with your garage door, how modern camera systems work, and when it's time to call a pro."
        image="garageInterior"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/blog/" },
        ]}
      />

      <section className="section bg-paper-warm">
        <div className="container">
          <nav aria-label="Guide categories" className="mb-10 flex flex-wrap gap-2">
            <span className="rounded-full bg-navy-800 px-4 py-2 text-sm font-semibold text-white">
              All guides ({posts.length})
            </span>
            {BLOG_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/category/${category.slug}/`}
                className="rounded-full border border-line-strong bg-white px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-navy-600 hover:text-navy-800"
              >
                {category.name} ({getPostsByCategory(category.slug).length})
              </Link>
            ))}
          </nav>

          <h2 className="sr-only">All guides</h2>
          {featured && <ArticleCard post={featured} featured />}

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        title="Rather have someone take a look?"
        subtitle="Guides are great, but some jobs need a technician. Tell us what's going on and we'll get back to you with clear options."
      />
    </>
  );
}
