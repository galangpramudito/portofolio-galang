import { createClient } from "@supabase/supabase-js";
import { normalizeProjectType, getProjectSlug } from "@/lib/project-utils";
import { createPageMetadata, breadcrumbJsonLd, WEBSITE_ID } from "@/lib/seo";
import ProjectsClient from "./ProjectsClient";

export const metadata = createPageMetadata({
  title: "Portofolio Project",
  description:
    "Katalog lengkap project buatan Galang Arrauf Pramudito — aplikasi web, integrasi AI, desain UI/UX, dan kreasi video. Filter berdasarkan kategori.",
  path: "/projects",
  keywords: [
    "portofolio project",
    "project Galang Arrauf",
    "web development project",
    "Laravel project",
    "Next.js project",
    "aplikasi web",
  ],
});

export const revalidate = 3600; // 🚀 PERF: Revalidate 1 jam (ISR) agar tidak memberatkan server

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://galangpramudito.web.id/projects#webpage",
      url: "https://galangpramudito.web.id/projects",
      name: "Portofolio Project — Galang Arrauf Pramudito",
      description:
        "Katalog lengkap project buatan Galang Arrauf Pramudito — aplikasi web, integrasi AI, desain UI/UX, dan kreasi video.",
      isPartOf: { "@id": WEBSITE_ID },
      breadcrumb: breadcrumbJsonLd([
        { name: "Beranda", path: "/" },
        { name: "Portofolio Project", path: "/projects" },
      ]),
    },
  ],
};

async function getProjects() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, project_types(id, name, slug)")
    .neq("status", "private")
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (!projectsData) return [];

  return projectsData.map((p) => {
    const projectType = normalizeProjectType(
      p.project_types?.slug || p.project_type || p.type
    );
    const slug = getProjectSlug(p);

    return {
      id: p.id,
      slug,
      title: p.title,
      description: p.description,
      project_type: projectType,
      tags: (p.tags || []).filter(
        (t) => !["web", "bot", "android"].includes(t.toLowerCase())
      ),
      thumbnail_url: p.thumbnail_url,
      status: p.status,
      github_url: p.github_url,
      demo_url: p.demo_url,
      play_store_url: p.play_store_url,
      apk_url: p.apk_url,
      video_url: p.video_url,
      featured: p.featured,
    };
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectsClient initialProjects={projects} />
    </>
  );
}
