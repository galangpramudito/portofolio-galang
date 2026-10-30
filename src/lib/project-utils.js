export function normalizeProjectType(type) {
  if (!type) return "website";
  const t = type.toLowerCase();
  if (t === "web") return "website";
  if (t === "bot" || t === "android") return "aplikasi";
  if (t === "design") return "desain";
  if (t === "video" || t === "video editing") return "video-editing";
  return t;
}

export function slugify(text) {
  if (!text) return "project";
  const slug = String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
  return slug || "project";
}

// Stored slug wins; otherwise derive deterministically so URLs stay stable across renders
export function getProjectSlug(project) {
  return project?.slug || slugify(project?.title);
}

export function getProjectPath(project) {
  return `/projects/${getProjectSlug(project)}/${project.id}`;
}

// Unique variant for inserts: suffix only when the base slug is already taken
export function uniqueSlug(title, takenSlugs = []) {
  const base = slugify(title);
  if (!takenSlugs.includes(base)) return base;
  let n = 2;
  while (takenSlugs.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export const TYPE_CONFIG = {
  website: { label: "Website", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", gradient: "from-stone-900 via-neutral-900 to-zinc-950" },
  aplikasi: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", gradient: "from-zinc-900 via-zinc-800 to-black" },
  desain: { label: "Desain", icon: "ri-palette-line", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", gradient: "from-amber-950 via-neutral-900 to-amber-950/40" },
  "video-editing": { label: "Video Editing", icon: "ri-video-line", color: "bg-rose-500/20 text-rose-300 border-rose-500/30", gradient: "from-red-950 via-neutral-900 to-red-950/40" },
  other: { label: "Lainnya", icon: "ri-code-s-slash-line", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", gradient: "from-slate-900 via-gray-900 to-black" },
};

export function getTypeConfig(type) {
  const t = normalizeProjectType(type);
  return TYPE_CONFIG[t] || {
    label: type?.charAt(0).toUpperCase() + type?.slice(1) || "Lainnya",
    icon: "ri-code-box-line",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    gradient: "from-cyan-950 via-neutral-900 to-cyan-950/40"
  };
}

export const STATUS_BADGE = {
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  wip: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export function getEmbedUrl(url) {
  if (!url) return "";
  try {
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const videoId = url.includes("youtu.be/")
        ? url.split("youtu.be/")[1].split("?")[0]
        : new URLSearchParams(new URL(url).search).get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    }
    if (url.includes("drive.google.com/file/d/")) {
      return url.replace(/\/view.*$/, "/preview");
    }
    return url;
  } catch {
    return url;
  }
}

export function transformProject(p, imagesData = null) {
  const projectType = normalizeProjectType(
    p.project_types?.slug || p.project_type || p.type || "website"
  );

  return {
    id: p.id,
    slug: getProjectSlug(p),
    title: p.title,
    description: p.description,
    image: p.thumbnail_url || null,
    gradient: p.thumbnail_url ? null : getTypeConfig(projectType).gradient,
    icon: p.thumbnail_url ? null : getTypeConfig(projectType).icon,
    tags: (p.tags || []).filter(
      (t) => !["web", "bot", "android"].includes(t.toLowerCase())
    ),
    project_type: projectType,
    category: p.category || "",
    github_url: p.github_url || null,
    demo_url: p.demo_url || null,
    play_store_url: p.play_store_url || null,
    apk_url: p.apk_url || null,
    video_url: p.video_url || null,
    platform: p.platform || null,
    featured: p.featured || false,
    status: p.status || "completed",
    images: imagesData
      ? imagesData.filter((img) => img.project_id === p.id)
      : [],
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}
