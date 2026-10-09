import { theme } from "@/config/theme";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

// Pre-rendered at build time into out/blog/rss.xml (static export).
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}/`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category.name)}</category>
      <pubDate>${new Date(`${post.published}T12:00:00Z`).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${theme.brand.name} Guides`)}</title>
    <link>${absoluteUrl("/blog/")}</link>
    <atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>${escapeXml("Garage door, security camera, lock, and lockout guides for Oshawa and Durham Region.")}</description>
    <language>en-ca</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
