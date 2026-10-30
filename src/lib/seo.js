export const SITE_URL = "https://galangpramudito.web.id";
export const AUTHOR_NAME = "Galang Arrauf Pramudito";
export const SITE_NAME = `Portofolio ${AUTHOR_NAME}`;
export const JOB_TITLE = "Web Developer";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const DEFAULT_TITLE = `${AUTHOR_NAME} — Web Developer Laravel & Next.js`;
export const DEFAULT_DESCRIPTION =
  `Portofolio ${AUTHOR_NAME}, web developer asal Sidoarjo. Laravel, PHP, PostgreSQL, Next.js & integrasi AI. Terbuka untuk internship & freelance.`;

// Served by src/app/opengraph-image.js
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${AUTHOR_NAME} — ${JOB_TITLE}`,
};

export const withSiteName = (title) => `${title} — ${AUTHOR_NAME}`;

/**
 * Page metadata with OpenGraph/Twitter kept in sync.
 * Page-level openGraph replaces the root one entirely (shallow merge),
 * so siteName/locale/images are repeated here on purpose.
 *
 * `title` goes through the root template ("%s — Galang Arrauf Pramudito");
 * pass `absoluteTitle` to bypass it.
 */
export function createPageMetadata({
  title,
  absoluteTitle,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  images = [DEFAULT_OG_IMAGE],
  keywords,
}) {
  const fullTitle = absoluteTitle || withSiteName(title);

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "id_ID",
      type,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((img) => (typeof img === "string" ? img : img.url)),
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
