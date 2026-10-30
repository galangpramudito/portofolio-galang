import { createClient } from "@supabase/supabase-js";
import CertificatesClient from "./CertificatesClient";
import { createPageMetadata, breadcrumbJsonLd, WEBSITE_ID } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sertifikat & Pencapaian",
  description:
    "Koleksi sertifikat keahlian, pelatihan teknologi, dan pencapaian kompetisi yang diraih oleh Galang Arrauf Pramudito.",
  path: "/certificates",
  keywords: [
    "sertifikat Galang Arrauf",
    "sertifikat web developer",
    "pelatihan IT",
    "kompetisi software engineering",
  ],
});

// Revalidate every 1 hour — ISR for SEO with fresh data
export const revalidate = 3600;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://galangpramudito.web.id/certificates#webpage",
      url: "https://galangpramudito.web.id/certificates",
      name: "Sertifikat & Pencapaian — Galang Arrauf Pramudito",
      description:
        "Koleksi sertifikat keahlian, pelatihan teknologi, dan pencapaian kompetisi yang diraih oleh Galang Arrauf Pramudito.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: breadcrumbJsonLd([
        { name: "Beranda", path: "/" },
        { name: "Sertifikat & Pencapaian", path: "/certificates" },
      ]),
    },
  ],
};

async function getCertificates() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function CertificatesPage() {
  const certs = await getCertificates();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CertificatesClient certs={certs} />
    </>
  );
}
