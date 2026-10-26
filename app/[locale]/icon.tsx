import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon drawn from the split-flap mark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#E4572E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              width: 22,
              height: 9,
              background: "#FAF7F2",
              borderRadius: 2,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 22,
              height: 9,
              background: "#1A120E",
              borderRadius: 2,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
