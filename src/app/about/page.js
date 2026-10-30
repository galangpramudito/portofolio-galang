import { createClient } from "@supabase/supabase-js";
import AboutClient from "./AboutClient";
import {
  createPageMetadata,
  SITE_URL,
  SITE_NAME,
  AUTHOR_NAME,
  JOB_TITLE,
  PERSON_ID,
  WEBSITE_ID,
  breadcrumbJsonLd,
} from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Tentang Saya",
  description:
    "Profil, perjalanan, latar belakang pendidikan di SMKN 2 Buduran & PENS, serta pengalaman kerja/magang di Disnaker Prov Jatim oleh Galang Arrauf Pramudito.",
  path: "/about",
  type: "profile",
  keywords: [
    "Galang Arrauf Pramudito",
    "tentang Galang",
    "web developer Sidoarjo",
    "D3 Teknik Informatika PENS",
    "SMKN 2 Buduran Sidoarjo",
    "Dinas Tenaga Kerja Jawa Timur",
    "Laravel developer",
    "Next.js developer",
  ],
});

// Revalidate every 60 seconds — ISR for fresh data
export const revalidate = 60;

async function getTimelineData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key);

    // Fetch timeline entries and images concurrently for 100% reliable data merging
    const [timelineRes, imagesRes] = await Promise.all([
      supabase
        .from("timeline")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("timeline_images")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (timelineRes.error) {
      console.warn("Could not fetch timeline data from Supabase:", timelineRes.error.message);
      return [];
    }

    const timelineItems = timelineRes.data || [];
    const allImages = imagesRes.data || [];

    // Map and link related images to each timeline item by timeline_id
    return timelineItems.map((item) => {
      const itemImages = allImages
        .filter((img) => String(img.timeline_id) === String(item.id))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      return {
        ...item,
        timeline_images: itemImages,
      };
    });
  } catch (err) {
    console.error("Error in getTimelineData:", err);
    return [];
  }
}

async function getProfileData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .single();

    return data || null;
  } catch (err) {
    return null;
  }
}

export default async function AboutPage() {
  const [timeline, profile] = await Promise.all([
    getTimelineData(),
    getProfileData(),
  ]);

  const fullName = profile?.full_name || "Galang Arrauf Pramudito";
  const bio = profile?.bio || "Web Developer dari Sidoarjo yang berfokus pada arsitektur backend tangguh, pengelolaan database efisien, dan integrasi Artificial Intelligence.";

  // Schema.org JSON-LD for rich Google Search indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/about#webpage`,
        url: `${SITE_URL}/about`,
        name: `Tentang Saya — ${fullName}`,
        description: bio,
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Tentang Saya", path: "/about" },
        ]),
        mainEntity: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: fullName,
          alternateName: AUTHOR_NAME,
          jobTitle: `${JOB_TITLE} & Mahasiswa Teknik Informatika PENS`,
          description: bio,
          image: `${SITE_URL}/image/gambar%20galang%202.jpg`,
          url: SITE_URL,
          sameAs: [
            "https://www.linkedin.com/in/galang-pramudito/",
            "https://github.com/galangg22",
          ],
          alumniOf: [
            {
              "@type": "CollegeOrUniversity",
              name: "Politeknik Elektronika Negeri Surabaya (PENS)",
            },
            {
              "@type": "HighSchool",
              name: "SMKN 2 Buduran Sidoarjo",
            },
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
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient initialTimeline={timeline} initialProfile={profile} />
    </>
  );
}
