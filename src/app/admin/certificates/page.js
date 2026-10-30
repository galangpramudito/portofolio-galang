"use client"

import CrudManager from '@/app/admin/CrudManager'

const certificateFields = [
  { key: 'title', label: 'Judul Sertifikat', type: 'text', required: true, group: 'Informasi Utama' },
  { key: 'issuer', label: 'Penerbit', type: 'text', required: true, group: 'Informasi Utama' },
  { key: 'issue_date', label: 'Tanggal Terbit (kosongkan jika tidak ada)', type: 'date', group: 'Informasi Utama' },
  { key: 'credential_id', label: 'Credential ID (opsional)', type: 'text', group: 'Detail Kredensial' },
  { key: 'credential_url', label: 'Link Verifikasi Credential (opsional)', type: 'url', group: 'Detail Kredensial' },
  { key: 'image_url', label: 'Thumbnail Sertifikat (Otomatis dari PDF jika kosong)', type: 'image', group: 'Media & Deskripsi' },
  {
    key: 'verify_url',
    label: 'File PDF Sertifikat (Upload atau Link eksternal)',
    type: 'url',
    uploadBucket: 'certificates',
    uploadLabel: 'PDF',
    accept: 'application/pdf',
    placeholder: 'Upload file PDF atau tempel link PDF (GDrive, Supabase, dsb)',
    group: 'Media & Deskripsi',
  },
  { key: 'description', label: 'Deskripsi', type: 'textarea', group: 'Media & Deskripsi' },
]

const certificateColumns = [
  { key: 'image_url', label: 'Thumbnail' },
  { key: 'title', label: 'Judul' },
  { key: 'issuer', label: 'Penerbit' },
  {
    key: 'issue_date',
    label: 'Tanggal Terbit',
    render: (val) => (
      <span className="text-xs text-gray-400 font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
        {val ? new Date(val).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }) : '—'}
      </span>
    ),
  },
]

const relatedSection = {
  table: 'certificate_images',
  foreignKey: 'certificate_id',
  label: 'Halaman Tambahan',
  addLabel: '+ Tambah Halaman',
  hasCaption: false,
  bucket: 'certificates',
  showWhen: () => true,
}

export default function CertificatesPage() {
  return (
    <CrudManager
      table="certificates"
      title="Sertifikat"
      description="Kelola lisensi, sertifikat keahlian, dan dokumen kompetensi Anda."
      fields={certificateFields}
      columns={certificateColumns}
      relatedSection={relatedSection}
      featuredLimit={3}
      searchFields={['title', 'issuer']}
    />
  )
}