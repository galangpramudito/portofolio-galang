"use client"

import CrudManager from '@/app/admin/CrudManager'

const timelineFields = [
  // Group: Informasi Utama
  { key: 'role', label: 'Peran / Posisi', type: 'text', required: true, group: 'Informasi Utama', placeholder: 'Contoh: Mahasiswa D3 Teknik Informatika' },
  { key: 'institution', label: 'Nama Instansi / Lembaga', type: 'text', required: true, group: 'Informasi Utama', placeholder: 'Contoh: Politeknik Elektronika Negeri Surabaya (PENS)' },
  { key: 'period', label: 'Periode Waktu', type: 'text', required: true, group: 'Informasi Utama', placeholder: 'Contoh: Agustus 2025 — Sekarang' },
  { key: 'status', label: 'Status', type: 'text', group: 'Informasi Utama', placeholder: 'Contoh: Aktif (Sedang Berjalan) / Lulus / Selesai' },
  {
    key: 'category',
    label: 'Kategori',
    type: 'select',
    required: true,
    group: 'Informasi Utama',
    options: [
      { label: 'Pendidikan Menengah', value: 'Pendidikan Menengah' },
      { label: 'Pendidikan Tinggi', value: 'Pendidikan Tinggi' },
      { label: 'Pengalaman Kerja / Magang', value: 'Pengalaman Kerja / Magang' },
      { label: 'Pengalaman Kerja / Freelance', value: 'Pengalaman Kerja / Freelance' },
    ]
  },
  { key: 'location', label: 'Lokasi', type: 'text', group: 'Informasi Utama', placeholder: 'Contoh: Surabaya, Jawa Timur' },
  { key: 'icon', label: 'Icon Class (Remixicon)', type: 'text', group: 'Informasi Utama', placeholder: 'Contoh: ri-graduation-cap-line, ri-building-line, ri-terminal-box-line, ri-code-box-line' },

  // Group: Konten & Cerita
  { key: 'summary', label: 'Ringkasan Singkat (Summary)', type: 'textarea', group: 'Konten & Cerita', placeholder: 'Ringkasan singkat tentang milestone ini' },
  { key: 'description', label: 'Paragraf Cerita Mendalam (Pisahkan dengan tanda | )', type: 'tags', delimiter: '|', multiline: true, rows: 4, group: 'Konten & Cerita', placeholder: 'Paragraf 1 | Paragraf 2 (bebas menggunakan tanda koma di dalam kalimat)' },
  { key: 'skills', label: 'Keahlian & Tools yang Didapatkan (Pisahkan dengan tanda | )', type: 'tags', delimiter: '|', group: 'Konten & Cerita', placeholder: 'Laravel & PHP | React.js | MySQL | Git & Version Control' },
  { key: 'highlights', label: 'Poin Kunci & Pencapaian (Pisahkan dengan tanda | )', type: 'tags', delimiter: '|', multiline: true, rows: 3, group: 'Konten & Cerita', placeholder: 'Poin pencapaian 1 | Poin pencapaian 2' },
]

const timelineColumns = [
  { key: 'role', label: 'Peran' },
  { key: 'institution', label: 'Instansi' },
  { key: 'period', label: 'Periode' },
  {
    key: 'category',
    label: 'Kategori',
    render: (val) => (
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
        {val || '-'}
      </span>
    ),
  },
  { key: 'status', label: 'Status' },
]

const relatedSection = {
  table: 'timeline_images',
  foreignKey: 'timeline_id',
  label: 'Foto & Dokumentasi Penunjang',
  addLabel: '+ Tambah Foto Penunjang',
  hasCaption: true,
  bucket: 'thumbnails',
  showWhen: () => true,
}

export default function TimelineAdminPage() {
  return (
    <CrudManager
      table="timeline"
      title="Perjalanan"
      description="Kelola riwayat pendidikan, pengalaman kerja, dan milestone karier Anda."
      fields={timelineFields}
      columns={timelineColumns}
      relatedSection={relatedSection}
      searchFields={['role', 'institution', 'period']}
    />
  )
}
