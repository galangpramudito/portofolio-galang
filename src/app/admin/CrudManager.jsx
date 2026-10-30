'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import DragDropList from '@/app/admin/components/DragDropList'
import RelatedImages from '@/app/admin/components/RelatedImages'
import { useToast, useConfirm } from '@/app/admin/components/ToastProvider'
import { useSafeNavigation } from '@/app/admin/hooks/useNavigation'
import {
  apiRequest,
  uploadFile,
  isOptimizableImage,
  MAX_UPLOAD_BYTES,
} from '@/app/admin/utils/api'

const URL_FIELD_NAMES = new Set([
  'demo_url',
  'play_store_url',
  'apk_url',
  'repo_url',
  'credential_url',
  'verify_url',
  'video_url',
  'github_url',
  'thumbnail_url',
  'cover_image_url',
  'image_url',
])

const NULLABLE_FIELD_TYPES = new Set(['date', 'select', 'number', 'url', 'image'])

export default function CrudManager({
  table,
  fields,
  columns,
  relatedSection = null,
  filterField = null,
  featuredLimit = null,
  enableFeaturedDrag = false,
  searchFields = ['title', 'name'],
  title = null,
  description = null,
}) {
  const [data, setData] = useState([])
  const [formData, setFormData] = useState({})
  const [initialFormData, setInitialFormData] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFilterValue, setSelectedFilterValue] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fileToUpload, setFileToUpload] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const handledQueryRef = useRef(false)

  const toast = useToast()
  const confirm = useConfirm()
  const { redirectToLogin } = useSafeNavigation()

  // Derive active filter value
  const activeFilterValue = useMemo(() => {
    if (!filterField?.options?.length) return selectedFilterValue
    if (selectedFilterValue === 'all') {
      const hasAll = filterField.options.some((opt) => String(opt.value) === 'all')
      return hasAll ? 'all' : filterField.options[0].value
    }
    const match = filterField.options.some((opt) => String(opt.value) === String(selectedFilterValue))
    return match ? selectedFilterValue : filterField.options[0].value
  }, [filterField, selectedFilterValue])

  // Ensure body scroll is never locked
  useEffect(() => {
    document.body.style.overflow = 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (showForm || editingId) {
          e.preventDefault()
          const form = document.getElementById('crud-form')
          if (form?.requestSubmit) form.requestSubmit()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showForm, editingId])

  // Warn before leaving if form has unsaved edits or selected file
  const isDirty = useMemo(() => {
    if (!showForm && !editingId) return false
    if (fileToUpload !== null) return true
    return JSON.stringify(formData) !== JSON.stringify(initialFormData)
  }, [showForm, editingId, fileToUpload, formData, initialFormData])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Fetch data
  const fetchData = useCallback(
    async (silent = false) => {
      try {
        const items = await apiRequest(`/api/admin/${table}`, {
          fallback: 'Gagal memuat data',
        })
        setData(items)
        return items
      } catch (err) {
        if (err.status === 401) {
          setError('Sesi berakhir. Silakan login kembali.')
          toast.error('Sesi berakhir. Silakan login kembali.')
          setTimeout(() => redirectToLogin(), 1500)
          return null
        }
        setError(err.message || 'Gagal memuat data')
        toast.error(err.message || 'Gagal memuat data')
        return null
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [table, redirectToLogin, toast]
  )

  const handleEdit = useCallback(
    (item) => {
      setEditingId(item.id)
      const formattedItem = { ...item }
      fields.forEach((field) => {
        if (field.type === 'tags' && Array.isArray(item[field.key])) {
          const delimiter = field.delimiter || ','
          const joinStr = delimiter === '|' ? ' | ' : ', '
          formattedItem[field.key] = item[field.key].join(joinStr)
        }
      })
      setFormData(formattedItem)
      setInitialFormData(formattedItem)
      setFileToUpload(null)
      setShowForm(true)
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    [fields]
  )

  // Fetch data on mount and handle URL query parameters (?new=1 and ?edit=<id>)
  useEffect(() => {
    let ignore = false
    async function init() {
      const items = await fetchData()
      if (ignore || !items) return

      if (handledQueryRef.current || typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const newParam = params.get('new')
      const editParam = params.get('edit')

      if (newParam === '1') {
        handledQueryRef.current = true
        const initialForm = {}
        if (filterField && activeFilterValue !== 'all') {
          initialForm[filterField.key] = activeFilterValue
        }
        setFormData(initialForm)
        setInitialFormData(initialForm)
        setEditingId(null)
        setFileToUpload(null)
        setShowForm(true)
      } else if (editParam && items.length > 0) {
        const match = items.find((i) => String(i.id) === String(editParam))
        if (match) {
          handledQueryRef.current = true
          handleEdit(match)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [fetchData, filterField, activeFilterValue, handleEdit])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e, fieldKey) => {
    const file = e.target.files?.[0]
    if (file && file.size > MAX_UPLOAD_BYTES) {
      e.target.value = ''
      toast.error('File terlalu besar. Maksimal 4MB')
      return
    }
    setFileToUpload(file ? { file, fieldKey } : null)
  }

  const handleRemoveImage = (fieldKey) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let dataToSubmit = { ...formData }

    // Required fields validation
    const requiredFields = fields.filter(
      (f) => f.required && (!f.showWhen || f.showWhen(dataToSubmit))
    )
    for (const field of requiredFields) {
      const value = dataToSubmit[field.key]
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        setLoading(false)
        const errorMsg = `${field.label} wajib diisi`
        setError(errorMsg)
        toast.error(errorMsg)
        const element = document.getElementById(field.key)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.focus()
        }
        return
      }
    }

    // URL validation
    for (const field of fields) {
      if (field.type === 'url' || URL_FIELD_NAMES.has(field.key)) {
        const val = dataToSubmit[field.key]
        if (typeof val === 'string' && val.trim()) {
          const trimmed = val.trim()
          if (!trimmed.startsWith('/') && !trimmed.startsWith('./')) {
            try {
              new URL(trimmed)
            } catch {
              setLoading(false)
              const errorMsg = `Format URL tidak valid untuk ${field.label || field.key}`
              setError(errorMsg)
              toast.error(errorMsg)
              return
            }
          }
        }
      }
    }

    // Sanitize string inputs (trim) & normalize empty strings to null for nullable column types
    for (const key in dataToSubmit) {
      if (typeof dataToSubmit[key] === 'string') {
        dataToSubmit[key] = dataToSubmit[key].trim()
      }
    }
    for (const field of fields) {
      if (NULLABLE_FIELD_TYPES.has(field.type)) {
        if (dataToSubmit[field.key] === '' || dataToSubmit[field.key] === undefined) {
          dataToSubmit[field.key] = null
        }
      }
      if (
        field.type === 'number' &&
        dataToSubmit[field.key] !== null &&
        dataToSubmit[field.key] !== '' &&
        dataToSubmit[field.key] !== undefined
      ) {
        dataToSubmit[field.key] = Number(dataToSubmit[field.key])
      }
    }

    // Ensure array fields (tags) are sent as proper arrays
    const arrayFields = fields.filter((f) => f.type === 'tags').map((f) => f.key)
    for (const key of arrayFields) {
      const fieldDef = fields.find((f) => f.key === key)
      const delimiter = fieldDef?.delimiter || ','
      const val = dataToSubmit[key]
      if (val === undefined || val === null || val === '') {
        dataToSubmit[key] = []
      } else if (typeof val === 'string') {
        dataToSubmit[key] = val
          .split(delimiter)
          .map((v) => v.trim())
          .filter(Boolean)
      }
    }

    // Handle image upload if a file was selected
    if (fileToUpload) {
      setUploadLoading(true)
      try {
        const imageUrl = await uploadFile(fileToUpload.file, 'thumbnails')
        dataToSubmit[fileToUpload.fieldKey] = imageUrl
      } catch (uploadErr) {
        setUploadLoading(false)
        setLoading(false)
        setError(uploadErr.message)
        toast.error(uploadErr.message)
        return
      } finally {
        setUploadLoading(false)
      }
    }

    // Auto-generate thumbnail for certificates if PDF is provided and image is empty
    if (
      table === 'certificates' &&
      dataToSubmit.verify_url?.toLowerCase().endsWith('.pdf') &&
      !dataToSubmit.image_url
    ) {
      toast.info('Membuat thumbnail dari PDF...')
      try {
        const { generatePdfThumbnail } = await import('@/lib/pdfToImage')
        const blob = await generatePdfThumbnail(dataToSubmit.verify_url)
        const imageUrl = await uploadFile(blob, 'thumbnails', 'pdf-thumbnail.jpg')
        dataToSubmit.image_url = imageUrl
        toast.success('Thumbnail PDF berhasil dibuat!')
      } catch (err) {
        console.error('PDF thumbnail generation failed:', err)
        toast.warning('Gagal membuat thumbnail PDF, menyimpan tanpa thumbnail.')
      }
    }

    // Filter out fields hidden by showWhen
    const visibleKeys = new Set(
      fields.filter((f) => !f.showWhen || f.showWhen(dataToSubmit)).map((f) => f.key)
    )
    const cleanData = {}
    for (const key of Object.keys(dataToSubmit)) {
      if (visibleKeys.has(key) || key === 'id') cleanData[key] = dataToSubmit[key]
    }

    const isCreating = !editingId
    const method = isCreating ? 'POST' : 'PUT'
    try {
      const response = await apiRequest(`/api/admin/${table}`, {
        method,
        body: editingId ? { id: editingId, ...cleanData } : cleanData,
        fallback: isCreating ? 'Gagal menambahkan konten baru' : 'Gagal menyimpan perubahan',
      })

      await fetchData(true) // silent refresh

      // Clear file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input) => {
        input.value = ''
      })
      setFileToUpload(null)

      if (isCreating) {
        // Automatically enter edit mode for the newly created item if related section exists
        const createdItem = Array.isArray(response) ? response[0] : response
        const hasGallery =
          relatedSection &&
          (!relatedSection.showWhen || relatedSection.showWhen(createdItem || {}))
        if (hasGallery && createdItem?.id) {
          toast.success(
            'Konten baru berhasil dibuat. Anda dapat menambahkan media penunjang di bagian bawah.'
          )
          handleEdit(createdItem)
          setTimeout(() => {
            document.getElementById('related-section')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }, 150)
        } else {
          toast.success('Konten berhasil dibuat')
          setFormData({})
          setInitialFormData({})
          setEditingId(null)
          setShowForm(false)
        }
      } else {
        toast.success('Perubahan berhasil disimpan')
        setFormData({})
        setInitialFormData({})
        setEditingId(null)
        setShowForm(false)
      }
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item) => {
    const id = item?.id ?? item
    const itemLabel = item?.title || item?.name || item?.role || `item #${id}`
    const ok = await confirm({
      title: 'Hapus data?',
      message: `Yakin ingin menghapus "${itemLabel}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus',
      danger: true,
    })
    if (!ok) return

    setLoading(true)
    setError('')
    try {
      await apiRequest(`/api/admin/${table}`, {
        method: 'DELETE',
        body: { id },
        fallback: 'Gagal menghapus data',
      })
      await fetchData(true)
      toast.success('Data berhasil dihapus')
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFromDrag = async (reorderedVisibleItems) => {
    // Slot permutation for subset ordering:
    // Take the visible items' current sort_order values, sort them ascending,
    // and assign them in the new reordered sequence.
    // This prevents collisions with items hidden by filters or search.
    const originalSlots = reorderedVisibleItems
      .map((i) => i.sort_order ?? 0)
      .sort((a, b) => a - b)

    const tablesWithFeatured = ['projects', 'designs', 'videos', 'certificates']

    const itemsToUpdate = reorderedVisibleItems.map((item, index) => {
      const itemData = {
        id: item.id,
        sort_order: originalSlots[index] ?? index,
      }
      if (tablesWithFeatured.includes(table) && item.featured !== undefined) {
        itemData.featured = item.featured
      }
      return itemData
    })

    try {
      await apiRequest(`/api/admin/${table}`, {
        method: 'PATCH',
        body: { items: itemsToUpdate },
        fallback: 'Gagal memperbarui urutan',
      })
      await fetchData(true)
      toast.success(`Urutan ${itemsToUpdate.length} item berhasil disimpan`)
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error('Gagal memperbarui urutan: ' + err.message)
      throw err // Re-throw to trigger DragDropList revert
    }
  }

  const handleCancelForm = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: 'Buang perubahan?',
        message: 'Ada perubahan yang belum disimpan. Yakin ingin membatalkan?',
        confirmLabel: 'Buang',
        cancelLabel: 'Lanjut Mengedit',
        danger: true,
      })
      if (!ok) return
    }
    setFormData({})
    setInitialFormData({})
    setEditingId(null)
    setFileToUpload(null)
    setShowForm(false)
  }

  const renderField = (field) => {
    if (field.showWhen && !field.showWhen(formData)) return null
    const value = formData[field.key] ?? ''

    const inputClasses =
      'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent focus:bg-white/10 focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    let inputElement
    switch (field.type) {
      case 'text':
        inputElement = (
          <div className="space-y-1.5">
            <input
              type="text"
              name={field.key}
              id={field.key}
              className={inputClasses}
              value={value}
              onChange={handleInputChange}
              required={field.required}
              placeholder={field.placeholder}
              disabled={loading || uploadLoading}
              aria-required={field.required}
              aria-label={field.label}
            />
            {field.suggestions && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {field.suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, [field.key]: sug }))
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                      value === sug
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
        break
      case 'textarea':
        inputElement = (
          <textarea
            name={field.key}
            id={field.key}
            rows={4}
            className={inputClasses}
            value={value}
            onChange={handleInputChange}
            required={field.required}
            placeholder={field.placeholder}
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'url':
        inputElement = (
          <div className="flex items-stretch gap-2">
            <input
              type="url"
              name={field.key}
              id={field.key}
              className={`flex-grow ${inputClasses}`}
              value={value}
              onChange={handleInputChange}
              required={field.required}
              placeholder={field.placeholder}
              disabled={loading || uploadLoading}
              aria-required={field.required}
              aria-label={field.label}
            />
            {field.uploadBucket && (
              <label
                className={`flex-shrink-0 px-3 py-2 bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                  uploadLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <i className="ri-upload-2-line text-sm" aria-hidden="true"></i>
                <span>Upload {field.uploadLabel || 'File'}</span>
                <input
                  type="file"
                  accept={field.accept || '*/*'}
                  className="hidden"
                  disabled={loading || uploadLoading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > MAX_UPLOAD_BYTES) {
                      toast.error('File terlalu besar. Maksimal 4MB')
                      return
                    }
                    setUploadLoading(true)
                    try {
                      const url = await uploadFile(file, field.uploadBucket)
                      setFormData((prev) => ({ ...prev, [field.key]: url }))
                      toast.success(`${field.uploadLabel || 'File'} berhasil diunggah`)
                    } catch (err) {
                      toast.error(err.message || 'Gagal mengunggah file')
                    } finally {
                      setUploadLoading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
            )}
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Buka URL di tab baru"
              >
                <i className="ri-external-link-line text-lg" aria-hidden="true"></i>
              </a>
            )}
          </div>
        )
        break
      case 'number':
        inputElement = (
          <input
            type="number"
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value}
            onChange={handleInputChange}
            required={field.required}
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'date':
        inputElement = (
          <input
            type="date"
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value}
            onChange={handleInputChange}
            required={field.required}
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          />
        )
        break
      case 'select':
        inputElement = (
          <select
            name={field.key}
            id={field.key}
            className={inputClasses}
            value={value}
            onChange={handleInputChange}
            required={field.required}
            disabled={loading || uploadLoading}
            aria-required={field.required}
            aria-label={field.label}
          >
            <option value="">Pilih {field.label}</option>
            {field.options.map((option) => {
              const val = typeof option === 'object' ? option.value : option
              const optLabel = typeof option === 'object' ? option.label : option
              return (
                <option key={val} value={val}>
                  {optLabel}
                </option>
              )
            })}
          </select>
        )
        break
      case 'checkbox':
        inputElement = (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name={field.key}
              id={field.key}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-1 focus:ring-blue-500 cursor-pointer"
              checked={!!value}
              onChange={handleInputChange}
              disabled={loading || uploadLoading}
              aria-label={field.label}
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">Aktifkan</span>
          </label>
        )
        break
      case 'tags': {
        const delimiter = field.delimiter || ','
        const joinStr = delimiter === '|' ? ' | ' : ', '
        const rawVal = formData[field.key]
        const displayValue = Array.isArray(rawVal) ? rawVal.join(joinStr) : (rawVal ?? '')
        const defaultPlaceholder =
          delimiter === '|'
            ? 'Pisahkan dengan pipa (|): Item 1 | Item 2 | Item 3'
            : 'Pisahkan dengan koma: tag1, tag2, tag3'

        let parsedTags = []
        if (Array.isArray(rawVal)) {
          parsedTags = rawVal
        } else if (typeof rawVal === 'string' && rawVal.trim()) {
          parsedTags = rawVal.split(delimiter).map((t) => t.trim()).filter(Boolean)
        }

        inputElement = (
          <div className="w-full space-y-3">
            {field.multiline ? (
              <textarea
                name={field.key}
                id={field.key}
                className={inputClasses}
                rows={field.rows || 3}
                value={displayValue}
                onChange={handleInputChange}
                placeholder={field.placeholder || defaultPlaceholder}
                disabled={loading || uploadLoading}
                aria-label={field.label}
              />
            ) : (
              <input
                type="text"
                name={field.key}
                id={field.key}
                className={inputClasses}
                value={displayValue}
                onChange={handleInputChange}
                placeholder={field.placeholder || defaultPlaceholder}
                disabled={loading || uploadLoading}
                aria-label={field.label}
              />
            )}
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {parsedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-gray-700/80 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-600 shadow-sm"
                  >
                    <span className="max-w-md break-words">{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = parsedTags.filter((_, i) => i !== index)
                        setFormData((prev) => ({ ...prev, [field.key]: newTags.join(joinStr) }))
                      }}
                      className="ml-1 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                      aria-label={`Hapus tag ${tag}`}
                    >
                      <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )
        break
      }
      case 'image': {
        const imageUrl = formData[field.key]
        inputElement = (
          <div className="flex flex-col gap-3">
            {imageUrl && (
              <div className="relative w-full max-w-xs h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 group">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  sizes="384px"
                  className="object-cover"
                  unoptimized={!isOptimizableImage(imageUrl)}
                />
                <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(field.key)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
                    aria-label="Hapus gambar"
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                    Hapus
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              name={field.key}
              id={field.key}
              accept="image/*"
              className="w-full px-3 py-2 bg-gray-800 border border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-white text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-700 file:text-gray-200 file:text-sm transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
              onChange={(e) => handleFileChange(e, field.key)}
              disabled={loading || uploadLoading}
              aria-label={`Upload ${field.label}`}
            />
            {uploadLoading && fileToUpload?.fieldKey === field.key && (
              <div className="flex items-center gap-2 text-accent text-sm">
                <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                <span>Mengunggah file...</span>
              </div>
            )}
          </div>
        )
        break
      }
      default:
        inputElement = null
    }

    return (
      <div key={field.key} className="space-y-2">
        <label htmlFor={field.key} className="block text-sm font-medium text-gray-400">
          {field.label}
          {field.required && (
            <span className="text-red-400 ml-1" aria-label="wajib diisi">
              *
            </span>
          )}
        </label>
        {inputElement}
      </div>
    )
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'web':
        return 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
      case 'bot':
        return 'bg-green-600/20 text-green-300 border border-green-500/30'
      case 'android':
        return 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
      default:
        return 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'web':
        return 'ri-window-line'
      case 'bot':
        return 'ri-robot-line'
      case 'android':
        return 'ri-android-line'
      default:
        return 'ri-code-box-line'
    }
  }

  const filteredData = data.filter((item) => {
    const matchesCategory =
      filterField && activeFilterValue !== 'all'
        ? String(item[filterField.key]) === String(activeFilterValue)
        : true

    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      searchFields.some((f) => {
        const val = item[f]
        return val != null && String(val).toLowerCase().includes(query)
      })

    return matchesCategory && matchesSearch
  })

  const isSearchActive = searchQuery.trim() !== ''
  const isFilterAllActive = Boolean(filterField && activeFilterValue === 'all')
  const isDragDisabled = isSearchActive || isFilterAllActive

  const dragDisabledHint = isSearchActive
    ? 'Kosongkan pencarian untuk mengurutkan item'
    : isFilterAllActive
    ? 'Pilih kategori tertentu di atas untuk mengurutkan'
    : null

  const displayTitle =
    title || table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, ' ')
  const displayDescription =
    description || `Kelola dan atur struktur data ${displayTitle} Anda.`

  return (
    <div className="relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30 shadow-lg shadow-accent/20">
              <i className="ri-database-2-line text-accent"></i>
            </div>
            {displayTitle}
          </h1>
          <p className="text-gray-400 text-sm mt-2 ml-13">{displayDescription}</p>
        </div>
        {!(showForm || editingId) && (
          <button
            onClick={() => {
              const initialForm = {}
              if (filterField && activeFilterValue !== 'all') {
                initialForm[filterField.key] = activeFilterValue
              }
              setFormData(initialForm)
              setInitialFormData(initialForm)
              setEditingId(null)
              setFileToUpload(null)
              setShowForm(true)
            }}
            className="px-6 py-3 bg-accent hover:scale-[1.02] active:scale-[0.98] text-bg-dark rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-accent/30 hover:shadow-accent/40"
            aria-label="Tambah konten baru"
          >
            <i className="ri-add-line text-lg"></i>
            Tambah Konten Baru
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="mb-6 bg-red-950/50 border border-red-800/60 rounded-xl px-5 py-4 shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <i className="ri-error-warning-fill text-red-400 text-lg"></i>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold text-sm">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-300/80 whitespace-pre-wrap mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {!(showForm || editingId) ? (
        <div className="relative z-10 w-full mb-20">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <i className="ri-list-check-2 text-accent"></i>
                Daftar Konten
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 text-xs ml-2">
                  {filteredData.length} item
                </span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-56 shrink-0">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Cari data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700/50 text-white text-xs rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-gray-600"
                  />
                </div>
                {filterField && (
                  <div className="flex flex-wrap gap-1.5 bg-gray-900/80 p-1.5 rounded-xl border border-gray-700 shadow-inner">
                    {filterField.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedFilterValue(opt.value)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                          String(activeFilterValue) === String(opt.value)
                            ? 'bg-accent text-bg-dark shadow-md shadow-accent/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 min-h-[400px]">
              {dragDisabledHint && (
                <div className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 flex items-center gap-2">
                  <i className="ri-information-line text-sm text-accent"></i>
                  <span>{dragDisabledHint}</span>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col gap-3 py-2 px-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-16 bg-white/[0.03] animate-pulse rounded-xl border border-white/5 flex items-center px-4 gap-4"
                    >
                      <div className="w-10 h-10 bg-white/10 rounded-lg shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-1/3"></div>
                        <div className="h-2 bg-white/5 rounded w-1/4"></div>
                      </div>
                      <div className="w-20 h-8 bg-white/5 rounded-lg shrink-0"></div>
                    </div>
                  ))}
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-700 rounded-xl m-2 bg-gray-800/30">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 mb-4 shadow-inner">
                    <i className="ri-inbox-2-line text-3xl text-gray-500"></i>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Data Kosong</h3>
                  <p className="text-gray-500 text-sm max-w-xs text-center">
                    Belum ada konten untuk kategori ini. Klik &quot;Tambah Konten Baru&quot; untuk memulai.
                  </p>
                </div>
              ) : (
                <DragDropList
                  data={filteredData}
                  onUpdate={handleUpdateFromDrag}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getBadgeColor={getBadgeColor}
                  getTypeIcon={getTypeIcon}
                  columns={columns}
                  featuredLimit={featuredLimit}
                  enableFeaturedDrag={enableFeaturedDrag}
                  disableDrag={isDragDisabled}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- FORM VIEW --- */
        <div className="relative z-10 w-full max-w-4xl mx-auto mb-20">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                {editingId ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <i className="ri-edit-box-line text-accent"></i>
                    </div>{' '}
                    Edit Konten
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <i className="ri-add-box-line text-accent"></i>
                    </div>{' '}
                    Tambah Konten Baru
                  </>
                )}
              </h2>
              <button
                type="button"
                onClick={handleCancelForm}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/80 hover:rotate-90 transition-all border border-white/10"
                aria-label="Tutup form"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8">
              <form id="crud-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {(() => {
                  const groupedFields = fields.reduce((acc, field) => {
                    const group = field.group || 'Informasi Umum'
                    if (!acc[group]) acc[group] = []
                    acc[group].push(field)
                    return acc
                  }, {})

                  return Object.entries(groupedFields).map(([groupName, groupFields]) => {
                    const visibleFields = groupFields.filter(
                      (f) => !f.showWhen || f.showWhen(formData)
                    )
                    if (visibleFields.length === 0) return null

                    return (
                      <div
                        key={groupName}
                        className="bg-bg-dark/50 rounded-2xl border border-white/10 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                            {groupName}
                          </h3>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col gap-5">
                          {groupFields.map((field) => {
                            const rendered = renderField(field)
                            if (!rendered) return null
                            return (
                              <div key={field.key} className="w-full">
                                {rendered}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                })()}
              </form>

              {/* Related Section (Galeri / Foto Penunjang) */}
              {relatedSection && (
                editingId && (!relatedSection.showWhen || relatedSection.showWhen(formData)) ? (
                  <div id="related-section" className="mt-8 pt-8 border-t border-white/10 scroll-mt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
                        <i className="ri-image-line text-purple-400 text-lg"></i>
                      </div>
                      <h3 className="text-white font-bold text-lg tracking-wide">
                        Galeri &amp; Media Penunjang
                      </h3>
                    </div>
                    <RelatedImages
                      parentId={editingId}
                      table={relatedSection.table}
                      foreignKey={relatedSection.foreignKey}
                      label={relatedSection.label}
                      addLabel={relatedSection.addLabel}
                      hasCaption={relatedSection.hasCaption}
                      bucket={relatedSection.bucket}
                    />
                  </div>
                ) : !editingId && (!relatedSection.showWhen || relatedSection.showWhen(formData)) ? (
                  <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-blue-300 text-sm">
                    <i className="ri-information-line text-lg shrink-0"></i>
                    <span>
                      Simpan konten ini terlebih dahulu. Setelah tersimpan, formulir akan otomatis beralih ke mode <strong>Edit</strong> agar Anda dapat langsung menambahkan <strong>{relatedSection.label || 'Media Penunjang'}</strong>.
                    </span>
                  </div>
                ) : null
              )}
            </div>

            {/* Form Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold rounded-full text-sm transition-all disabled:opacity-50"
                disabled={loading || uploadLoading}
              >
                Batalkan
              </button>
              <button
                type="submit"
                form="crud-form"
                className="px-8 py-3 bg-accent hover:scale-[1.02] active:scale-[0.98] text-bg-dark rounded-full text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/30 hover:shadow-accent/40"
                disabled={loading || uploadLoading}
              >
                {loading || uploadLoading ? (
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                ) : (
                  <i className="ri-save-3-line text-lg"></i>
                )}
                <span>{editingId ? 'Simpan Perubahan' : 'Buat Konten Baru'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
