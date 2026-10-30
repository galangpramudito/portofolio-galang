"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../components/ToastProvider'
import { useSafeNavigation } from '../hooks/useNavigation'
import { apiRequest, uploadFile, MAX_UPLOAD_BYTES } from '@/app/admin/utils/api'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../components/cropImage'

export default function ProfileAdmin() {
  const [profile, setProfile] = useState({
    id: 1,
    full_name: '',
    bio: '',
    availability_status: 'available',
    cv_url: '',
    cv_url_en: '',
    avatar_url: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadingCvEn, setUploadingCvEn] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [tableMissing, setTableMissing] = useState(false)

  // Crop states
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const toast = useToast()
  const { redirectToLogin } = useSafeNavigation()

  const fetchProfileData = useCallback(async () => {
    try {
      const rows = await apiRequest('/api/admin/profile', { fallback: 'Gagal memuat profil' })
      if (Array.isArray(rows) && rows.length > 0) {
        setProfile(prev => ({ ...prev, ...rows[0] }))
      }
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      if (err.message && /relation.*profile.*does not exist/i.test(err.message)) {
        setTableMissing(true)
      } else {
        toast.error('Gagal memuat profil: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [toast, redirectToLogin])

  useEffect(() => {
    let ignore = false
    async function init() {
      if (!ignore) {
        await fetchProfileData()
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [fetchProfileData])

  const handleRetryFetch = () => {
    setLoading(true)
    setTableMissing(false)
    fetchProfileData()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = { ...profile, id: profile.id || 1 }

      let res
      try {
        res = await apiRequest('/api/admin/profile', {
          method: 'PUT',
          body: payload,
          fallback: 'Gagal memperbarui profil'
        })
      } catch (putErr) {
        if (putErr.status === 404) {
          res = await apiRequest('/api/admin/profile', {
            method: 'POST',
            body: payload,
            fallback: 'Gagal membuat profil baru'
          })
        } else {
          throw putErr
        }
      }

      const updated = Array.isArray(res) ? res[0] : res
      if (updated) setProfile(prev => ({ ...prev, ...updated }))
      toast.success('Profil berhasil disimpan!')
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      if (err.message && /relation.*profile.*does not exist/i.test(err.message)) {
        setTableMissing(true)
      }
      toast.error('Gagal menyimpan profil: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file, bucket, stateSetter, urlField) => {
    if (!file) return
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('File terlalu besar. Maksimal 4MB.')
      return
    }
    stateSetter(true)
    try {
      const publicUrl = await uploadFile(file, bucket)
      setProfile(prev => ({ ...prev, [urlField]: publicUrl }))
      toast.success('File berhasil diunggah')
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error(err.message || 'Gagal mengunggah file')
    } finally {
      stateSetter(false)
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleAvatarSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error('File foto terlalu besar. Maksimal 4MB.')
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result)
        setCropModalOpen(true)
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropImage = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      setCropModalOpen(false)
      setImageSrc(null)
      const croppedFile = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' })
      await handleFileUpload(croppedFile, 'thumbnails', setUploadingAvatar, 'avatar_url')
    } catch (e) {
      console.error(e)
      toast.error('Gagal memotong gambar')
    }
  }

  if (tableMissing) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-red-900/20 border border-red-500/50 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-red-400 mb-4">Tabel Database Belum Tersedia</h2>
        <p className="text-gray-300 mb-4">
          Anda perlu membuat tabel <code className="bg-black/50 px-2 py-1 rounded">profile</code> di Supabase sebelum dapat menggunakan fitur ini. Silakan jalankan SQL berikut di SQL Editor Supabase Anda:
        </p>
        <pre className="bg-black p-4 rounded-xl overflow-x-auto text-sm text-gray-300 font-mono mb-4">
{`CREATE TABLE public.profile (
  id INT PRIMARY KEY DEFAULT 1,
  full_name TEXT NOT NULL,
  bio TEXT,
  availability_status TEXT DEFAULT 'available',
  cv_url TEXT,
  cv_url_en TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.profile (id, full_name, availability_status)
VALUES (1, 'Galang Arrauf Pramudito', 'available')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profile" ON public.profile FOR SELECT USING (true);`}
        </pre>
        <button
          onClick={handleRetryFetch}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition-colors"
        >
          Saya Sudah Menjalankan SQL
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Profil &amp; CV</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data pribadi, biografi, dan dokumen CV yang tampil di beranda dan halaman About.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">

        {/* Foto Profil */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Foto Profil (Avatar)</label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="ri-user-line text-3xl text-gray-500"></i>
              )}
            </div>
            <div className="flex-1 w-full space-y-3">
              <input
                type="url"
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
                placeholder="https://... atau upload file baru"
              />
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingAvatar}
                  value=""
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2"
                  disabled={uploadingAvatar}
                >
                  <i className={uploadingAvatar ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                  {uploadingAvatar ? 'Mengunggah...' : 'Upload & Potong Foto'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tersedia */}
        <div>
          <label htmlFor="availability-select" className="block text-sm font-medium text-gray-400 mb-2">Status Ketersediaan</label>
          <select
            id="availability-select"
            value={profile.availability_status || 'available'}
            onChange={(e) => setProfile({...profile, availability_status: e.target.value})}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
          >
            <option value="available">Tersedia untuk Internship &amp; Freelance</option>
            <option value="freelance_only">Hanya Freelance</option>
            <option value="internship_only">Hanya Internship</option>
            <option value="unavailable">Tidak Tersedia Saat Ini</option>
          </select>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label htmlFor="fullname-input" className="block text-sm font-medium text-gray-400 mb-2">Nama Lengkap (Ditampilkan di Hero &amp; Meta)</label>
          <input
            id="fullname-input"
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({...profile, full_name: e.target.value})}
            required
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
            placeholder="Galang Arrauf Pramudito"
          />
        </div>

        {/* Bio Ringkas */}
        <div>
          <label htmlFor="bio-input" className="block text-sm font-medium text-gray-400 mb-2">Bio Ringkas (Ditampilkan di Halaman About)</label>
          <textarea
            id="bio-input"
            rows={3}
            value={profile.bio || ''}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
            placeholder="Web Developer dari Sidoarjo yang berfokus pada arsitektur backend tangguh..."
          />
        </div>

        {/* CV PDF */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Curriculum Vitae (PDF - Bahasa Indonesia)</label>
          <div className="flex flex-col gap-3">
            <input
              type="url"
              value={profile.cv_url || ''}
              onChange={(e) => setProfile({...profile, cv_url: e.target.value})}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
              placeholder="https://... atau upload file PDF (maks. 4MB)"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'certificates', setUploadingCv, 'cv_url')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingCv}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2"
                  disabled={uploadingCv}
                >
                  <i className={uploadingCv ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                  {uploadingCv ? 'Mengunggah...' : 'Upload PDF'}
                </button>
              </div>
              {profile.cv_url && (
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  <i className="ri-external-link-line"></i> Lihat PDF saat ini
                </a>
              )}
            </div>
          </div>
        </div>

        {/* CV PDF (English) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Curriculum Vitae (PDF - English)</label>
          <div className="flex flex-col gap-3">
            <input
              type="url"
              value={profile.cv_url_en || ''}
              onChange={(e) => setProfile({...profile, cv_url_en: e.target.value})}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
              placeholder="https://... atau upload file PDF English (maks. 4MB)"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'certificates', setUploadingCvEn, 'cv_url_en')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingCvEn}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2"
                  disabled={uploadingCvEn}
                >
                  <i className={uploadingCvEn ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                  {uploadingCvEn ? 'Mengunggah...' : 'Upload PDF (EN)'}
                </button>
              </div>
              {profile.cv_url_en && (
                <a
                  href={profile.cv_url_en}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  <i className="ri-external-link-line"></i> Lihat PDF (EN)
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-accent hover:scale-[1.01] active:scale-[0.99] text-bg-dark text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-accent/30 hover:shadow-accent/40"
          >
            {saving ? (
              <><i className="ri-loader-4-line animate-spin"></i> Menyimpan...</>
            ) : (
              <><i className="ri-save-line"></i> Simpan Profil</>
            )}
          </button>
        </div>
      </form>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden border border-gray-800 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Potong Foto Profil</h3>
              <button type="button" onClick={() => { setCropModalOpen(false); setImageSrc(null); }} className="text-gray-400 hover:text-white">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="relative w-full h-80 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="zoom-range" className="text-sm text-gray-400 block mb-2">Zoom</label>
                <input
                  id="zoom-range"
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom foto"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCropModalOpen(false); setImageSrc(null); }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCropImage}
                  className="px-5 py-2 bg-accent text-bg-dark rounded-full text-sm font-bold transition-all shadow-md shadow-accent/20"
                >
                  Simpan &amp; Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
