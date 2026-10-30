import { createClient } from "@supabase/supabase-js";
import { notFound, permanentRedirect } from "next/navigation";
import { transformProject, getTypeConfig, getProjectSlug, getProjectPath } from "@/lib/project-utils";
import {
  createPageMetadata,
  SITE_URL,
  PERSON_ID,
  WEBSITE_ID,
  DEFAULT_OG_IMAGE,
  breadcrumbJsonLd,
} from "@/lib/seo";
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
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Tidak Ditemukan" };

  const typeInfo = getTypeConfig(project.project_type);
  const combined = `${project.title} — ${typeInfo.label}`;
  const absoluteTitle =
    combined.length <= 42
      ? `${combined} — Galang Arrauf Pramudito`
      : `${project.title} — Galang Arrauf Pramudito`;

  const description =
    project.description?.slice(0, 155) ||
    `Detail project ${project.title} (${typeInfo.label}) oleh Galang Arrauf Pramudito.`;

  const canonicalPath = getProjectPath(project);
  const images = project.image
    ? [{ url: project.image, width: 1200, height: 630, alt: project.title }]
    : [DEFAULT_OG_IMAGE];

  return createPageMetadata({
    absoluteTitle,
    description,
    path: canonicalPath,
    type: "article",
    images,
    keywords:
      project.tags?.length > 0
        ? [...project.tags, typeInfo.label, "Galang Arrauf Pramudito", "portfolio"]
        : [typeInfo.label, "Galang Arrauf Pramudito", "portfolio"],
  });
}

export default async function ProjectDetailPage({ params }) {
  const { id, slug } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  // Canonical slug enforcement: redirect if URL slug does not match project's canonical slug
  const expectedSlug = getProjectSlug(project);
  if (slug !== expectedSlug) {
    permanentRedirect(getProjectPath(project));
  }

  const typeInfo = getTypeConfig(project.project_type);
  const canonicalUrl = `${SITE_URL}${getProjectPath(project)}`;

  // Auto-generated JSON-LD structured data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Portofolio Project", item: `${SITE_URL}/projects` },
          { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
        ],
      },
      {
        "@type": "CreativeWork",
        "@id": `${canonicalUrl}#work`,
        name: project.title,
        headline: project.title,
        description: project.description || undefined,
        image: project.image || undefined,
        url: canonicalUrl,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        genre: typeInfo.label,
        keywords: project.tags?.join(", ") || undefined,
        dateCreated: project.created_at || undefined,
        dateModified: project.updated_at || project.created_at || undefined,
      },
    ],
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
