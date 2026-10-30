'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useToast, useConfirm } from '@/app/admin/components/ToastProvider'
import { useSafeNavigation } from '@/app/admin/hooks/useNavigation'
import { apiRequest, uploadFile, isOptimizableImage, MAX_UPLOAD_BYTES } from '@/app/admin/utils/api'

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)

// Sub-komponen untuk Related Images (misal: project_images, timeline_images, certificate_images)
export default function RelatedImages({
  parentId,
  table,
  foreignKey,
  label,
  addLabel,
  hasCaption = false,
  bucket = 'thumbnails',
}) {
  const [images, setImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [newImageFile, setNewImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [newImageCaption, setNewImageCaption] = useState('')
  const [newImageDescription, setNewImageDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const { redirectToLogin } = useSafeNavigation()
  const toast = useToast()
  const confirm = useConfirm()
  const fileInputRef = useRef(null)
  const pendingUpdatesRef = useRef({})

  const handleApiError = useCallback(
    (err, fallback) => {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error(err.message || fallback)
    },
    [redirectToLogin, toast]
  )

  const loadImages = useCallback(async () => {
    const rows = await apiRequest(`/api/admin/${table}?${foreignKey}=${encodeURIComponent(parentId)}`, {
      fallback: 'Gagal memuat gambar',
    })
    const list = Array.isArray(rows) ? rows : []
    return [...list].sort(bySortOrder)
  }, [table, foreignKey, parentId])

  useEffect(() => {
    if (!parentId) return
    let active = true
    loadImages()
      .then((rows) => {
        if (active) setImages(rows)
      })
      .catch((err) => {
        if (active) handleApiError(err, 'Gagal memuat gambar')
      })
      .finally(() => {
        if (active) setLoadingImages(false)
      })
    return () => {
      active = false
    }
  }, [parentId, loadImages, handleApiError])

  const saveImage = useCallback(
    async (id, updates) => {
      try {
        await apiRequest(`/api/admin/${table}`, {
          method: 'PUT',
          body: { id, ...updates },
          fallback: 'Gagal menyimpan detail foto',
        })
      } catch (err) {
        handleApiError(err, 'Gagal menyimpan detail foto')
      }
    },
    [table, handleApiError]
  )

  // Flush pending edits instead of dropping text typed right before unmount
  useEffect(() => {
    const pending = pendingUpdatesRef.current
    return () => {
      Object.values(pending).forEach(({ timer, run }) => {
        clearTimeout(timer)
        run()
      })
    }
  }, [])

  // Cleanup object URL preview to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Local state is the source of truth while typing; no refetch, so keystrokes aren't overwritten
  const handleDebouncedUpdate = (id, updates) => {
    const key = `${id}-${Object.keys(updates).join(',')}`
    clearTimeout(pendingUpdatesRef.current[key]?.timer)
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)))
    const run = () => {
      delete pendingUpdatesRef.current[key]
      saveImage(id, updates)
    }
    pendingUpdatesRef.current[key] = { timer: setTimeout(run, 600), run }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] ?? null
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (file && file.size > MAX_UPLOAD_BYTES) {
      e.target.value = ''
      setNewImageFile(null)
      setUploadError('File terlalu besar. Maksimal 4MB')
      return
    }
    setUploadError('')
    if (file) {
      setNewImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setNewImageFile(null)
    }
  }

  const handleClearSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setNewImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploadError('')
  }

  const handleAddImage = async () => {
    if (!newImageFile) {
      setUploadError('Pilih file gambar terlebih dahulu.')
      return
    }
    setSaving(true)
    setUploadError('')
    try {
      const imageUrl = await uploadFile(newImageFile, bucket)

      const maxOrder = images.reduce((max, img) => Math.max(max, img.sort_order ?? 0), 0)
      const payload = { [foreignKey]: parentId, image_url: imageUrl, sort_order: maxOrder + 1 }
      if (hasCaption) {
        // Auto-fallback caption from filename if empty
        const fallbackCaption = newImageFile.name.replace(/\.[^/.]+$/, '') || 'Foto Dokumentasi'
        payload.caption = newImageCaption.trim() || fallbackCaption
        payload.description = newImageDescription.trim()
      }

      const res = await apiRequest(`/api/admin/${table}`, {
        method: 'POST',
        body: payload,
        fallback: 'Gagal menyimpan foto ke database',
      })
      const created = Array.isArray(res) ? res[0] : res
      if (created) setImages((prev) => [...prev, created])
      else setImages(await loadImages())

      handleClearSelectedFile()
      setNewImageCaption('')
      setNewImageDescription('')
      toast.success('Foto berhasil ditambahkan ke galeri')
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      setUploadError(err.message)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (img) => {
    const ok = await confirm({
      title: 'Hapus foto ini?',
      message: 'Foto akan dihapus secara permanen dari galeri penunjang.',
      confirmLabel: 'Hapus Foto',
      danger: true,
    })
    if (!ok) return
    try {
      await apiRequest(`/api/admin/${table}`, {
        method: 'DELETE',
        body: { id: img.id },
        fallback: 'Gagal menghapus foto',
      })
      setImages((prev) => prev.filter((i) => i.id !== img.id))
      toast.success('Foto berhasil dihapus')
    } catch (err) {
      handleApiError(err, 'Gagal menghapus foto')
    }
  }

  const handleMove = async (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return

    const previous = images
    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const withOrder = reordered.map((img, i) => ({ ...img, sort_order: i + 1 }))
    setImages(withOrder)

    try {
      await apiRequest(`/api/admin/${table}`, {
        method: 'PATCH',
        body: { items: withOrder.map(({ id, sort_order }) => ({ id, sort_order })) },
        fallback: 'Gagal mengubah urutan',
      })
    } catch (err) {
      setImages(previous)
      handleApiError(err, 'Gagal mengubah urutan')
    }
  }

  if (!parentId) return null

  const inputClasses =
    'w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-accent transition-colors'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">{label}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Kelola foto, urutan tampilan, dan informasi keterangan penunjang.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          {images.length} Foto
        </span>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <i className="ri-error-warning-line text-sm shrink-0"></i>
          <span>{uploadError}</span>
        </div>
      )}

      {/* Gallery List */}
      <div className="space-y-3">
        {loadingImages && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-xs">
            <i className="ri-loader-4-line animate-spin text-base text-accent"></i>
            <span>Memuat foto penunjang...</span>
          </div>
        )}
        {!loadingImages && images.length === 0 && (
          <div className="p-6 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/10">
            <i className="ri-image-add-line text-3xl text-gray-600 mb-2 block"></i>
            <p className="text-gray-400 text-xs font-medium">Belum ada foto penunjang.</p>
            <p className="text-gray-600 text-[11px] mt-0.5">
              Gunakan formulir upload di bawah untuk menambahkan dokumentasi.
            </p>
          </div>
        )}
        {images.map((img, index) => (
          <div
            key={img.id}
            className="flex flex-col md:flex-row items-start gap-4 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/10 transition-colors group"
          >
            {/* Image Thumbnail with Lightbox link */}
            <div className="relative shrink-0 w-24 h-24 bg-white/5 rounded-xl overflow-hidden border border-white/10 group/img">
              {img.image_url ? (
                <>
                  <Image
                    src={img.image_url}
                    alt={img.caption || `Foto ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform group-hover/img:scale-105 duration-300"
                    unoptimized={!isOptimizableImage(img.image_url)}
                  />
                  <a
                    href={img.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs transition-opacity"
                    title="Buka gambar resolusi penuh di tab baru"
                  >
                    <i className="ri-external-link-line text-lg"></i>
                  </a>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <i className="ri-image-line text-2xl"></i>
                </div>
              )}
            </div>

            {/* Inputs / Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {hasCaption && (
                <>
                  <div>
                    <label
                      htmlFor={`${table}-${img.id}-caption`}
                      className="block text-[11px] font-medium text-gray-400 mb-1"
                    >
                      Caption / Judul Foto
                    </label>
                    <input
                      id={`${table}-${img.id}-caption`}
                      type="text"
                      className={inputClasses}
                      value={img.caption || ''}
                      onChange={(e) => handleDebouncedUpdate(img.id, { caption: e.target.value })}
                      placeholder="Contoh: Dokumentasi Pelaksanaan Magang"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${table}-${img.id}-description`}
                      className="block text-[11px] font-medium text-gray-400 mb-1"
                    >
                      Keterangan Lengkap
                    </label>
                    <textarea
                      id={`${table}-${img.id}-description`}
                      className={inputClasses}
                      rows={1}
                      value={img.description || ''}
                      onChange={(e) => handleDebouncedUpdate(img.id, { description: e.target.value })}
                      placeholder="Deskripsi cerita atau konteks foto..."
                    />
                  </div>
                </>
              )}

              {/* Controls bar */}
              <div className="flex items-center gap-2 pt-1 md:col-span-2">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Naikkan urutan foto ${index + 1}`}
                    title="Pindahkan ke atas"
                  >
                    <i className="ri-arrow-up-line text-xs"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === images.length - 1}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Turunkan urutan foto ${index + 1}`}
                    title="Pindahkan ke bawah"
                  >
                    <i className="ri-arrow-down-line text-xs"></i>
                  </button>
                </div>
                <span className="text-[11px] font-mono text-gray-500 mr-auto">Urutan #{index + 1}</span>

                <a
                  href={img.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors inline-flex items-center gap-1"
                >
                  <i className="ri-external-link-line text-xs"></i>
                  <span>Buka</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors inline-flex items-center gap-1"
                >
                  <i className="ri-delete-bin-line text-xs"></i>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload New Section */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider">
          <i className="ri-upload-cloud-line text-accent text-sm"></i>
          <span>Tambah Foto Baru</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Picker with Instant Preview */}
          <div className="space-y-2">
            <label htmlFor={`${table}-new-file`} className="block text-xs font-medium text-gray-300">
              Pilih Berkas Foto (Maks. 4MB)
            </label>
            <input
              id={`${table}-new-file`}
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className={inputClasses}
              onChange={handleFileSelect}
              disabled={saving}
            />

            {previewUrl && (
              <div className="relative inline-flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl mt-2">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black shrink-0">
                  <Image src={previewUrl} alt="Preview baru" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate font-medium">{newImageFile?.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {newImageFile ? `${(newImageFile.size / 1024).toFixed(0)} KB` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedFile}
                  disabled={saving}
                  className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Batalkan pilihan berkas"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            )}
          </div>

          {hasCaption && (
            <div className="space-y-3">
              <div>
                <label htmlFor={`${table}-new-caption`} className="block text-xs font-medium text-gray-300 mb-1">
                  Caption / Judul Foto (Opsional)
                </label>
                <input
                  id={`${table}-new-caption`}
                  type="text"
                  className={inputClasses}
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Contoh: Suasana Diskusi Tim / Presentasi"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor={`${table}-new-description`} className="block text-xs font-medium text-gray-300 mb-1">
                  Keterangan Foto (Opsional)
                </label>
                <textarea
                  id={`${table}-new-description`}
                  className={inputClasses}
                  rows={2}
                  value={newImageDescription}
                  onChange={(e) => setNewImageDescription(e.target.value)}
                  placeholder="Cerita singkat atau catatan pelengkap..."
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAddImage}
            disabled={saving || !newImageFile}
            className="bg-accent hover:scale-[1.01] active:scale-[0.99] text-bg-dark px-6 py-2.5 rounded-full text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 transition-all shadow-md shadow-accent/20"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                <span>Mengunggah &amp; Menyimpan...</span>
              </>
            ) : (
              <>
                <i className="ri-add-line text-sm"></i>
                <span>{addLabel || '+ Tambah Foto'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
