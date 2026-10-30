import { ImageResponse } from "next/og";
import { AUTHOR_NAME, JOB_TITLE } from "@/lib/seo";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = `${AUTHOR_NAME} — ${JOB_TITLE} Laravel & Next.js`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STACK = ["Laravel", "PHP", "PostgreSQL", "Next.js", "AI Integration"];
const FIRST_NAME = "Galang";
const REST_NAME = "Arrauf Pramudito";
const ROLE = `${JOB_TITLE} · Laravel & Next.js`;
const DOMAIN = "galangpramudito.web.id";
const STATUS = "Terbuka untuk internship & freelance";
const LOCATION = "Sidoarjo, Indonesia";

export default async function OpengraphImage() {
  const fonts = await loadOgFonts({
    sansText: `G${FIRST_NAME}${ROLE}${DOMAIN}${STATUS}${LOCATION}${STACK.join("")}`,
    serifText: REST_NAME,
  });
  const hasSerif = fonts.some((f) => f.name === "Instrument Serif");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 88% 8%, rgba(255,255,255,0.12), rgba(10,10,10,0) 45%)",
          color: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                background: "#ffffff",
                color: "#0a0a0a",
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              G
            </div>
            <div style={{ fontSize: 26, color: "#a3a3a3" }}>{DOMAIN}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 22,
              color: "#d4d4d4",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#22c55e" }} />
            {STATUS}
          </div>
        </div>

        {/* Name + role */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 92, letterSpacing: -3, lineHeight: 1.05 }}>
            <span style={{ fontWeight: 700 }}>{FIRST_NAME}</span>
            <span
              style={{
                marginLeft: 24,
                fontFamily: hasSerif ? "Instrument Serif" : "Geist",
                fontStyle: hasSerif ? "italic" : "normal",
                fontWeight: 400,
                letterSpacing: hasSerif ? -1 : -3,
              }}
            >
              {REST_NAME}
            </span>
          </div>
          <div style={{ marginTop: 20, fontSize: 38, color: "#a3a3a3" }}>{ROLE}</div>
        </div>

        {/* Stack + location */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {STACK.map((tech) => (
              <div
                key={tech}
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 22,
                  color: "#e5e5e5",
                }}
              >
                {tech}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 22, color: "#737373" }}>{LOCATION}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
