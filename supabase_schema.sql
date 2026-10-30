-- ============================================================
-- Portofolang — Supabase Schema (Final)
-- Jalankan di Supabase → SQL Editor
-- ============================================================


-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- TABLE: project_types
-- Kategori proyek dinamis (Website, Aplikasi, Desain, Video Editing)
-- ============================================================
create table public.project_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger trg_project_types_updated_at
  before update on public.project_types
  for each row execute function update_updated_at();

alter table public.project_types enable row level security;
create policy "public read project_types" on public.project_types for select using (true);


-- ============================================================
-- TABLE: projects
-- Web, bot, android, desain, video — satu tabel
-- ============================================================
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text,
  description     text,
  tags            text[] default '{}',
  project_type_id uuid references public.project_types(id) on delete set null,
  type            text default 'web',
  thumbnail_url   text,
  github_url      text,
  demo_url        text,           -- untuk web: live demo URL
  play_store_url  text,           -- untuk android: Play Store URL (opsional)
  apk_url         text,           -- untuk android: download APK langsung
  video_url       text,           -- untuk video-editing: video URL
  platform        text default 'youtube',
  status          text default 'completed' check (status in ('completed', 'wip', 'private')),
  featured        boolean default false,
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();


-- ============================================================
-- TABLE: project_images
-- Annotated screenshots — dipakai untuk Android apps
-- (bisa dipakai untuk tipe project lain juga kalau nanti perlu)
-- ============================================================
create table public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  image_url   text not null,
  caption     text,              -- judul singkat, mis. "Halaman Pembayaran"
  description text,              -- deskripsi panjang, mis. "Mendukung GoPay, OVO, QRIS..."
  sort_order  integer default 0,
  created_at  timestamptz default now()
);


