"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast, useConfirm } from '@/app/admin/components/ToastProvider'
import { useSafeNavigation } from '@/app/admin/hooks/useNavigation'
import { apiRequest } from '@/app/admin/utils/api'

export default function ProjectTypesPage() {
  const [types, setTypes] = useState([])
  const [name, setName] = useState('')
  const [editingType, setEditingType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()
  const { redirectToLogin } = useSafeNavigation()

  const fetchData = useCallback(async () => {
    try {
      const [typesData, projectsData] = await Promise.all([
        apiRequest('/api/admin/project_types', { fallback: 'Gagal mengambil data kategori' }),
        apiRequest('/api/admin/projects', { fallback: 'Gagal mengambil data proyek' }),
      ])

      const counts = {}
      projectsData.forEach((p) => {
        const tid = p.project_type_id
        if (tid) counts[tid] = (counts[tid] || 0) + 1
      })

      const processed = typesData
        .map((t) => ({ ...t, count: counts[t.id] || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name))

      setTypes(processed)
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [toast, redirectToLogin])

  useEffect(() => {
    let ignore = false
    async function init() {
      if (!ignore) {
        await fetchData()
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const trimmedName = name.trim()
    setActionLoading('submit')
    try {
      if (editingType) {
        await apiRequest('/api/admin/project_types', {
          method: 'PUT',
          body: { id: editingType.id, name: trimmedName },
          fallback: 'Gagal memperbarui kategori',
        })
        toast.success('Kategori berhasil diperbarui')
      } else {
        await apiRequest('/api/admin/project_types', {
          method: 'POST',
          body: { name: trimmedName },
          fallback: 'Gagal menambah kategori baru',
        })
        toast.success('Kategori berhasil ditambahkan')
      }
      setName('')
      setEditingType(null)
      fetchData()
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartEdit = (type) => {
    setEditingType(type)
    setName(type.name)
  }

  const handleCancelEdit = () => {
    setEditingType(null)
    setName('')
  }

  const handleDelete = async (id, typeName, count) => {
    const ok = await confirm({
      title: 'Hapus kategori?',
      message:
        count > 0
          ? `Peringatan: Ada ${count} proyek yang menggunakan kategori "${typeName}". Jika dihapus, proyek tersebut akan kehilangan kategorinya. Yakin ingin menghapus?`
          : `Yakin ingin menghapus kategori "${typeName}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Kategori',
      danger: true,
    })
    if (!ok) return

    setActionLoading(id)
    try {
      await apiRequest('/api/admin/project_types', {
        method: 'DELETE',
        body: { id },
        fallback: 'Gagal menghapus kategori',
      })
      toast.success('Kategori berhasil dihapus')
      if (editingType?.id === id) {
        handleCancelEdit()
      }
      fetchData()
    } catch (err) {
      if (err.status === 401) {
        redirectToLogin()
        return
      }
      toast.error(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pengaturan Kategori Proyek</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola kategori proyek portofolio secara dinamis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah / Edit */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-fit">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">
            {editingType ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name-input" className="block text-xs font-medium text-gray-400 mb-1.5">
                Nama Kategori
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Aplikasi Mobile, Game, IoT"
                className="w-full text-sm bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <div className="flex gap-2">
              {editingType && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 transition-colors rounded-lg py-2.5"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={actionLoading === 'submit' || !name.trim()}
                className="flex-1 text-xs font-bold uppercase tracking-wider bg-accent text-bg-dark hover:bg-accent/90 transition-colors rounded-lg py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'submit' ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                    Menyimpan...
                  </>
                ) : editingType ? (
                  'Simpan'
                ) : (
                  'Tambah'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Jenis */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <h2 className="text-sm font-semibold text-gray-200">Daftar Kategori</h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded-full font-medium">
                {types.length} Kategori
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <i className="ri-loader-4-line animate-spin text-2xl text-accent"></i>
                <p className="text-xs text-gray-500">Memuat kategori...</p>
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-folder-open-line text-4xl text-gray-600 mb-3 block"></i>
                <p className="text-sm text-gray-400">Belum ada kategori.</p>
                <p className="text-xs text-gray-600 mt-1">Gunakan formulir di samping untuk membuat baru.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {types.map((type) => (
                  <div
                    key={type.id}
                    className={`px-5 py-4 flex items-center justify-between hover:bg-gray-800/10 transition-colors group ${
                      editingType?.id === type.id ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-white">{type.name}</p>
                      <p className="text-xs text-gray-500">
                        slug: <code className="text-accent">{type.slug}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800/60 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
                        {type.count} Konten
                      </span>
                      <button
                        onClick={() => handleStartEdit(type)}
                        className="text-gray-400 hover:text-accent p-1.5 rounded-lg hover:bg-gray-800/50 transition-all"
                        title="Edit Kategori"
                        aria-label={`Edit ${type.name}`}
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(type.id, type.name, type.count)}
                        disabled={actionLoading === type.id}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800/50 transition-all active:scale-95 disabled:opacity-50"
                        title="Hapus Kategori"
                        aria-label={`Hapus ${type.name}`}
                      >
                        {actionLoading === type.id ? (
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                        ) : (
                          <i className="ri-delete-bin-line text-sm"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
