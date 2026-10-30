"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import LazyRender from "@/app/components/LazyRender";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { AnimatedTiles } from '@/app/components/AnimatedTiles';
import { getProjectPath } from '@/lib/project-utils';

// 🚀 PERF: Lazy-load non-critical components untuk mengurangi initial bundle
const DynamicIsland = dynamic(() => import("@/app/components/DynamicIsland").then(mod => mod.DynamicIsland), {
  ssr: false,
  loading: () => null,
});

const PdfThumbnail = dynamic(() => import("@/app/components/PdfThumbnail"), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-white/5 flex items-center justify-center"><i className="ri-file-pdf-line text-4xl text-white/20"></i></div>
});

const SKILLS_DATA = [
  {
    category: "Backend & Architecture",
    icon: "ri-server-line",
    items: ["PHP Laravel", "Routing & State Management", "System Architecture", "Scalable Backend"],
    color: "bg-white/10 border border-white/5",
    highlight: true,
    desc: "Keahlian utama — membangun arsitektur aplikasi web tangguh dan dapat diskalakan."
  },
  {
    category: "Database & Optimization",
    icon: "ri-database-2-line",
    items: ["PostgreSQL", "SQLite", "Schema Design", "Query Optimization", "Connection Pooling"],
    color: "bg-white/10 border border-white/5",
    highlight: true,
    desc: "Perancangan skema relasional dan optimalisasi kueri untuk performa tinggi."
  },
  {
    category: "AI Integration",
    icon: "ri-brain-line",
    items: ["Ollama / DeepSeek", "Cloud AI API", "Custom AI Assistants", "Prompt Engineering"],
    color: "bg-white/5 border border-white/5",
    desc: "Menanamkan AI ke dalam ekosistem aplikasi — lokal maupun cloud."
  },
  {
    category: "Frontend & Visual",
    icon: "ri-layout-3-line",
    items: ["Blade Templates", "Tailwind CSS", "Livewire", "UI/UX Awareness"],
    color: "bg-white/5 border border-white/5",
    desc: "Interface yang fungsional sekaligus visual — gabungan kode dan estetika."
  },
  {
    category: "DevOps & Automation",
    icon: "ri-git-branch-line",
    items: ["GitHub Actions CI/CD", "API Integration", "Local Tunneling", "Environment Config"],
    color: "bg-white/5 border border-white/5",
    desc: "Workflow profesional — otomasi, deploy, dan integrasi layanan pihak ketiga."
  },
  {
    category: "Technical Documentation",
    icon: "ri-file-text-line",
    items: ["Technical Writing", "Data Architecture Docs", "Project Reporting"],
    color: "bg-white/5 border border-white/5",
    desc: "Dokumentasi teknis terstruktur agar proyek mudah dipelihara."
  },
];

const DEV_PROJECTS = [
  {
    title: "Bot WA Reminder Absensi",
    image: null,
    gradient: "from-neutral-900 via-neutral-800 to-black",
    icon: "ri-whatsapp-line",
    tags: ["Node.js", "Baileys API", "Automation"],
    type: "bot",
    desc: "Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp. Menggunakan library Baileys untuk integrasi langsung dengan WhatsApp tanpa API resmi.",
    github_url: "https://github.com/galangpramudito/bot-presensi",
    link: "https://github.com/galangpramudito/bot-presensi",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "Sistem Web TPQ Al-Hikmah",
    image: null,
    gradient: "from-stone-900 via-neutral-900 to-zinc-950",
    icon: "ri-graduation-cap-line",
    tags: ["Web Dev", "HTML", "CSS"],
    type: "web",
    desc: "Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru di TPQ Al-Hikmah. Menangani data absensi, nilai, dan profil santri.",
    github_url: "https://github.com/galangpramudito/alhikmah",
    link: "https://github.com/galangpramudito/alhikmah",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "ThriftyFinds E-Commerce",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    gradient: null,
    icon: null,
    tags: ["React/Next.js", "Tailwind", "E-Commerce"],
    type: "web",
    desc: "Katalog e-commerce modern untuk produk thrifting dengan UI/UX intuitif dan performa pencarian cepat. Dibangun dengan Next.js dan Tailwind CSS.",
    github_url: "https://github.com/galangpramudito/thriftyfinds",
    link: "https://github.com/galangpramudito/thriftyfinds",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "HeartHorizon / Online Class",
    image: "/image/Photo by Pankaj Patel on Unsplash.jpg",
    gradient: null,
    icon: null,
    tags: ["LMS", "Fullstack", "Database"],
    type: "web",
    desc: "Aplikasi e-learning interaktif untuk manajemen materi kelas online, penugasan, dan interaksi pembelajaran. Full-stack dengan backend database MySQL.",
    github_url: "https://github.com/galangpramudito/hearthorizon",
    link: "https://github.com/galangpramudito/hearthorizon",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  }
];

