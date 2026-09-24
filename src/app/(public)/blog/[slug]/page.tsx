import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Phone } from "lucide-react";
import { imageUrl } from "@/config/images";
import { theme } from "@/config/theme";
import { Markdown } from "@/components/blog";
import { GuidesStrip } from "@/components/blog/GuidesStrip";
import { InquiryButton } from "@/components/inquiry";
import { JsonLd } from "@/components/seo";
import { FinalCTA } from "@/components/sections";
import { Breadcrumbs, Photo, ServiceIcon } from "@/components/ui";
import { formatDate, getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";
import { inquiryServiceForPage } from "@/lib/inquiries/schema";
import { blogPostingNode, breadcrumbNode, faqPageNode, withGraph } from "@/lib/jsonld";
import { buildMetadata, getService } from "@/lib/seo";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}/`,
    ogTitle: post.title,
    ogImage: `/og/blog/${post.slug}.png`,
    keywords: post.keywords,
    article: {
      publishedTime: post.published,
      modifiedTime: post.updated,
      section: post.category.name,
      tags: post.keywords,
    },
  });
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const service = post.service ? getService(post.service) : undefined;
  const inquiryService = inquiryServiceForPage(post.service);
  const related = getRelatedPosts(post);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/blog/" },
    { name: post.title, href: `/blog/${post.slug}/` },
  ];

  return (
    <>
      <JsonLd
        data={withGraph([
          blogPostingNode({ ...post, imageUrl: imageUrl(post.image, 1200, 675) }),
          ...(post.faqs.length ? [faqPageNode(post.faqs)] : []),
          breadcrumbNode(crumbs.map((c) => ({ name: c.name, path: c.href }))),
        ])}
      />

      <article>
        {/* Header */}
        <header className="bg-navy-950 pb-28 pt-12 text-white md:pb-40 md:pt-16">
          <div className="container">
            <Breadcrumbs light className="mb-8" items={crumbs} />
            <div className="max-w-3xl">
              <Link
                href={`/blog/category/${post.category.slug}/`}
                className="badge badge-gold mb-5 hover:bg-gold-600"
              >
                {post.category.name}
              </Link>
              <h1 className="text-balance text-4xl leading-[1.1] text-white md:text-5xl">{post.title}</h1>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-white/80">{post.description}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Image
                    src={theme.brand.logo.markLight}
                    alt=""
                    width={403}
                    height={337}
                    className="h-6 w-auto"
                  />
                  By the {theme.brand.name} team
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  {post.updated !== post.published ? "Updated " : ""}
                  <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gold-500" aria-hidden="true" />
                  {post.readingMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
          <Photo
            image={post.image}
            aspect={21 / 9}
            priority
            sizes="(min-width: 1280px) 1176px, 100vw"
            className="-mt-20 aspect-[16/9] shadow-[var(--shadow-xl)] md:-mt-28 md:aspect-[21/9]"
          />
        </div>

        <div className="container py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div className="min-w-0 max-w-[46rem]">
              <Markdown source={post.body} inquiryService={inquiryService} />

              {/* About the author (E-E-A-T) */}
              <div className="mt-14 flex flex-col gap-5 rounded-[var(--radius-xl)] border border-line bg-paper-warm p-6 sm:flex-row sm:items-center">
                <Image
                  src={theme.brand.logo.mark}
                  alt={`${theme.brand.name} logo`}
                  width={403}
                  height={337}
                  className="h-12 w-auto flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-ink">Written by the {theme.brand.name} team</p>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
                    We&apos;re a local Oshawa team that repairs and installs garage doors and security camera systems
                    across Durham Region. These guides answer the questions we hear most on the job.{" "}
                    <Link href="/about/" className="font-semibold text-navy-700 underline underline-offset-2">
                      More about us
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              {post.toc.length > 1 && (
                <nav aria-label="On this page" className="rounded-[var(--radius-lg)] border border-line bg-white p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">On this page</p>
                  <ol className="space-y-2 text-sm">
                    {post.toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`} className="block leading-snug text-ink-2 hover:text-navy-700">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="rounded-[var(--radius-lg)] bg-navy-900 p-6 text-white">
                <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-white">Need a hand?</p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Get a free, no-obligation quote from our Oshawa-based team.
                </p>
                <InquiryButton service={inquiryService} fullWidth className="mt-5">
                  Get a free quote
                </InquiryButton>
                <a
                  href={`tel:${theme.contact.phone.tel}`}
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-white hover:text-gold-500"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {theme.contact.phone.display}
                </a>
              </div>

              {service && (
                <Link
                  href={`/services/${service.id}/`}
                  className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-white p-5 transition-colors hover:border-navy-600"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-navy-800 text-gold-500">
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm">
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Our service</span>
                    <span className="font-semibold text-ink">{service.name}</span>
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 text-navy-700 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </aside>
          </div>
        </div>
      </article>

      <GuidesStrip
        posts={related}
        eyebrow="Keep reading"
        title="Related guides"
        className="section border-t border-line bg-paper-warm"
      />

      <FinalCTA service={inquiryService} />
    </>
  );
}
