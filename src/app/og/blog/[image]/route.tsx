import { ImageResponse } from "next/og";
import { theme } from "@/config/theme";
import { getAllPosts, getPost } from "@/lib/blog";

// Pre-rendered at build time into out/og/blog/<slug>.png (static export).
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ image: `${post.slug}.png` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ image: string }> }) {
  const { image } = await params;
  const post = getPost(image.replace(/\.png$/, ""));
  if (!post) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
          color: "#fff",
          backgroundColor: theme.colors.primary.dark,
          backgroundImage: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 70%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: theme.colors.accent.gold,
              color: theme.colors.primary.dark,
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {post.category.name}
          </div>
          <div style={{ display: "flex", fontSize: "26px", opacity: 0.8 }}>{post.readingMinutes} min read</div>
        </div>

        <div style={{ display: "flex", fontSize: post.title.length > 60 ? "58px" : "68px", fontWeight: 700, lineHeight: 1.1 }}>
          {post.title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "28px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: "14px", height: "14px", borderRadius: "999px", backgroundColor: theme.colors.accent.gold, marginRight: "16px" }} />
            {theme.brand.name} · Oshawa &amp; Durham Region
          </div>
          <div style={{ display: "flex", opacity: 0.8 }}>jdhomeservices.ca</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
