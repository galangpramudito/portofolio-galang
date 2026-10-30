"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTypeConfig, getEmbedUrl } from "@/lib/project-utils";

import { BackButton } from "@/app/components/BackButton";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";

function ScreenshotLightbox({ images, initialIndex, title, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback((dir) => {
    setLoaded(false);
    setIndex((i) => (i + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goTo]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col md:flex md:items-center md:justify-center md:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[201] w-12 h-12 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
        aria-label="Close"
      >
        <i className="ri-close-line text-xl md:text-2xl" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(-1)}
            className="fixed left-2 md:left-10 top-1/2 -translate-y-1/2 z-[201] w-12 h-12 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl active:scale-90 transition-transform"
            aria-label="Previous"
          >
            <i className="ri-arrow-left-s-line text-2xl md:text-3xl" />
          </button>
          <button
            onClick={() => goTo(1)}
            className="fixed right-2 md:right-10 top-1/2 -translate-y-1/2 z-[201] w-12 h-12 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl active:scale-90 transition-transform"
            aria-label="Next"
          >
            <i className="ri-arrow-right-s-line text-2xl md:text-3xl" />
          </button>
        </>
      )}

      <div
        className="relative z-10 w-full h-full md:h-auto md:max-w-5xl flex flex-col md:rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 flex items-center justify-center bg-black min-h-0">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin text-3xl text-gray-400" />
            </div>
          )}
          <Image
            src={images[index].image_url}
            alt={images[index].caption || title}
            width={1200}
            height={900}
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ maxHeight: "calc(100dvh - 120px)" }}
            sizes="100vw"
            priority
            onLoad={() => setLoaded(true)}
          />
        </div>

        <div className="bg-black/80 px-4 py-3 md:px-6 md:py-4 md:rounded-b-2xl shrink-0">
          <p className="text-white font-bold text-sm truncate">
            {title}
            {images.length > 1 && (
              <span className="text-gray-400 font-normal ml-2">
                · {index + 1}/{images.length}
              </span>
            )}
          </p>
          {images[index].caption && (
            <p className="text-accent text-xs mt-1 truncate">{images[index].caption}</p>
          )}
          {images[index].description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-1">{images[index].description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoLightbox({ url, onClose }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[301] w-12 h-12 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
        aria-label="Close"
      >
        <i className="ri-close-line text-xl md:text-2xl" />
      </button>
      <div className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-video bg-black md:rounded-2xl overflow-hidden border-0 md:border md:border-white/10">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <i className="ri-loader-4-line animate-spin text-3xl text-gray-400" />
          </div>
        )}
        <iframe
          src={getEmbedUrl(url)}
          className={`relative w-full h-full border-0 transition-opacity duration-300 ${loaded ? "opacity-100 z-10" : "opacity-0"}`}
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

export default function ProjectDetailClient({ project }) {
  const [screenshotIndex, setScreenshotIndex] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const typeInfo = getTypeConfig(project.project_type);
  const isVideo = ["video-editing", "video"].includes(project.project_type);
  const hasImages = project.images && project.images.length > 0;

  useEffect(() => {
    if (screenshotIndex !== null || selectedVideo) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [screenshotIndex, selectedVideo]);

  return (
    <main className="min-h-[100dvh] bg-bg-dark text-white relative overflow-x-hidden">

      <DarkModeToggle />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full" />
        <div className="absolute right-[-20%] bottom-[-10%] w-[60%] h-[40%] bg-primary blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-16 pt-4 md:pt-8 pb-16">
        <BackButton href="/projects" label="Back to Projects" />

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 mb-8">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center`}>
              <i className={`${typeInfo.icon} text-7xl text-white/20`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md ${typeInfo.color}`}>
              <i className={typeInfo.icon} /> {typeInfo.label}
            </span>
            {project.status === "wip" && (
              <span className="px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase border bg-yellow-500/20 text-yellow-300 border-yellow-500/30 backdrop-blur-md">
                WIP
              </span>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
            {project.title}
          </h1>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] md:text-[11px] font-bold text-gray-400 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {project.description && (
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl whitespace-pre-line">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:border-accent/40 transition-colors"
            >
              <i className="ri-github-fill" /> GitHub
            </a>
          )}
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-bg-dark bg-accent px-5 py-2.5 rounded-xl hover:scale-105 transition-transform"
            >
              <i className="ri-external-link-line" /> URL terkait
            </a>
          )}
          {project.play_store_url && (
            <a
              href={project.play_store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:border-accent/40 transition-colors"
            >
              <i className="ri-google-play-fill" /> Play Store
            </a>
          )}
          {project.apk_url && (
            <a
              href={project.apk_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:border-accent/40 transition-colors"
            >
              <i className="ri-download-line" /> APK
            </a>
          )}
          {isVideo && project.video_url && (
            <button
              onClick={() => setSelectedVideo(project.video_url)}
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/20 border border-accent/35 px-5 py-2.5 rounded-xl hover:bg-accent hover:text-bg-dark transition-colors"
            >
              <i className="ri-play-circle-line" /> Play Video
            </button>
          )}
        </div>

        {hasImages && (
          <div className="mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-4 tracking-tight">
              {project.project_type === "desain" ? "Gallery" : "Screenshots"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {project.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setScreenshotIndex(idx)}
                  className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-accent/40 transition-all group/card cursor-pointer"
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || project.title}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {screenshotIndex !== null && (
        <ScreenshotLightbox
          images={project.images}
          initialIndex={screenshotIndex}
          title={project.title}
          onClose={() => setScreenshotIndex(null)}
        />
      )}

      {selectedVideo && (
        <VideoLightbox url={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </main>
  );
}
