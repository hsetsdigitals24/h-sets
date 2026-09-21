import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Branded 1200×630 social card, generated per page.
 *
 * `buildMetadata` points every page's og:image here with its own title, so
 * shares produce a real preview instead of the blank card the Sept 2026 audit
 * found (twitter:card was set to summary_large_image with no og:image at all).
 * Generating the card beats shipping one static PNG: no page can drift out of
 * sync with its own artwork, and there is nothing to re-export when copy
 * changes.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || site.name).slice(0, 110);
  const eyebrow = searchParams.get("eyebrow") || site.legalName;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0b1020 0%, #002cd5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 18,
              height: 48,
              borderRadius: 999,
              background: "#63f2c8",
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 24,
              color: "#63f2c8",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 62 : 76,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
          <span>Ilorin · Lagos · Nigeria</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