-- ============================================================
-- TABLE: designs
-- Satu row = satu project design
-- ============================================================
create table public.designs (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  category       text default 'design',
  cover_image_url text,          -- gambar cover yang tampil di grid homepage
  description    text,
  sort_order     integer default 0,
  featured       boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger trg_designs_updated_at
  before update on public.designs
  for each row execute function update_updated_at();


-- ============================================================
-- TABLE: design_images
-- Simple gallery per project design (no caption needed)
-- ============================================================
create table public.design_images (
  id          uuid primary key default gen_random_uuid(),
  design_id   uuid not null references public.designs(id) on delete cascade,
  image_url   text not null,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);


-- ============================================================
-- TABLE: videos
-- ============================================================
create table public.videos (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  thumbnail_url  text,
  video_url      text not null,
  platform       text default 'youtube' check (platform in ('youtube', 'drive', 'vimeo')),
  description    text,
  featured       boolean default false,
  sort_order     integer default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger trg_videos_updated_at
  before update on public.videos
  for each row execute function update_updated_at();


-- ============================================================
-- TABLE: skills
-- ============================================================
create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  "desc"      text,
  icon        text,
  items       text[] default '{}',
  highlight   boolean default false,
  span        text default 'col-span-1',
  color       text,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger trg_skills_updated_at
  before update on public.skills
  for each row execute function update_updated_at();


-- ============================================================
-- RLS: read publik, write hanya via service_role
-- ============================================================
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.designs        enable row level security;
alter table public.design_images  enable row level security;
alter table public.videos         enable row level security;
alter table public.skills         enable row level security;

create policy "public read projects"       on public.projects       for select using (true);
create policy "public read project_images" on public.project_images for select using (true);
create policy "public read designs"        on public.designs        for select using (true);
create policy "public read design_images"  on public.design_images  for select using (true);
create policy "public read videos"         on public.videos         for select using (true);
create policy "public read skills"         on public.skills         for select using (true);


-- ============================================================
-- SEED: projects
-- thumbnail_url dikosongkan — isi via admin panel setelah deploy
-- ============================================================
insert into public.projects (title, description, tags, type, github_url, status, featured, sort_order) values
  (
    'Bot WA Reminder Absensi',
    'Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp.',
    '{"Node.js","Baileys API","Automation"}',
    'bot',
    'https://github.com/galangg22/bot-presensi',
    'completed',
    true,
    1
  ),
  (
    'Sistem Web TPQ Al-Hikmah',
    'Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru.',
    '{"Web Dev","HTML","CSS"}',
    'web',
    'https://github.com/galangg22/alhikmah',
    'completed',
    false,
    4
  ),
  (
    'ThriftyFinds E-Commerce',
    'Katalog e-commerce modern untuk produk thrifting.',
    '{"React/Next.js","Tailwind","E-Commerce"}',
    'web',
    'https://github.com/galangg22/thriftyfinds',
    'completed',
    true,
    2
  ),
  (
    'HeartHorizon / Online Class',
    'Aplikasi e-learning interaktif.',
    '{"LMS","Fullstack","Database"}',
    'web',
    'https://github.com/galangg22/hearthorizon',
    'completed',
    false,
    3
  );


-- ============================================================
-- TABLE: certificates
-- ============================================================
create table public.certificates (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  issuer          text not null,               -- "Google", "Dicoding", "BSSN", dll
  credential_id   text,                        -- nullable — ID credential (teks biasa)
  credential_url  text,                        -- nullable — link verifikasi credential
  issue_date      date,                        -- nullable — sertif webinar sering tidak ada tanggal
  image_url       text,                        -- foto/scan sertifikat (dari Storage)
  verify_url      text,                        -- nullable — link PDF sertifikat
  description     text,                        -- konteks singkat, opsional
  featured        boolean default false,       -- tampil di homepage section Certifications
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger trg_certificates_updated_at
  before update on public.certificates
  for each row execute function update_updated_at();

alter table public.certificates enable row level security;
create policy "public read certificates" on public.certificates for select using (true);


-- ============================================================
-- TABLE: certificate_images
-- Halaman tambahan sertifikat (halaman 2, 3, dst)
-- Halaman 1 tetap di certificates.image_url
-- ============================================================
create table public.certificate_images (
  id              uuid primary key default gen_random_uuid(),
  certificate_id  uuid not null references public.certificates(id) on delete cascade,
  image_url       text not null,
  sort_order      integer default 0,   -- urutan halaman (2, 3, dst)
  created_at      timestamptz default now()
);

alter table public.certificate_images enable row level security;
create policy "public read certificate_images" on public.certificate_images for select using (true);


-- ============================================================
-- TABLE: timeline
-- Data milestone pendidikan, magang, kerja, freelance
-- ============================================================
create table public.timeline (
  id          uuid primary key default gen_random_uuid(),
  period      text not null,
  status      text default 'Aktif',
  role        text not null,
  institution text not null,
  location    text,
  icon        text default 'ri-briefcase-line',
  category    text default 'Pendidikan',
  summary     text,
  description text[] default '{}',
  skills      text[] default '{}',
  highlights  text[] default '{}',
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger trg_timeline_updated_at
  before update on public.timeline
  for each row execute function update_updated_at();

alter table public.timeline enable row level security;
create policy "public read timeline" on public.timeline for select using (true);


-- ============================================================
-- TABLE: timeline_images
-- Foto dan dokumentasi penunjang per milestone timeline
-- ============================================================
create table public.timeline_images (
  id           uuid primary key default gen_random_uuid(),
  timeline_id  uuid not null references public.timeline(id) on delete cascade,
  image_url    text not null,
  caption      text,
  description  text,
  sort_order   integer default 0,
  created_at   timestamptz default now()
);

alter table public.timeline_images enable row level security;
create policy "public read timeline_images" on public.timeline_images for select using (true);


-- ============================================================
-- TABLE: profile
-- Profil dan dokumen CV
-- ============================================================
create table public.profile (
  id                  integer primary key default 1,
  full_name           text not null,
  bio                 text,
  availability_status text default 'available',
  cv_url              text,
  cv_url_en           text,
  avatar_url          text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create trigger trg_profile_updated_at
  before update on public.profile
  for each row execute function update_updated_at();

alter table public.profile enable row level security;
create policy "public read profile" on public.profile for select using (true);

insert into public.profile (id, full_name, availability_status)
values (1, 'Galang Arrauf Pramudito', 'available')
on conflict (id) do nothing;


-- ============================================================
-- INDEXES: Foreign keys & sorting performance
-- ============================================================
create index if not exists idx_projects_project_type_id on public.projects(project_type_id);
create index if not exists idx_projects_sort_order on public.projects(sort_order);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_project_images_project_id on public.project_images(project_id);
create index if not exists idx_project_images_sort_order on public.project_images(sort_order);
create index if not exists idx_designs_sort_order on public.designs(sort_order);
create index if not exists idx_design_images_design_id on public.design_images(design_id);
create index if not exists idx_videos_sort_order on public.videos(sort_order);
create index if not exists idx_skills_sort_order on public.skills(sort_order);
create index if not exists idx_certificates_sort_order on public.certificates(sort_order);
create index if not exists idx_certificate_images_certificate_id on public.certificate_images(certificate_id);
create index if not exists idx_timeline_sort_order on public.timeline(sort_order);
create index if not exists idx_timeline_images_timeline_id on public.timeline_images(timeline_id);