const TYPE_LABELS = {
  website: { label: "Website", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  aplikasi: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  desain: { label: "Desain", icon: "ri-palette-line", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  'video editing': { label: "Video Editing", icon: "ri-video-line", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  // Fallbacks for older data during migration:
  web: { label: "Website", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  bot: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  android: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  other: { label: "Lainnya", icon: "ri-code-s-slash-line", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

const PROJECT_FILTERS = [
  { key: "all", label: "Semua Project", icon: "ri-apps-line" },
  { key: "website", label: "Website", icon: "ri-global-line" },
  { key: "aplikasi", label: "Aplikasi", icon: "ri-smartphone-line" },
];

const FEATURED_CREATIVE = [
  {
    id: 1,
    title: "UI/UX HeartHorizon",
    category: "Design",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    desc: "Proses perancangan antarmuka pengguna untuk platform e-learning.",
    type: "image"
  },
  {
    id: 2,
    title: "Video Editing Showcase",
    category: "Video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/18rl6oX3F_ZaaTaoSONB6v2hs-uxYESB5/preview",
    desc: "Editing video dokumentasi panjang dengan VN/CapCut.",
    type: "video"
  }
];

export default function HomeClient({ initialSkills, initialProjects, initialCertificates, initialProjectTypes, initialProfile }) {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isCvLanguageModalOpen, setIsCvLanguageModalOpen] = useState(false);
  const [selectedCvLanguage, setSelectedCvLanguage] = useState('id');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const getCvUrl = () => {
    if (selectedCvLanguage === 'en') {
      return initialProfile?.cv_url_en || "/cv-galang-en.pdf";
    }
    return initialProfile?.cv_url || "/cv-galang.pdf";
  };

  const [skills, setSkills] = useState((initialSkills && initialSkills.length > 0) ? initialSkills : SKILLS_DATA);
  const [projects, setProjects] = useState((initialProjects && initialProjects.length > 0) ? initialProjects : DEV_PROJECTS);
  const [certificates, setCertificates] = useState(initialCertificates || []);

  // Helper to safely format video URLs for embedding (YouTube & GDrive)
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const videoId = url.includes('youtu.be/')
          ? url.split('youtu.be/')[1].split('?')[0]
          : new URLSearchParams(new URL(url).search).get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
      }
      if (url.includes('drive.google.com/file/d/')) {
        return url.replace(/\/view.*$/, '/preview');
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  // Determine if a category should use the "Visual" layout dynamically.
  // A category is considered visual if the majority of its projects do NOT have dev-related URLs.
  const getIsVisual = (categoryProjects) => {
    if (!categoryProjects || categoryProjects.length === 0) return false;
    let visualCount = 0;
    categoryProjects.forEach(p => {
      if (!p.github_url && !p.demo_url && !p.play_store_url && !p.apk_url) {
        visualCount++;
      }
    });
    return visualCount > categoryProjects.length / 2;
  };

  const fallbackTypes = [
    { name: 'Website', slug: 'website' },
    { name: 'Aplikasi', slug: 'aplikasi' },
    { name: 'Desain', slug: 'desain' },
    { name: 'Video Editing', slug: 'video-editing' }
  ];

  const typesToUse = initialProjectTypes?.length > 0 ? [...initialProjectTypes] : [...fallbackTypes];

  // Ensure legacy orphaned projects still show up by adding their categories if missing
  projects.forEach(p => {
    let pSlug = p.project_type?.toLowerCase() || '';
    if (pSlug === 'web') pSlug = 'website';
    if (pSlug === 'bot' || pSlug === 'android') pSlug = 'aplikasi';
    if (pSlug === 'design') pSlug = 'desain';
    if (pSlug === 'video' || pSlug === 'video editing') pSlug = 'video-editing';

    if (pSlug && !typesToUse.find(t => t.slug?.toLowerCase() === pSlug)) {
      typesToUse.push({
        name: pSlug.charAt(0).toUpperCase() + pSlug.slice(1).replace(/-/g, ' '),
        slug: pSlug
      });
    }
  });

  const dynamicSections = typesToUse.map(type => {
    // Filter projects for this type
    const typeProjects = projects.filter(p => {
      const pSlug = p.project_type?.toLowerCase() || '';
      return pSlug === type.slug?.toLowerCase() || (pSlug === 'web' && type.slug === 'website') || (['bot', 'android'].includes(pSlug) && type.slug === 'aplikasi') || ((pSlug === 'video' || pSlug === 'video editing') && type.slug === 'video-editing');
    });

    if (typeProjects.length === 0) return null;

    return {
      id: type.slug,
      name: type.name,
      isVisual: getIsVisual(typeProjects),
      projects: typeProjects
    };
  }).filter(Boolean); // Remove empty sections

  const [certsLoading, setCertsLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const mainRef = useRef(null);

  useEffect(() => {
    const sectionIds = ["home", "about", "skills", "projects", "certificates", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
        setIsCvModalOpen(false);
        setIsCvLanguageModalOpen(false);
        setSelectedCert(null);
        setIsPreviewModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isAnyModalOpen = Boolean(
    selectedVideo || isCvModalOpen || isCvLanguageModalOpen || isPreviewModalOpen || selectedCert
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    // ✅ PERF: Defer GSAP animations sampai setelah LCP
    let ctx;
    let idleId;
    let timeoutId;

    const initAnimations = () => {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // ♿ PERF & ACCESSIBILITY: Only animate if user hasn't requested reduced motion
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // Section titles animation
          gsap.utils.toArray("section").forEach((section) => {
            const title = section.querySelector(".section-title");
            if (title) {
              gsap.from(title, {
                opacity: 0,
                x: -40,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 82%", once: true }
              });
            }
          });

          // ⚡ PERF: Batch cards together to reduce ScrollTrigger listener overhead
          ScrollTrigger.batch(".bento-card, .work-card, .visual-card, .info-card, .skill-card, .contact-card", {
            start: "top bottom-=40px",
            once: true,
            onEnter: (batch) => {
              gsap.fromTo(batch,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1.2,
                  stagger: 0.1,
                  ease: "expo.out",
                  overwrite: "auto",
                  clearProps: "transform"
                }
              );
            }
          });
        });
      }, mainRef);

      ScrollTrigger.refresh();
    };

    // Use requestIdleCallback untuk defer heavy animations, fallback ke setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      idleId = requestIdleCallback(() => {
        initAnimations();
      }, { timeout: 500 });
    } else {
      timeoutId = setTimeout(() => {
        initAnimations();
      }, 0);
    }

    return () => {
      if (typeof cancelIdleCallback !== 'undefined' && idleId) {
        cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (ctx) {
        ctx.revert();
      }
    };
  }, [skillsLoading, projectsLoading, certsLoading]);

  const availability = useMemo(() => {
    switch (initialProfile?.availability_status) {
      case 'available': return { color: 'bg-accent', text: 'Available for Internship & Freelance' };
      case 'freelance_only': return { color: 'bg-green-500', text: 'Available for Freelance' };
      case 'internship_only': return { color: 'bg-blue-500', text: 'Available for Internship' };
      case 'unavailable': return { color: 'bg-red-500', text: 'Not Available Currently' };
      default: return { color: 'bg-accent', text: 'Available for Internship & Freelance' };
    }
  }, [initialProfile?.availability_status]);

  return (
    <main ref={mainRef} className="bg-bg-dark selection:bg-accent selection:text-bg-dark relative overflow-x-hidden">

      {/* ✅ PERF: Entrance animation removed for better LCP */}

      {/* Fixed Logo */}


      <DynamicIsland activeSection={activeSection} />
      <DarkModeToggle />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="hidden md:block absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      <section id="home" className="relative min-h-[100dvh] flex items-center px-6 md:px-12 lg:px-20 z-10 overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* ✅ MOBILE/TABLET: Foto di atas (order-first) - PERF: Removed opacity-0 and animationDelay to fix LCP */}
          <div className="order-first lg:order-last lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[380px]">
              <div className="relative aspect-[4/5] w-full group cursor-pointer">
                <AnimatedTiles
                  imageUrl={initialProfile?.avatar_url || "/image/gambar galang 2.jpg"}
                />
              </div>
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-white/[0.04] -z-10"></div>
            </div>
          </div>

          {/* ✅ MOBILE/TABLET: Teks di bawah (order-last), centered */}
          <div className="order-last lg:order-first lg:col-span-7 space-y-5 md:space-y-8 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-medium animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${availability.color}`}></span> {availability.text}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
              {(() => {
                const nameParts = (initialProfile?.full_name || 'Galang Arrauf Pramudito').split(' ');
                const first = nameParts[0];
                const rest = nameParts.slice(1).join(' ');
                return (
                  <>
                    {first} {rest && <span className="text-accent font-serif italic font-normal">{rest}</span>}
                  </>
                );
              })()}
            </h1>
            <p className="text-base md:text-lg text-gray-400 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
              Crafting robust web solutions &amp; intelligent automation from Sidoarjo.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4 pt-2 justify-center lg:justify-start animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
              <a href="#projects" className="px-6 md:px-8 py-3 md:py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:opacity-90">View My Work</a>
              <button onClick={() => setIsCvLanguageModalOpen(true)} className="group px-6 md:px-8 py-3 md:py-3.5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-20 relative inline-flex items-center gap-2">
                <i className="ri-file-user-line text-lg group-hover:text-accent transition-colors"></i>
                My Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[380px] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#18181b] via-[#18181b] to-accent/20 shadow-xl p-8">
              <div className="h-full flex flex-col justify-between gap-8 md:gap-12 lg:gap-0">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-6">Tech Stack</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Laravel', slug: 'laravel' },
                      { name: 'PHP', slug: 'php' },
                      { name: 'PostgreSQL', slug: 'postgresql' },
                      { name: 'Tailwind', slug: 'tailwindcss' },
                      { name: 'Next.js', slug: 'nextdotjs' },
                      { name: 'React', slug: 'react' },
                    ].map((tech) => (
                      <div key={tech.name} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`} alt={tech.name} className="w-6 h-6" loading="lazy" />
                        <span className="text-[9px] text-white/70 font-medium text-center leading-tight">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Also Work With</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Git', slug: 'git' },
                      { name: 'Docker', slug: 'docker' },
                      { name: 'Node.js', slug: 'nodedotjs' },
                      { name: 'Supabase', slug: 'supabase' },
                    ].map((tech) => (
                      <div key={tech.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`} alt={tech.name} className="w-3.5 h-3.5" loading="lazy" />
                        <span className="text-[9px] text-white/70">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-card-bg border border-black/5 dark:border-white/10 p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-2xl">
              <p className="text-accent font-bold text-xl">10+</p>
              <p className="text-gray-900 dark:text-gray-400 text-[10px] uppercase tracking-widest">Projects Completed</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="section-title text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-[1.15]">
              Halo, saya <span className="text-accent">{initialProfile?.full_name ? initialProfile.full_name.split(' ')[0] : 'Galang'}</span>
            </h2>

            <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed">
              Web developer yang berfokus pada pengembangan backend menggunakan <span className="text-indigo-400 font-semibold">Laravel dan PHP</span>. Saya terbiasa merancang arsitektur sistem yang tangguh, mengelola database yang efisien, serta mengintegrasikan AI untuk meningkatkan kapabilitas aplikasi.
            </p>

            <p className="text-sm md:text-base text-gray-400 mb-8 leading-relaxed">
              Saya percaya bahwa setiap kode yang ditulis harus memberikan solusi nyata. Dengan pendekatan logika yang terstruktur dan dokumentasi yang rapi, saya memastikan sistem yang saya bangun tidak hanya fungsional, tetapi juga skalabel dan mudah dikelola.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="info-card p-4 bg-white/[0.02] backdrop-blur-md hover:-translate-y-1 transition-all rounded-xl border border-white/[0.08] flex items-center gap-3">
                <i className="ri-server-line text-2xl text-accent"></i>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Main Stack</p>
                  <p className="font-bold text-white text-sm">Laravel, PHP, MySQL</p>
                </div>
              </div>
              <div className="info-card p-4 bg-white/[0.02] backdrop-blur-md hover:-translate-y-1 transition-all rounded-xl border border-white/[0.08] flex items-center gap-3">
                <i className="ri-brain-line text-2xl text-accent"></i>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Specialization</p>
                  <p className="font-bold text-white text-sm">AI Integration & Automation</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-accent text-bg-dark font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:opacity-90 group"
              >
                <i className="ri-user-search-line text-base"></i>
                <span>Lihat Cerita &amp; Timeline Lengkap</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="py-24 px-6 bg-black/20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="skills-header mb-12">
            <h2 className="section-title text-3xl md:text-4xl font-bold tracking-tight">Core Expertise</h2>
            <p className="skills-desc text-gray-400 text-sm md:text-base mt-3 max-w-lg leading-relaxed">
              Teknologi dan keahlian yang saya kuasai dalam pengembangan web, arsitektur sistem, dan otomasi.
            </p>
          </div>
          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-3xl bg-card-bg border border-white/10 p-8 animate-pulse relative overflow-hidden light-shadow">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0"></div>
                    <div className="h-6 bg-white/10 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-4 bg-white/5 rounded-md w-full mb-3"></div>
                  <div className="h-4 bg-white/5 rounded-md w-4/5 mb-6"></div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className="h-6 w-16 bg-white/5 border border-white/5 rounded-lg"></span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skills-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`skill-card group relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-500 light-shadow hover:-translate-y-1 ${skill.highlight
                    ? 'bg-white/[0.03] backdrop-blur-xl border-accent/20 border-2 shadow-[0_0_30px_rgba(255,255,255,0.05)] shadow-accent/10'
                    : 'bg-white/[0.02] backdrop-blur-lg border border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                >
                  {/* Watermark Icon */}
                  <i className={`${skill.icon} absolute -right-6 -bottom-6 text-[120px] text-white opacity-[0.03] group-hover:opacity-[0.06] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500 pointer-events-none watermark-icon`}></i>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-2xl ${skill.color} flex items-center justify-center shrink-0 shadow-lg`}>
                        <i className={`${skill.icon} text-xl text-white skill-icon`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-display font-bold text-white group-hover:text-accent transition-colors">{skill.category}</h3>
                        {skill.highlight && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest rounded-full">Core</span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                      {skill.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {skill.items.map(item => (
                        <span key={item} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono font-medium text-gray-300 group-hover:border-white/20 transition-colors">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div id="projects" className="relative">
        {dynamicSections.map((section, idx) => {
          const isVisual = section.isVisual;
          const spotlight = section.projects[0];
          const rest = section.projects.slice(1);

          return (
            <section key={section.id} className="py-12 md:py-16 px-6 relative z-10 border-t border-white/[0.02]">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {idx % 2 === 0 ? (
                  <>
                    <div className="hidden md:block absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[140px]"></div>
                    <div className="hidden md:block absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px]"></div>
                  </>
                ) : (
                  <>
                    <div className="hidden md:block absolute left-1/4 -top-40 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]"></div>
                  </>
                )}
              </div>
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                  <div>
                    <p className="work-eyebrow text-[11px] uppercase tracking-[0.22em] text-gray-400 font-mono mb-4">Proyek Galang Arrauf Pramudito</p>
                    <h2 className="section-title text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
                      {section.name.split(' ').map((word, i, arr) => (
                        i === arr.length - 1 ? <span key={i} className="text-accent">{word}</span> : <span key={i}>{word} </span>
                      ))}
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base mt-3 max-w-lg leading-relaxed">
                      Proyek {section.name.toLowerCase()} buatan Galang Arrauf Pramudito — dari backend, frontend, hingga integrasi AI.
                    </p>
                  </div>
                  <Link
                    href={`/projects?type=${section.id}`}
                    className="group px-6 py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:opacity-90 flex items-center justify-center gap-3"
                  >
                    <span>Explore {section.name}</span>
                    <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center transition-all duration-300">
                      <i className="ri-arrow-right-line text-sm group-hover:translate-x-0.5 transition-transform duration-300"></i>
                    </span>
                  </Link>
                </div>

                {isVisual ? (
                  /* VISUAL LAYOUT */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {section.projects.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.video_url ? setSelectedVideo(item.video_url) : null}
                        className={`visual-card group relative aspect-[16/10] rounded-[1.75rem] border border-white/[0.06] hover:border-accent/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${item.video_url ? "cursor-pointer" : "overflow-hidden"}`}
                      >
                        {item.video_url ? (
                          <div className="w-full h-full overflow-hidden rounded-[1.75rem] relative">
                            <Image src={item.image || '/image/TOKO TUNAI BGDARK mockup fix.png'} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-1000 ease-out" priority={idx === 0} />
                          </div>
                        ) : (
                          <div className="w-full h-full overflow-hidden rounded-[1.75rem] relative z-10 [&_[data-rmiz-wrap]]:w-full [&_[data-rmiz-wrap]]:h-full [&_[data-rmiz-wrap]]:relative">
                            <Zoom zoomMargin={30} wrapElement="div">
                              <Image src={item.image || '/image/TOKO TUNAI BGDARK mockup fix.png'} alt={item.title} width={800} height={500} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-1000 ease-out" priority={idx === 0} />
                            </Zoom>
                          </div>
                        )}

                        {/* Subtle Premium Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-3/4 md:h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

                        {item.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="p-1 bg-black/30 backdrop-blur-md rounded-full group-hover:bg-accent group-hover:scale-110 transition-all duration-500 ease-out border border-white/20 group-hover:border-accent">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 flex items-center justify-center">
                                <i className="ri-play-fill text-white text-xl md:text-2xl ml-1 group-hover:text-bg-dark transition-colors duration-500"></i>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expanding Text Content */}
                        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 z-20 pointer-events-none flex flex-col justify-end">
                          <div className="transform translate-y-0 md:translate-y-6 md:group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                            <h4 className="text-white font-bold text-lg md:text-xl drop-shadow-md">{item.title}</h4>
                            <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                              <p className="text-gray-300 text-xs md:text-[13px] leading-relaxed overflow-hidden mt-1.5 md:mt-0 md:group-hover:mt-2 line-clamp-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-75">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* DEV LAYOUT */
                  <div className="space-y-8">
                    {/* Spotlight */}
                    <div className="work-card p-1.5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/[0.08] group/card hover:-translate-y-1 hover:border-white/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <div className="rounded-[calc(2rem-0.375rem)] overflow-hidden bg-card-bg grid lg:grid-cols-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                        <div className="lg:col-span-7 relative h-64 lg:h-[420px] overflow-hidden">
                          {spotlight.image ? (
                            <Image src={spotlight.image} alt={spotlight.title} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover group-hover/card:scale-[1.04] transition-transform duration-1000 ease-out" priority fetchPriority="high" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${spotlight.gradient || 'from-neutral-900 to-black'} flex items-center justify-center relative`}>
                              <i className={`${spotlight.icon || 'ri-code-s-slash-line'} text-8xl text-white/15`}></i>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent"></div>
                            </div>
                          )}
                          {/* Gradasi dihapus */}
                        </div>
                        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-5">
                            {(spotlight.tags || []).slice(0, 3).map(tag => (
                              <span key={tag} className="work-tag px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{tag}</span>
                            ))}
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white tracking-tight leading-tight">
                            {spotlight.id ? (
                              <Link
                                href={getProjectPath(spotlight)}
                                className="hover:text-accent transition-colors"
                              >
                                {spotlight.title}
                              </Link>
                            ) : (
                              spotlight.title
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md line-clamp-3">{spotlight.desc}</p>
                          <div className="flex flex-wrap gap-3">
                            {spotlight.github_url && (
                              <a href={spotlight.github_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-2 text-white font-bold text-sm bg-white/[0.06] px-5 py-2.5 rounded-full active:scale-[0.97] transition-all duration-500 hover:bg-white/[0.12] border border-white/[0.08]">
                                <i className="ri-github-fill text-base"></i> Source
                              </a>
                            )}
                            {spotlight.demo_url && (
                              <a href={spotlight.demo_url} target="_blank" rel="noopener noreferrer" className="group/btn inline-flex items-center gap-3 bg-accent text-bg-dark font-bold text-sm px-6 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.97] transition-all duration-500">
                                <span>Kunjungi</span>
                                <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-[0.5px] group-hover/btn:scale-105 transition-all duration-300">
                                  <i className="ri-external-link-line text-sm"></i>
                                </span>
                              </a>
                            )}
                            {spotlight.play_store_url && (
                              <a href={spotlight.play_store_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-white font-bold text-sm bg-white/[0.06] px-5 py-2.5 rounded-full hover:bg-white/[0.12] border border-white/[0.08]">
                                <i className="ri-google-play-fill text-base"></i> Play Store
                              </a>
                            )}
                            {spotlight.id && (
                              <Link
                                href={getProjectPath(spotlight)}
                                className="work-btn-ghost group/btn inline-flex items-center gap-2 text-white font-bold text-sm bg-white/[0.06] px-5 py-2.5 rounded-full hover:bg-white/[0.12] border border-white/[0.08]"
                              >
                                <i className="ri-eye-line text-base" /> Details
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rest */}
                    {rest.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {rest.map((project) => {
                          return (
                            <div key={project.id} className="work-card p-1 bg-white/[0.02] backdrop-blur-lg rounded-2xl border border-white/[0.08] group/card hover:-translate-y-1 hover:border-white/20 transition-all duration-700">
                              <div className="rounded-[calc(1.5rem-0.25rem)] overflow-hidden bg-card-bg flex flex-col h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                                <div className="relative h-48 overflow-hidden">
                                  {project.image ? (
                                    <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover/card:scale-[1.05] transition-transform duration-800 ease-out" />
                                  ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${project.gradient || 'from-neutral-900 to-black'} flex items-center justify-center relative`}>
                                      <i className={`${project.icon || 'ri-code-s-slash-line'} text-5xl text-white/20`}></i>
                                    </div>
                                  )}
                                  {/* Gradasi dihapus */}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                  <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(project.tags || []).slice(0, 3).map(tag => (
                                      <span key={tag} className="work-tag px-2.5 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[9px] text-gray-500 font-semibold uppercase tracking-wider">{tag}</span>
                                    ))}
                                  </div>
                                  <h3 className="text-base font-bold mb-2 text-white tracking-tight">
                                    {project.id ? (
                                      <Link
                                        href={getProjectPath(project)}
                                        className="hover:text-accent transition-colors"
                                      >
                                        {project.title}
                                      </Link>
                                    ) : (
                                      project.title
                                    )}
                                  </h3>
                                  <p className="text-gray-400 text-xs mb-5 flex-1 leading-relaxed line-clamp-2">{project.desc}</p>
                                  <div className="flex flex-wrap gap-2 mt-auto">
                                    {project.github_url && (
                                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full hover:bg-white/[0.10] hover:text-white border border-white/[0.06]">
                                        <i className="ri-github-fill text-sm"></i> Source
                                      </a>
                                    )}
                                    {project.demo_url && (
                                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="group/btn inline-flex items-center gap-2 bg-accent text-bg-dark font-semibold text-xs px-5 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        <span>Kunjungi</span>
                                      </a>
                                    )}
                                    {project.id && (
                                      <Link
                                        href={getProjectPath(project)}
                                        className="inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full hover:bg-white/[0.10] hover:text-white border border-white/[0.06]"
                                      >
                                        <i className="ri-eye-line text-sm"></i> Details
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)} />
          <button
            onClick={() => setSelectedVideo(null)}
            className="fixed top-4 right-4 z-[301] w-12 h-12 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
          >
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-video bg-black md:rounded-2xl overflow-hidden border-0 md:border md:border-white/10">
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <i className="ri-loader-4-line animate-spin text-3xl text-gray-400" />
            </div>
            <iframe src={getEmbedUrl(selectedVideo)} className="relative w-full h-full border-0 z-10" allow="autoplay; fullscreen" allowFullScreen />
          </div>
        </div>
      )}

      <section id="certificates" className="py-24 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-3 tracking-tight">Certificates</h2>
              <p className="text-gray-400 text-sm max-w-md">Sertifikat dan pencapaian dari berbagai pelatihan dan kompetisi.</p>
            </div>
            <Link href="/certificates" className="px-6 py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:opacity-90 flex items-center gap-2">
              View All <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-pulse">
                  <div className="w-full aspect-[4/3] bg-white/5"></div>
                  <div className="p-6 flex flex-col flex-1 space-y-3">
                    <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
                    <div className="h-8 bg-white/5 border border-white/10 rounded-xl w-1/3 mt-auto"></div>
                  </div>
                </div>
              ))
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} onClick={() => setSelectedCert(cert)} className="bento-card group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-white/20 transition-all flex flex-col cursor-pointer">
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center overflow-hidden">
                    {(cert.image_url || cert.image) ? (
                      <Image src={cert.image_url || cert.image} alt={cert.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    ) : cert.verify_url?.endsWith('.pdf') ? (
                      <LazyRender height="100%">
                        <PdfThumbnail url={cert.verify_url} width={600} />
                      </LazyRender>
                    ) : (
                      <i className="ri-award-fill text-6xl text-white/40"></i>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <i className="ri-eye-line text-white text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-white mb-2 line-clamp-2">{cert.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mb-1"><i className="ri-award-line text-accent"></i> {cert.issuer}</p>
                    {cert.issue_date && <p className="text-xs text-gray-500">{cert.issue_date}</p>}
                    <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold mt-3 group-hover:gap-2.5 transition-all">
                      View Credential <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {!certsLoading && !certificates.length && <p className="text-gray-500 text-sm text-center">Belum ada sertifikat.</p>}
        </div>
      </section>

      {selectedCert && (
        <div className="fixed inset-0 z-[400] flex flex-col md:flex md:items-center md:justify-center md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedCert(null)} />
          <button onClick={() => setSelectedCert(null)} className="fixed top-4 right-4 z-[401] w-12 h-12 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl">
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative z-10 w-full h-full md:h-auto md:max-w-4xl bg-card-bg overflow-y-auto md:border md:border-white/10 md:rounded-2xl md:max-h-[90vh] grid grid-cols-1 md:grid-cols-2 pt-14 md:pt-0">
            <div className="bg-white/5 flex items-center justify-center overflow-hidden min-h-[240px] relative">
              {selectedCert.verify_url?.endsWith('.pdf') ? (
                <PdfThumbnail url={selectedCert.verify_url} width={900} />
              ) : (selectedCert.image_url || selectedCert.image) ? (
                <Image src={selectedCert.image_url || selectedCert.image} alt={selectedCert.title} width={900} height={636} className="w-full h-auto object-contain max-h-[70vh]" />
              ) : (
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                  <i className="ri-award-fill text-8xl text-white/40" />
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col">
              <h4 className="font-bold text-xl text-white mb-4">{selectedCert.title}</h4>
              <dl className="space-y-3 text-sm flex-1">
                <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Penerbit</dt><dd className="text-white">{selectedCert.issuer}</dd></div>
                {selectedCert.credential_id && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential ID</dt><dd className="text-white break-all">{selectedCert.credential_id}</dd></div>}
                {selectedCert.credential_url && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential Link</dt><dd><a href={selectedCert.credential_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors break-all">{selectedCert.credential_url} <i className="ri-external-link-line text-xs" /></a></dd></div>}
                {selectedCert.issue_date && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Tanggal Terbit</dt><dd className="text-white">{selectedCert.issue_date}</dd></div>}
                {selectedCert.description && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Deskripsi</dt><dd className="text-gray-300 leading-relaxed">{selectedCert.description}</dd></div>}
              </dl>
              <div className="flex flex-wrap gap-3 mt-6">
                {selectedCert.verify_url && (
                  <a href={selectedCert.verify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    {selectedCert.verify_url.toLowerCase().endsWith('.pdf') ? 'View PDF' : 'View File'} <i className={selectedCert.verify_url.toLowerCase().endsWith('.pdf') ? "ri-file-pdf-2-line" : "ri-external-link-line"} />
                  </a>
                )}
                {selectedCert.credential_url && (
                  <a href={selectedCert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/80 px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    Verify Credential <i className="ri-external-link-line" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="contact-card max-w-4xl mx-auto bg-card-bg/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-14 relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl font-bold mb-4 uppercase">Let&apos;s Connect</h2>
            <p className="text-gray-400">Punya tawaran kerja atau ide kolaborasi?</p>
          </div>
          <form action="https://formspree.io/f/meoqzdan" method="POST" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Lengkap" aria-label="Nama Lengkap" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
              <input type="email" name="email" placeholder="Email Valid" aria-label="Email Valid" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
            </div>
            <textarea name="message" rows="4" placeholder="Pesan Anda..." aria-label="Pesan Anda" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"></textarea>
            <button type="submit" className="w-full py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:opacity-90 flex items-center justify-center gap-2">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-white/5">
        <div className="flex justify-center gap-8 mb-8">
          <a href="https://github.com/galangpramudito" target="_blank" rel="noopener noreferrer" aria-label="GitHub Galang Arrauf Pramudito" className="text-gray-400 hover:text-white text-2xl transition-colors"><i className="ri-github-fill"></i></a>
          <a href="https://www.linkedin.com/in/galang-pramudito/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Galang Arrauf Pramudito" className="text-gray-400 hover:text-white text-2xl transition-colors"><i className="ri-linkedin-fill"></i></a>
          <a href="mailto:galangarrauf22@gmail.com" aria-label="Email Galang Arrauf Pramudito" className="text-gray-400 hover:text-white text-2xl transition-colors"><i className="ri-mail-line"></i></a>
        </div>
        <p className="text-gray-400 text-[10px] md:text-[11px] font-medium tracking-[0.3em] uppercase">© 2026 Galang Arrauf Pramudito</p>
      </footer>

      {isCvLanguageModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCvLanguageModalOpen(false)} />
          <button
            onClick={() => setIsCvLanguageModalOpen(false)}
            className="fixed top-4 right-4 z-[501] w-12 h-12 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
            aria-label="Close language modal"
          >
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative bg-card-bg border border-white/10 p-8 md:p-10 rounded-2xl w-full max-w-sm mx-4 md:mx-0 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 scale-in-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-global-line text-accent text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pilih Bahasa CV</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Silakan pilih bahasa untuk Curriculum Vitae.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSelectedCvLanguage('en');
                  setIsCvLanguageModalOpen(false);
                  setTimeout(() => setIsCvModalOpen(true), 100);
                }}
                className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-xs inline-flex items-center justify-center gap-2"
              >
                English
              </button>
              <button
                onClick={() => {
                  setSelectedCvLanguage('id');
                  setIsCvLanguageModalOpen(false);
                  setTimeout(() => setIsCvModalOpen(true), 100);
                }}
                className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-xs inline-flex items-center justify-center gap-2"
              >
                Indonesia
              </button>
            </div>
          </div>
        </div>
      )}

      {isCvModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCvModalOpen(false)} />
          <button
            onClick={() => setIsCvModalOpen(false)}
            className="fixed top-4 right-4 z-[501] w-12 h-12 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
            aria-label="Close CV modal"
          >
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative bg-card-bg border border-white/10 p-8 md:p-10 rounded-2xl w-full max-w-md mx-4 md:mx-0 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 scale-in-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-file-user-line text-accent text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Resume</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Curriculum Vitae Galang Arrauf Pramudito dalam format PDF.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsCvModalOpen(false);
                  setTimeout(() => setIsPreviewModalOpen(true), 100);
                }}
                className="w-full py-4 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 shadow-xl hover:opacity-90"
              >
                <i className="ri-eye-line text-base" />
                Preview CV
              </button>
              <a href={getCvUrl()} download target="_blank" rel="noopener noreferrer" className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-xs inline-flex items-center justify-center gap-2">
                <i className="ri-download-line text-base" />
                Download CV
              </a>
              <button onClick={() => setIsCvModalOpen(false)} className="mt-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsPreviewModalOpen(false)} />
          <button
            onClick={() => setIsPreviewModalOpen(false)}
            className="fixed top-4 right-4 z-[501] w-12 h-12 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 md:border-transparent shadow-xl"
            aria-label="Close preview"
          >
            <i className="ri-close-line text-xl md:text-2xl" />
          </button>
          <div className="relative z-10 w-full max-w-5xl h-full md:aspect-[4/3] md:max-h-[85vh] bg-card-bg md:border md:border-white/10 md:rounded-2xl overflow-hidden flex flex-col scale-in-center pt-14 md:pt-0">
            <div className="p-3 md:p-4 border-b border-white/10 flex items-center bg-black/50 shrink-0">
              <h3 className="text-white font-bold text-sm md:text-base truncate">CV - Galang Arrauf Pramudito</h3>
              <a
                href={getCvUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-accent text-xs font-bold uppercase tracking-widest hover:text-white transition-colors md:hidden"
              >
                Buka
              </a>
            </div>
            <div className="flex-1 relative min-h-[300px] bg-white/5">
              <iframe
                src={getCvUrl()}
                className="w-full h-full border-0 hidden md:block"
                title="CV Preview"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6 md:hidden">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-pdf-2-line text-accent text-3xl" />
                  </div>
                  <h4 className="text-white font-bold mb-2">CV Galang Arrauf Pramudito</h4>
                  <p className="text-gray-400 text-sm mb-6">Buka PDF di tab baru untuk melihat CV</p>
                  <a
                    href={getCvUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:opacity-90"
                  >
                    <i className="ri-external-link-line" />
                    Buka PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
