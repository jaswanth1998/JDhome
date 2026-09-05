import { ImageResponse } from "next/og";
import { theme } from "@/config/theme";

// Pre-rendered at build time into out/og-image.png (static export).
export const dynamic = "force-static";

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px",
          color: "#fff",
          backgroundImage: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "28px",
              backgroundColor: theme.colors.accent.teal,
              fontSize: "56px",
            }}
          >
            JD
          </div>
          <div style={{ marginLeft: "32px", fontSize: "64px" }}>
            {theme.brand.name}
          </div>
        </div>

        <div style={{ fontSize: "34px", opacity: 0.9 }}>{theme.brand.tagline}</div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "32px" }}>{theme.contact.phone.display}</div>
          <div style={{ marginTop: "12px", fontSize: "26px", opacity: 0.85 }}>
            Oshawa · Durham Region · Locksmith · Car Lockout · Garage Doors
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
