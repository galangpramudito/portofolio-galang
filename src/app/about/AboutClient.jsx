"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BackButton } from "@/app/components/BackButton";
import { DarkModeToggle } from "@/app/components/DarkModeToggle";

const FALLBACK_TIMELINE = [
  {
    id: "smkn2-buduran",
    period: "2022 — 2025",
    status: "Lulus",
    role: "Siswa Rekayasa Perangkat Lunak (RPL)",
    institution: "SMKN 2 Buduran Sidoarjo",
    location: "Sidoarjo, Jawa Timur",
    icon: "ri-graduation-cap-line",
    category: "Pendidikan Menengah",
    summary:
      "Fokus Utama: Pengembangan Fundamental & Algoritma — Membangun logika komputer yang kuat, algoritma efisien, dan dasar-dasar penulisan clean code.",
    description: [
      "Dasar Pemrograman: Mempelajari dan memperkuat logika dasar komputer, penyusunan algoritma efisien, serta dasar-dasar penulisan kode program yang terstruktur dan mudah dikelola (clean code).",
      "Fondasi Rekayasa Perangkat Lunak: Mendalami konsep pemrograman berorientasi objek (OOP), perancangan basis data relasional MySQL, serta pengembangan aplikasi web dari dasar (HTML5, CSS3, JavaScript, PHP Native hingga framework modern).",
      "Kolaborasi & Version Control: Membiasakan diri dengan alur kerja git & GitHub dalam pengembangan proyek tim, membaca dokumentasi teknis, dan memecahkan kendala pemrograman secara sistematis."
    ],
    skills: [
      "Logika Dasar Komputer",
      "Algoritma Efisien",
      "Clean Code Fundamentals",
      "Pemrograman Web (HTML/CSS/JS)",
      "PHP & MySQL Database",
      "Git & Version Control",
      "Rekayasa Perangkat Lunak"
    ],
    highlights: [
      "Penguasaan logika dasar komputer dan penyusunan algoritma efisien.",
      "Penerapan prinsip clean code pada penulisan modul program web.",
      "Membangun dasar kerja tim, problem-solving, dan kedisiplinan standar industri software."
    ],
    images: [
      {
        src: "/image/smk2buduran.jpg",
        alt: "Dokumentasi Fundamental Coding & Logika Algoritma",
        title: "Fundamental Coding & Logika Algoritma",
        caption: "Aktivitas pembelajaran pemrograman, penguatan logika komputer, dan penulisan clean code di SMKN 2 Buduran Sidoarjo."
      },
      {
        src: "/image/TOKO TUNAI BGDARK mockup fix.png",
        alt: "Proyek Aplikasi Web Sekolah",
        title: "Pengembangan Perangkat Lunak Kejuruan",
        caption: "Salah satu rancangan arsitektur antarmuka dan sistem aplikasi yang dikembangkan selama masa studi kejuruan RPL."
      }
    ]
  },
  {
    id: "disnaker-jatim",
    period: "September 2024 — Maret 2025",
    status: "Selesai (6 Bulan)",
    role: "IT Support & Multimedia Intern",
    institution: "Dinas Tenaga Kerja (Disnaker) Prov. Jawa Timur",
    location: "Surabaya, Jawa Timur",
    icon: "ri-building-line",
    category: "Pengalaman Kerja / Magang",
    summary:
      "Menjalankan dukungan teknis hardware & software, perancangan media publikasi event resmi, produksi video, hingga administrasi data kedinasan.",
    description: [
      "Dukungan Teknis & Hardware: Bertanggung jawab atas pemeliharaan dan reparasi hardware komputer kantor, instalasi periferal, serta melakukan penanganan dan perbaikan bug pada sistem software operasional dinas.",
      "Pengembangan Media & Desain: Merancang materi desain grafis untuk kebutuhan publisitas event resmi kedinasan, serta mengelola proses pengambilan gambar (videografer) dan penyuntingan video (video editor).",
      "Administrasi & Pelayanan: Mengelola entri data (data entry) dokumen kedinasan dengan akurat serta membangun komunikasi dan hubungan baik (guest relations) dengan para tamu dan mitra instansi."
    ],
    skills: [
      "Hardware Maintenance & Repair",
      "Software Bug Fixing",
      "Graphic Design (Event Publikasi)",
      "Videography & Video Editing",
      "Data Entry & Manajemen Dokumen",
      "Guest Relations & Komunikasi",
      "IT Support Operasional"
    ],
    highlights: [
      "Pemeliharaan dan perbaikan berkala pada perangkat hardware komputer dan bug sistem software dinas.",
      "Produksi konten visual publikasi event kedinasan (desain grafis, videografi, dan video editing).",
      "Pelaksanaan entri data dokumen resmi dan pelayanan tamu instansi dengan komunikasi profesional."
    ],
    images: [
      {
        src: "/image/galangdisnaker.jpg",
        alt: "Kantor Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Timur",
        title: "Kantor Disnaker Prov. Jawa Timur",
        caption: "Gedung operasional Dinas Tenaga Kerja Prov. Jawa Timur tempat pelaksanaan magang IT Support & Multimedia."
      },
      {
        src: "/image/Logo Provinsi Jawa Timur (Koleksilogo.com).png",
        alt: "Logo Pemerintah Provinsi Jawa Timur",
        title: "Instansi Pemerintah Provinsi Jawa Timur",
        caption: "Pelayanan operasional sistem teknologi informasi dan multimedia di bawah naungan Pemprov Jawa Timur."
      }
    ]
  },
  {
    id: "freelance-fullstack",
    period: "Mei 2025 — Sekarang",
    status: "Aktif",
    role: "Freelance Full-Stack Developer",
    institution: "Client Projects & Independent",
    location: "Remote / Jawa Timur",
    icon: "ri-code-box-line",
    category: "Pengalaman Kerja / Freelance",
    summary:
      "Membangun berbagai solusi web interaktif dan sistem manajemen untuk klien nyata seperti TPQ Al Hikmah, HeartHorizon, MNG Group, dan lainnya.",
    description: [
      "Full-Stack Web Development: Merancang dan mengembangkan solusi aplikasi web end-to-end dengan performa tinggi, keamanan teruji, dan antarmuka pengguna yang modern.",
      "Portofolio Proyek Klien:",
      "• TPQ Al Hikmah: Sistem informasi dan manajemen pembelajaran santri untuk pencatatan akademik dan administrasi terstruktur.",
      "• HeartHorizon: Platform konsultasi psikologi dan kesehatan mental dengan sistem booking layanan dan dashboard interaktif.",
      "• MNG Group Web App: Aplikasi web korporasi terintegrasi untuk portofolio bisnis dan pengelolaan layanan perusahaan.",
      "• Dan berbagai custom web application lainnya yang disesuaikan dengan kebutuhan proses bisnis klien."
    ],
    skills: [
      "Full-Stack Web Development",
      "Laravel & PHP",
      "React.js & Next.js",
      "PostgreSQL & MySQL",
      "RESTful API Integration",
      "UI/UX Implementation",
      "Client Management & Delivery"
    ],
    highlights: [
      "Berhasil mengembangkan dan meluncurkan sistem manajemen santri untuk TPQ Al Hikmah.",
      "Merancang dan mengimplementasikan platform kesehatan mental HeartHorizon.",
      "Membangun aplikasi web korporasi MNG Group Web App dengan arsitektur modern dan skalabel."
    ],
    images: [
      {
        src: "/image/TOKO TUNAI BGDARK mockup fix.png",
        alt: "UI/UX & Web Application Implementation",
        title: "Implementasi Proyek Aplikasi Web Klien",
        caption: "Contoh arsitektur antarmuka dan perancangan dashboard interaktif yang dibangun untuk solusi kebutuhan bisnis klien."
      },
      {
        src: "/image/Photo by Pankaj Patel on Unsplash.jpg",
        alt: "Modern Web Development Workflow",
        title: "Full-Stack Development Workflow",
        caption: "Penerapan standar modern dalam pengembangan backend Laravel/Node.js dan frontend React/Next.js."
      }
    ]
  },
  {
    id: "pens-surabaya",
    period: "Agustus 2025 — Sekarang",
    status: "Aktif (Sedang Berjalan)",
    role: "Mahasiswa D3 Teknik Informatika",
    institution: "Politeknik Elektronika Negeri Surabaya (PENS)",
    location: "Surabaya, Jawa Timur",
    icon: "ri-terminal-box-line",
    category: "Pendidikan Tinggi",
    summary:
      "Program Studi: D3 Teknik Informatika — Mendalami pengembangan perangkat lunak terapan, Algoritma & Struktur Data, serta Full-Stack Development.",
    description: [
      "Pengembangan Perangkat Lunak: Mendalami arsitektur perangkat lunak dari tingkat fundamental hingga terapan, mencakup Algoritma & Struktur Data, Sistem Informasi, serta Pengelolaan Database tingkat lanjut.",
      "Full-Stack Development: Mengembangkan aplikasi web interaktif pada sisi Frontend menggunakan React.js, serta membangun arsitektur Backend Engineering yang andal dan terstruktur.",
      "Integrasi Teknologi Modern: Mengeksplorasi kecerdasan buatan (AI Integration & Automation) dan komputasi modern untuk menciptakan solusi perangkat lunak yang berdaya guna tinggi di dunia nyata."
    ],
    skills: [
      "D3 Teknik Informatika",
      "Algoritma & Struktur Data",
      "Frontend React.js",
      "Backend Engineering",
      "Sistem Informasi",
      "Database Management",
      "AI Integration & Automation"
    ],
    highlights: [
      "Studi di program studi D3 Teknik Informatika PENS dengan kurikulum vokasi teknologi terapan terdepan.",
      "Pendalaman arsitektur perangkat lunak, algoritma kompleks, dan sistem informasi.",
      "Pengembangan aplikasi web modern mengombinasikan React.js di sisi frontend dan backend engineering yang kokoh."
    ],
    images: [
      {
        src: "/image/galangpens.jpg",
        alt: "Galang Arrauf Pramudito - Mahasiswa D3 Teknik Informatika PENS",
        title: "Studi D3 Teknik Informatika PENS",
        caption: "Fokus mendalami keahlian rekayasa perangkat lunak terapan, sistem informasi, dan teknologi modern di PENS."
      },
      {
        src: "/image/Photo by Pankaj Patel on Unsplash.jpg",
        alt: "Riset dan Praktikum Komputasi",
        title: "Eksplorasi Algoritma & Full-Stack",
        caption: "Pendalaman algoritma, struktur data, frontend React.js, dan arsitektur backend di lingkungan akademik PENS."
      }
    ]
  }
];

