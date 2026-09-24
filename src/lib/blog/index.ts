import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { siteImages, type SiteImageKey } from "@/config/images";
import { theme } from "@/config/theme";

/**
 * Guides (blog) content.
 *
 * Each article is a Markdown file in `src/content/blog/<slug>.md` with a small
 * frontmatter block (see README in that folder). Files are read at build time
 * only; this module must never be imported from a client component.
 */

export const BLOG_CATEGORIES = [
  {
    slug: "garage-doors",
    image: "greyGarage",
    name: "Garage Doors",
    description:
      "Practical garage door advice for Durham Region homeowners: springs, openers, noises, maintenance, and when to repair or replace.",
  },
  {
    slug: "security-cameras",
    image: "aiCamera",
    name: "Security Cameras",
    description:
      "Plain-language guides to CCTV and smart security cameras: AI detection, PoE wiring, NVR recording, placement, and privacy.",
  },
  {
    slug: "locks-and-lockouts",
    image: "keyInDoor",
    name: "Locks & Lockouts",
    description:
      "Lock changes, rekeying, home security basics, and what to do when you're locked out of your car in Durham Region.",
  },
] as const satisfies readonly { slug: string; image: SiteImageKey; name: string; description: string }[];

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type TocItem = { id: string; text: string };
export type BlogFaq = { question: string; answer: string };

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: BlogCategory;
  image: SiteImageKey;
  service?: string;
  published: string;
  updated: string;
  keywords: string[];
  body: string;
  toc: TocItem[];
  faqs: BlogFaq[];
  wordCount: number;
  readingMinutes: number;
};

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");
export const FAQ_HEADING = "Frequently asked questions";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip Markdown syntax for word counts and plain-text answers. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontmatter(raw: string, file: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { data, body: match[2].trim() };
}

function required(data: Record<string, string>, key: string, file: string): string {
  const value = data[key];
  if (!value) throw new Error(`${file}: frontmatter "${key}" is required`);
  return value;
}

function extractFaqs(body: string): BlogFaq[] {
  const start = body.indexOf(`## ${FAQ_HEADING}`);
  if (start === -1) return [];
  const section = body.slice(start).split("\n").slice(1).join("\n");
  const end = section.search(/^## /m);
  const faqBlock = end === -1 ? section : section.slice(0, end);
  return faqBlock
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [question, ...rest] = chunk.split("\n");
      return { question: question.trim(), answer: plainText(rest.join("\n")) };
    })
    .filter((faq) => faq.question && faq.answer);
}

function loadPost(file: string): BlogPost {
  const raw = readFileSync(path.join(CONTENT_DIR, file), "utf8").replace(/\r\n/g, "\n");
  const { data, body } = parseFrontmatter(raw, file);
  const slug = file.replace(/\.md$/, "");

  const categorySlug = required(data, "category", file);
  const category = BLOG_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) throw new Error(`${file}: unknown category "${categorySlug}"`);

  const image = required(data, "image", file) as SiteImageKey;
  if (!(image in siteImages)) throw new Error(`${file}: unknown image "${image}"`);

  const service = data.service || undefined;
  if (service && !theme.services.categories.some((s) => s.id === service)) {
    throw new Error(`${file}: unknown service "${service}"`);
  }

  const toc = [...body.matchAll(/^## (.+)$/gm)].map((m) => ({ id: slugify(m[1]), text: m[1].trim() }));
  const wordCount = plainText(body).split(" ").filter(Boolean).length;
  const published = required(data, "published", file);

  return {
    slug,
    title: required(data, "title", file),
    seoTitle: data.seoTitle || required(data, "title", file),
    description: required(data, "description", file),
    category,
    image,
    service,
    published,
    updated: data.updated || published,
    keywords: (data.keywords ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    body,
    toc,
    faqs: extractFaqs(body),
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
  };
}

let cache: BlogPost[] | null = null;

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  if (cache) return cache;
  cache = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(loadPost)
    .sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
  return cache;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getCategory(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function getPostsByCategory(slug: string): BlogPost[] {
  return getAllPosts().filter((post) => post.category.slug === slug);
}

export function getPostsForService(serviceId: string, limit = 3): BlogPost[] {
  return getAllPosts()
    .filter((post) => post.service === serviceId)
    .slice(0, limit);
}

/** Same service first, then same category, excluding the post itself. */
export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const score = (p: BlogPost) => (p.service && p.service === post.service ? 2 : 0) + (p.category.slug === post.category.slug ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
