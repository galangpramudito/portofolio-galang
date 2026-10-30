import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { transformProject, getTypeConfig } from "@/lib/project-utils";
import ProjectDetailClient from "./ProjectDetailClient";

export const revalidate = 3600;

async function getProject(id) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);

  const [projectRes, imagesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_types(id, name, slug)")
      .eq("id", id)
      .neq("status", "private")
      .maybeSingle(),
    supabase
      .from("project_images")
      .select("*")
      .eq("project_id", id)
      .order("sort_order"),
  ]);

  if (projectRes.error || !projectRes.data) return null;

  return transformProject(projectRes.data, imagesRes.data);
}

export async function generateMetadata({ params }) {
  const { id, slug } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };

  const typeInfo = getTypeConfig(project.project_type);
  const description = project.description?.slice(0, 160) || `${project.title} — ${typeInfo.label} project by Galang Arrauf Pramudito.`;
  const canonicalPath = `/projects/${slug}/${id}`;

  return {
    title: `${project.title} — Galang Arrauf Pramudito`,
    description,
    keywords: project.tags?.length > 0
      ? [...project.tags, typeInfo.label, 'Galang Arrauf Pramudito', 'portfolio'].join(', ')
      : `${typeInfo.label}, Galang Arrauf Pramudito, portfolio`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: project.title,
      description,
      url: canonicalPath,
      type: "article",
      images: project.image ? [{ url: project.image, width: 1200, height: 630, alt: project.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Galang Arrauf Pramudito`,
      description,
      images: project.image ? [project.image] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { id, slug } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const typeInfo = getTypeConfig(project.project_type);

  // Auto-generated JSON-LD structured data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description || undefined,
    image: project.image || undefined,
    url: `https://galangpramudito.web.id/projects/${slug}/${id}`,
    author: {
      "@type": "Person",
      name: "Galang Arrauf Pramudito",
      url: "https://galangpramudito.web.id",
    },
    genre: typeInfo.label,
    keywords: project.tags?.join(", ") || undefined,
    dateCreated: project.created_at || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient project={project} />
    </>
  );
}
