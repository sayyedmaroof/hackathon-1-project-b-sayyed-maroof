import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the normal fare struck, the flipped fare in front. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF7F2",
          color: "#16130F",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                width: 36,
                height: 14,
                background: "#FFFFFF",
                border: "2px solid #16130F",
                borderRadius: 4,
              }}
            />
            <div
              style={{ width: 36, height: 14, background: "#E4572E", borderRadius: 4 }}
            />
          </div>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, lineHeight: 0.95, letterSpacing: -2 }}>
            {siteConfig.tagline}
          </div>
          <div style={{ fontSize: 28, color: "#6B645B", maxWidth: 760 }}>
            {siteConfig.descriptor}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
          <div
            style={{
              fontSize: 42,
              color: "#6B645B",
              textDecoration: "line-through",
              fontFamily: "monospace",
            }}
          >
            410 €
          </div>
          <div style={{ fontSize: 64, color: "#0E9F6E", fontFamily: "monospace" }}>
            185 €
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
