import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";

// Square "G" mark on the brand background, shared by icon.js and apple-icon.js
export async function renderBrandIcon(s) {
  const fonts = await loadOgFonts({ sansText: "G" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.16), rgba(10,10,10,0) 60%)",
          color: "#ffffff",
          fontFamily: "Geist",
          fontWeight: 700,
          fontSize: Math.round(s * 0.58),
          letterSpacing: -Math.round(s * 0.02),
        }}
      >
        G
      </div>
    ),
    { width: s, height: s, fonts }
  );
}
