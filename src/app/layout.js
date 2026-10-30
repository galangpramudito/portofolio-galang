import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProviderComponent } from "./providers";
import { TopLoader } from "next-top-loader";
import { SmoothScroll } from "./components/SmoothScroll";
import {
  SITE_URL,
  SITE_NAME,
  AUTHOR_NAME,
  JOB_TITLE,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  PERSON_ID,
  WEBSITE_ID,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ✅ Prevent FOIT (Flash of Invisible Text)
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false, // ✅ Serif font tidak critical, lazy load
  adjustFontFallback: true,
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Icons, apple-icon, opengraph-image & manifest come from file conventions in src/app
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${AUTHOR_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Galang Arrauf Pramudito",
    "web developer",
    "web developer Sidoarjo",
    "Laravel",
    "PHP",
    "PostgreSQL",
    "Next.js",
    "integrasi AI",
    "portofolio",
    "internship",
    "freelance",
  ],
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: SITE_NAME,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "Galang",
    statusBarStyle: 'black-translucent',
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: AUTHOR_NAME,
      givenName: "Galang",
      familyName: "Pramudito",
      url: SITE_URL,
      image: `${SITE_URL}/image/gambar%20galang%202.jpg`,
      jobTitle: JOB_TITLE,
      description:
        "Web developer asal Sidoarjo yang berfokus pada Laravel, PHP, PostgreSQL, Next.js, serta integrasi AI & otomasi. Terbuka untuk internship dan freelance.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sidoarjo",
        addressRegion: "Jawa Timur",
        addressCountry: "ID",
      },
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "Politeknik Elektronika Negeri Surabaya (PENS)" },
        { "@type": "HighSchool", name: "SMKN 2 Buduran Sidoarjo" },
      ],
      knowsAbout: [
        "Laravel",
        "PHP",
        "PostgreSQL",
        "Next.js",
        "React",
        "Tailwind CSS",
        "AI Integration",
        "Automation",
        "GitHub Actions",
        "Docker",
      ],
      sameAs: [
        "https://www.linkedin.com/in/galang-pramudito/",
        "https://github.com/galangg22",
      ],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "id-ID",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Remixicon Icon Library */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.1.0/remixicon.min.css"
          fetchPriority="low"
        />
        {/* ✅ PERF: Preconnect ke Supabase storage untuk mempercepat image loading */}
        <link rel="preconnect" href="https://pnaimynitzvxylloknvp.supabase.co" />
        <link rel="dns-prefetch" href="https://pnaimynitzvxylloknvp.supabase.co" />
        {/* ✅ PERF: Preconnect ke CDN Simple Icons untuk tech stack icons */}
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />

        {/* ✅ SEO: Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />

      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProviderComponent>
          <SmoothScroll>
            <TopLoader color="#4f46e5" showSpinner={false} />
            {children}
          </SmoothScroll>
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