export default function AboutClient({ initialTimeline = [], initialProfile = null }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  // Normalize timeline data from database if available
  const timelineData = useMemo(() => {
    if (initialTimeline && initialTimeline.length > 0) {
      return initialTimeline.map((item) => {
        // Normalize description into array
        let descriptionArray = [];
        if (Array.isArray(item.description)) {
          descriptionArray = item.description;
        } else if (typeof item.description === "string") {
          descriptionArray = item.description.includes("|")
            ? item.description.split("|").map((s) => s.trim()).filter(Boolean)
            : item.description.split("\n").map((s) => s.trim()).filter(Boolean);
        }

        // Normalize skills into array
        let skillsArray = [];
        if (Array.isArray(item.skills)) {
          skillsArray = item.skills;
        } else if (typeof item.skills === "string") {
          skillsArray = item.skills.includes("|")
            ? item.skills.split("|").map((s) => s.trim()).filter(Boolean)
            : item.skills.split(",").map((s) => s.trim()).filter(Boolean);
        }

        // Normalize highlights into array
        let highlightsArray = [];
        if (Array.isArray(item.highlights)) {
          highlightsArray = item.highlights;
        } else if (typeof item.highlights === "string") {
          highlightsArray = item.highlights.includes("|")
            ? item.highlights.split("|").map((s) => s.trim()).filter(Boolean)
            : item.highlights.split("\n").map((s) => s.trim()).filter(Boolean);
        }

        // Normalize images from related timeline_images
        let imagesArray = [];
        if (Array.isArray(item.timeline_images) && item.timeline_images.length > 0) {
          imagesArray = item.timeline_images.map((img) => ({
            src: img.image_url,
            alt: img.caption || item.role,
            title: img.caption || item.role,
            caption: img.description || img.caption || "",
          }));
        } else if (Array.isArray(item.images) && item.images.length > 0) {
          imagesArray = item.images;
        } else {
          const matchedFallback = FALLBACK_TIMELINE.find(
            (fb) =>
              fb.institution?.toLowerCase() === item.institution?.toLowerCase() ||
              fb.role?.toLowerCase() === item.role?.toLowerCase()
          );
          if (matchedFallback && matchedFallback.images) {
            imagesArray = matchedFallback.images;
          }
        }

        return {
          id: item.id,
          period: item.period || "",
          status: item.status || "Aktif",
          role: item.role || "",
          institution: item.institution || "",
          location: item.location || "",
          icon: item.icon || "ri-briefcase-line",
          category: item.category || "Pendidikan",
          summary: item.summary || "",
          description: descriptionArray,
          skills: skillsArray,
          highlights: highlightsArray,
          images: imagesArray,
        };
      });
    }

    return FALLBACK_TIMELINE;
  }, [initialTimeline]);

  // Keyboard shortcut for lightbox (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [selectedImage]);

  const filteredTimeline = useMemo(() => {
    if (activeTab === "all") return timelineData;
    return timelineData.filter((item) => {
      const cat = item.category || "";
      if (activeTab === "education") return cat.includes("Pendidikan");
      if (activeTab === "experience") return cat.includes("Kerja") || cat.includes("Magang") || cat.includes("Freelance");
      return true;
    });
  }, [activeTab, timelineData]);

  const fullName = initialProfile?.full_name || "Galang Arrauf Pramudito";
  const firstName = fullName.split(" ")[0];
  const restName = fullName.split(" ").slice(1).join(" ");
  const avatarUrl = initialProfile?.avatar_url || "/image/gambar galang 2.jpg";

  return (
    <main className="about-page min-h-[100dvh] bg-bg-dark text-white p-4 sm:p-8 md:p-16 relative overflow-x-hidden selection:bg-accent selection:text-bg-dark">
      {/* Dark mode switch & Background glow */}
      <DarkModeToggle />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-15">
        <div className="absolute left-[-15%] top-[-10%] w-[55%] h-[40%] bg-accent blur-[140px] rounded-full"></div>
        <div className="absolute right-[-15%] top-[40%] w-[55%] h-[40%] bg-primary blur-[140px] rounded-full"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Navigation */}
        <div className="mb-8 md:mb-12 pt-2 md:pt-0">
          <BackButton href="/" label="Kembali ke Beranda" />
        </div>

        {/* Hero Section */}
        <section className="mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-gray-300 text-xs font-mono tracking-wider uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Tentang Saya &amp; Perjalanan Karir</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Mengenal Lebih Dekat{" "}
                <span className="text-accent font-serif italic font-normal">
                  {firstName} {restName}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 font-normal leading-relaxed mb-6">
                Web Developer dari Sidoarjo yang berfokus pada pengembangan sistem backend, arsitektur database, serta integrasi Artificial Intelligence untuk membangun solusi digital yang andal dan bermanfaat.
              </p>

              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed mb-6">
                Saya percaya bahwa pemrograman bukan sekadar menulis baris kode, melainkan tentang merancang solusi yang efisien, terukur, dan mampu menjawab kebutuhan nyata. Dengan latar belakang Rekayasa Perangkat Lunak, pengalaman di bidang IT Support pada instansi pemerintahan Provinsi Jawa Timur, serta pendidikan Teknik Informatika di Politeknik Elektronika Negeri Surabaya (PENS), saya terus mengembangkan kemampuan dalam rekayasa perangkat lunak, pemecahan masalah, dan teknologi modern.
              </p>
              {/* Quick info pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card-bg border border-white/10 text-xs font-medium text-gray-200 shadow-sm">
                  <i className="ri-map-pin-2-line text-accent text-sm" />
                  <span>Sidoarjo &amp; Surabaya, ID</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card-bg border border-white/10 text-xs font-medium text-gray-200 shadow-sm">
                  <i className="ri-code-s-slash-line text-accent text-sm" />
                  <span>Backend &amp; AI Automation</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card-bg border border-white/10 text-xs font-medium text-gray-200 shadow-sm">
                  <i className="ri-graduation-cap-line text-accent text-sm" />
                  <span>Mahasiswa D3 Teknik Informatika PENS</span>
                </div>
              </div>
            </div>

            {/* Profile Avatar Card */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-card-bg group">
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <p className="text-white font-bold text-base leading-tight">{fullName}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Software Developer &amp; Student</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Values / Pillars */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-card-bg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent text-xl mb-4">
                <i className="ri-shield-check-line"></i>
              </div>
              <h3 className="font-bold text-base text-white mb-2">Clean &amp; Maintainable Code</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                Menulis kode yang bersih, terdokumentasi rapi, dan mudah dirawat untuk memastikan sistem dapat berkembang tanpa kendala teknis di masa mendatang.
              </p>
            </div>

            <div className="bg-card-bg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent text-xl mb-4">
                <i className="ri-brain-line"></i>
              </div>
              <h3 className="font-bold text-base text-white mb-2">AI-Driven Efficiency</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                Menggabungkan kecerdasan buatan ke dalam alur kerja backend dan aplikasi untuk mengotomatisasi proses bisnis yang berulang dan meningkatkan produktivitas.
              </p>
            </div>

            <div className="bg-card-bg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent text-xl mb-4">
                <i className="ri-fire-line"></i>
              </div>
              <h3 className="font-bold text-base text-white mb-2">Continuous Learning</h3>
              <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                Selalu proaktif mengikuti perkembangan teknologi terkini, mulai dari arsitektur cloud hingga framework modern guna memberikan hasil optimal.
              </p>
            </div>
          </div>
        </section>

        {/* Section Heading & Filter */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Milestone &amp; Experience</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Timeline Perjalanan</h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === "all"
                  ? "bg-accent text-bg-dark font-bold shadow-md"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === "education"
                  ? "bg-accent text-bg-dark font-bold shadow-md"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Pendidikan
              </button>
              <button
                onClick={() => setActiveTab("experience")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === "experience"
                  ? "bg-accent text-bg-dark font-bold shadow-md"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Pengalaman
              </button>
            </div>
          </div>
        </section>

        {/* Visual Timeline Section */}
        <section className="relative mb-24">
          {/* Main vertical line */}
          <div className="absolute left-4 sm:left-8 top-3 bottom-8 w-[2px] bg-gradient-to-b from-accent via-white/20 to-white/5 pointer-events-none"></div>

          <div className="space-y-12 sm:space-y-16">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative pl-12 sm:pl-20 group">
                {/* Timeline node icon */}
                <div className="absolute left-2 sm:left-6 top-1.5 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card-bg border-2 border-white/30 group-hover:border-accent group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center z-10">
                  <i className={`${item.icon || "ri-briefcase-line"} text-sm sm:text-base text-accent`}></i>
                </div>

                {/* Timeline Card */}
                <div className="bg-card-bg border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-white/20 transition-all shadow-xl">
                  {/* Top Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white font-semibold">
                        {item.period}
                      </span>
                      {item.status && (
                        <span className="px-2.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-medium">
                          {item.status}
                        </span>
                      )}
                    </div>
                    {item.location && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-map-pin-line text-accent" />
                        <span>{item.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Role and Institution */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-accent transition-colors">
                    {item.role}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <i className="ri-building-4-line text-gray-500" />
                    <span>{item.institution}</span>
                  </p>

                  {item.summary && (
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 font-normal">
                      {item.summary}
                    </p>
                  )}

                  {/* Deep Story Paragraphs */}
                  {item.description && item.description.length > 0 && (
                    <div className="space-y-3 mb-6 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 sm:p-5 text-gray-400 text-xs sm:text-sm leading-relaxed font-light">
                      {item.description.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {/* Highlights Bullet points */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                        Poin Kunci &amp; Pencapaian:
                      </p>
                      <ul className="space-y-2">
                        {item.highlights.map((hl, hlIdx) => (
                          <li key={hlIdx} className="text-xs sm:text-sm text-gray-300 flex items-start gap-2.5">
                            <i className="ri-checkbox-circle-fill text-accent text-sm mt-0.5 shrink-0" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills Tag Section */}
                  {item.skills && item.skills.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                        Keahlian &amp; Tools yang Didapatkan:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-medium hover:border-accent/40 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo & Media Showcase (Interactive Gallery) */}
                  {item.images && item.images.length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                      <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4 flex items-center gap-1.5">
                        <i className="ri-camera-3-line text-accent" />
                        <span>Foto &amp; Dokumentasi Penunjang:</span>
                        <span className="text-[10px] text-gray-500 font-normal ml-auto">(Klik gambar untuk perbesar)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setSelectedImage(img)}
                            className="group/img relative aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-accent/50 cursor-pointer transition-all shadow-md flex flex-col justify-end p-4"
                          >
                            <Image
                              src={img.src}
                              alt={img.alt || img.title || "Foto Penunjang"}
                              fill
                              className="object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, 400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                            <div className="relative z-10">
                              <p className="text-white font-bold text-xs sm:text-sm line-clamp-1">{img.title}</p>
                              {img.caption && (
                                <p className="text-gray-300 text-[11px] line-clamp-1 mt-0.5">{img.caption}</p>
                              )}
                            </div>
                            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <i className="ri-fullscreen-line text-xs"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA / Next Steps */}
        <section className="bg-gradient-to-br from-card-bg to-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden mb-12">
          <div className="max-w-2xl mx-auto relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Tertarik Berkolaborasi atau Ingin Diskusi Proyek?
            </h3>
            <p className="text-gray-400 text-sm sm:text-base font-light mb-8 leading-relaxed">
              Saya selalu terbuka untuk peluang magang, freelance, proyek pengembangan web Laravel/Full-Stack, hingga integrasi kecerdasan buatan.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href="/projects"
                className="px-6 sm:px-8 py-3 rounded-full bg-accent text-bg-dark font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl inline-flex items-center gap-1.5"
              >
                <span>Lihat Portfolio Proyek</span>
                <i className="ri-arrow-right-line ml-1" />
              </Link>
              <Link
                href="/certificates"
                className="px-6 sm:px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                <i className="ri-award-line text-accent" />
                <span>Sertifikat &amp; Prestasi</span>
              </Link>
              <Link
                href="/#contact"
                className="px-6 sm:px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                <i className="ri-mail-send-line text-accent" />
                <span>Hubungi Saya</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedImage(null)}
          />

          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="fixed top-4 right-4 z-[510] w-11 h-11 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors shadow-2xl"
            aria-label="Tutup Preview"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>

          {/* Modal Container */}
          <div className="relative z-10 max-w-4xl w-full bg-card-bg border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative w-full max-h-[65vh] min-h-[260px] sm:min-h-[400px] bg-black flex items-center justify-center">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt || selectedImage.title || "Preview"}
                width={1200}
                height={800}
                className="object-contain max-h-[65vh] w-auto h-auto"
                priority
              />
            </div>
            <div className="p-6 bg-card-bg border-t border-white/10">
              <h4 className="font-bold text-lg text-white mb-1">{selectedImage.title}</h4>
              {selectedImage.caption && (
                <p className="text-sm text-gray-300 leading-relaxed font-light">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
