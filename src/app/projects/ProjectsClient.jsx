"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getTypeConfig,
  getEmbedUrl,
  normalizeProjectType,
  STATUS_BADGE,
} from "@/lib/project-utils";

import { BackButton } from "@/app/components/BackButton";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";

function GenerateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base;
}

function ProjectsClientContent({ initialProjects }) {
  const [filter, setFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || searchParams.get("category");

  useEffect(() => {
    if (typeParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilter(normalizeProjectType(typeParam));
    }
  }, [typeParam]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedVideo) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [selectedVideo]);

  const projects = initialProjects || [];

  const availableTypes = [
    ...new Set(projects.map((p) => p.project_type || "website")),
  ];

  const filterTabs = [
    { key: "all", label: "Semua Project", icon: "ri-apps-line" },
    ...availableTypes.map((t) => {
      const config = getTypeConfig(t);
      return { key: t, label: config.label, icon: config.icon };
    }),
  ];

  const filtered =
    filter === "all"
      ? projects
      : projects.filter(
        (p) =>
          (p.project_type || "website").toLowerCase() === filter
      );

  return (
    <main className="min-h-[100dvh] bg-bg-dark p-4 sm:p-8 md:p-16 relative overflow-x-hidden">

      <DarkModeToggle />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full" />
        <div className="absolute right-[-20%] bottom-[-10%] w-[60%] h-[40%] bg-primary blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto mb-8 md:mb-16 relative z-10 pt-4 md:pt-0">
        <BackButton href="/" label="Back to Home" />
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-3 md:mb-4 tracking-tight leading-tight text-gray-900 dark:text-white">
          Galang Arrauf Pramudito
        </h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed">
          Katalog lengkap project buatan Galang Arrauf Pramudito — dari aplikasi web, desain UI/UX, hingga kreasi video. Gunakan filter
          di bawah untuk menelusuri kategori.
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex gap-2 md:gap-3 mb-10 md:mb-12 overflow-x-auto pb-4 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filterTabs.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-5 md:px-6 py-2.5 rounded-full border text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${filter === f.key
              ? "bg-accent text-bg-dark border-accent shadow-xl scale-105"
              : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white bg-white/5"
              }`}
          >
            <i className={f.icon} /> {f.label}
            <span className="ml-1 text-[10px] opacity-60">
              ({f.key === "all" ? projects.length : projects.filter((p) => (p.project_type || "website").toLowerCase() === f.key).length})
            </span>
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filtered.map((project, idx) => {
          const typeInfo = getTypeConfig(project.project_type);
          const statusInfo = STATUS_BADGE[project.status] || "";
          const isVideo = ["video-editing", "video"].includes(
            project.project_type?.toLowerCase() || ""
          );
          const detailUrl = `/projects/${project.slug || GenerateSlug(project.title)}/${project.id}`;

          return (
            <div key={project.id} className="group bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col">
              <Link href={detailUrl} className="relative w-full aspect-video bg-black overflow-hidden block">
                {project.thumbnail_url ? (
                  <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    priority={idx < 3}
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center`}
                  >
                    <i className={`${typeInfo.icon} text-5xl text-white/20`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {isVideo && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      if (project.video_url) {
                        setVideoLoading(true);
                        setSelectedVideo(project.video_url);
                      }
                    }}
                  >
                    <div className="p-1 bg-black/40 rounded-full group-hover:bg-accent/90 group-hover:scale-110 transition-all duration-300 border border-white/10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        <i className="ri-play-fill text-white text-lg ml-0.5 group-hover:text-bg-dark transition-colors" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[80%]">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md ${typeInfo.color}`}
                  >
                    <i className={typeInfo.icon} /> {typeInfo.label}
                  </span>
                  {project.status === "wip" && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusInfo}`}
                    >
                      WIP
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <Link href={detailUrl}>
                  <h3 className="font-bold text-base md:text-lg text-white mb-2 hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                </Link>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors"
                    >
                      <i className="ri-github-fill" /> GitHub
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-bg-dark bg-accent px-4 py-2 rounded-xl hover:scale-105 transition-transform"
                    >
                      <i className="ri-external-link-line" /> URL terkait
                    </a>
                  )}
                  {project.play_store_url && (
                    <a
                      href={project.play_store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors"
                    >
                      <i className="ri-google-play-fill" /> Play Store
                    </a>
                  )}
                  {project.apk_url && (
                    <a
                      href={project.apk_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors"
                    >
                      <i className="ri-download-line" /> APK
                    </a>
                  )}
                  {isVideo && project.video_url && (
                    <button
                      onClick={() => {
                        setVideoLoading(true);
                        setSelectedVideo(project.video_url);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/20 border border-accent/35 px-4 py-2 rounded-xl hover:bg-accent hover:text-bg-dark transition-colors"
                    >
                      <i className="ri-play-circle-line" /> Play Video
                    </button>
                  )}
                  <Link
                    href={detailUrl}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    <i className="ri-eye-line" /> Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <i className="ri-folder-open-line text-4xl text-white/20 mb-3" />
            <p className="text-gray-500 text-sm font-medium">Belum ada project di kategori ini.</p>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-10">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={() => {
              setSelectedVideo(null);
              setVideoLoading(false);
            }}
          />
          <button
            onClick={() => {
              setSelectedVideo(null);
              setVideoLoading(false);
            }}
            className="fixed top-4 right-4 z-[301] w-12 h-12 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
          >
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-video bg-black md:rounded-2xl overflow-hidden border-0 md:border md:border-white/10">
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <i className="ri-loader-4-line animate-spin text-3xl text-gray-400" />
              </div>
            )}
            <iframe
              src={getEmbedUrl(selectedVideo)}
              className={`relative w-full h-full border-0 transition-opacity duration-300 ${videoLoading ? "opacity-0" : "opacity-100 z-10"}`}
              allow="autoplay; fullscreen"
              allowFullScreen
              onLoad={() => setVideoLoading(false)}
            />
          </div>
        </div>
      )}

      <footer className="mt-20 md:mt-32 pb-8 md:pb-16 text-center border-t border-white/5 pt-8 md:pt-10">
        <p className="text-gray-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Portfolio 2026
        </p>
      </footer>
    </main>
  );
}

export default function ProjectsClient({ initialProjects }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
      </div>
    }>
      <ProjectsClientContent initialProjects={initialProjects} />
    </Suspense>
  );
}
