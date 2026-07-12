import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KnowledgeOS — Enterprise AI Knowledge Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#020817",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#6d28d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            K
          </div>
          <span style={{ color: "#fff", fontSize: 24, fontWeight: 600 }}>KnowledgeOS</span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, color: "#fff", maxWidth: 800 }}>
          Enterprise AI
          <br />
          <span style={{ color: "#a78bfa" }}>Knowledge Platform</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.45)", marginTop: 24, maxWidth: 680 }}>
          Upload your docs. Ask anything. Get cited answers — backed by the AI you choose.
        </div>
      </div>
    ),
    { ...size }
  );
}
