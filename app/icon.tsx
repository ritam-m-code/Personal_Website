import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070707",
          color: "#f0b52b",
          borderRadius: "14px",
          border: "2px solid rgba(240, 181, 43, 0.24)",
          fontFamily: "Georgia, serif",
          fontSize: 29,
          fontWeight: 700,
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        RM
      </div>
    ),
    size,
  );
}
