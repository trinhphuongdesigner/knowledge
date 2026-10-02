import { ImageResponse } from "next/og";

export const alt = "Knowledge — Học bằng flashcard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#fdfbf6",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 48,
            background: "#0f7c66",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-6deg)",
          }}
        >
          <svg width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 7v14" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          </svg>
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, color: "#211d18", display: "flex" }}>Knowledge</div>
        <div style={{ fontSize: 40, color: "#5c5447", display: "flex" }}>Ôn tập IT và Tiếng Anh với flashcard</div>
      </div>
    ),
    size,
  );
}
