import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon, same split-flap geometry as the favicon. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#FAF7F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              width: 112,
              height: 48,
              background: "#FFFFFF",
              border: "4px solid #16130F",
              borderRadius: 10,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 112,
              height: 48,
              background: "#E4572E",
              borderRadius: 10,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
