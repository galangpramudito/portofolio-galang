import { supabaseAdmin } from '@/lib/supabase-admin'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Live counts — never prerender at build time
export const dynamic = 'force-dynamic'

const METRICS = [
  { key: 'projects', label: 'Total Proyek', href: '/admin/projects', icon: 'ri-folder-open-line', bg: 'ri-code-box-line', color: 'blue' },
  { key: 'certificates', label: 'Total Sertifikat', href: '/admin/certificates', icon: 'ri-award-fill', bg: 'ri-award-line', color: 'emerald' },
  { key: 'timeline', label: 'Perjalanan', href: '/admin/timeline', icon: 'ri-route-line', bg: 'ri-road-map-line', color: 'violet' },
  { key: 'skills', label: 'Skills', href: '/admin/skills', icon: 'ri-tools-line', bg: 'ri-stack-line', color: 'rose' },
  { key: 'project_types', label: 'Kategori Konten', href: '/admin/project_types', icon: 'ri-list-settings-line', bg: 'ri-layout-grid-line', color: 'amber' },
]

// Static class map so Tailwind can see every class
const COLOR_CLASSES = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' tahun yang lalu'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' bulan yang lalu'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' hari yang lalu'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' jam yang lalu'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' menit yang lalu'
  return 'baru saja'
}

async function loadDashboardMetrics() {
  const startedAt = Date.now()
  const countTables = METRICS.filter(m => m.key !== 'projects').map(m => m.key)
  const [projectsRes, ...countResults] = await Promise.all([
    supabaseAdmin.from('projects').select('id, created_at, title, status, project_types(name, slug)', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
    ...countTables.map(table => supabaseAdmin.from(table).select('id', { count: 'exact', head: true }))
  ])
  const latencyMs = Date.now() - startedAt

  if (projectsRes.error) throw projectsRes.error

  const counts = {
    projects: projectsRes.count ?? projectsRes.data?.length ?? 0
  }
  const failedTables = []
  countResults.forEach((res, i) => {
    if (res.error) {
      console.error(`Dashboard count ${countTables[i]} error:`, res.error)
      failedTables.push(countTables[i])
      counts[countTables[i]] = null
    } else {
      counts[countTables[i]] = res.count ?? 0
    }
  })

  return {
    counts,
    failedTables,
    recentProjects: projectsRes.data || [],
    latencyMs
  }
}

export default async function AdminDashboardPage() {
  // Defense in depth: proxy already guards /admin, but this page reads with the service role
  const cookieStore = await cookies()
  if (!(await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value))) {
    redirect('/admin/login')
  }

  let hasError = false
  let counts = {}
  let failedTables = []
  let recentProjects = []
  let latencyMs = null

  try {
    const data = await loadDashboardMetrics()
    counts = data.counts
    failedTables = data.failedTables
    recentProjects = data.recentProjects
    latencyMs = data.latencyMs
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    hasError = true
  }

  // Get current date formatted
  const today = new Date()
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const formattedDate = today.toLocaleDateString('id-ID', dateOptions)

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-gray-900/50 p-8 rounded-2xl border border-red-900/30">
          <i className="ri-error-warning-line text-4xl text-red-400 mb-3 block"></i>
          <p className="text-gray-300 font-medium mb-1">Gagal memuat data dashboard</p>
          <p className="text-gray-500 text-sm mb-5">Terjadi kesalahan saat terhubung ke database.</p>
          <Link href="/admin" className="px-5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
            Coba Ulang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview</h1>
          <p className="text-gray-400 text-sm">Selamat datang kembali! Berikut ringkasan portofolio Anda.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 px-4 py-2 rounded-lg backdrop-blur-sm shadow-sm">
          <i className="ri-calendar-line text-blue-400"></i>
          <span className="text-sm text-gray-300 font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {METRICS.map((metric) => (
          <Link key={metric.key} href={metric.href} className="group bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl p-5 transition-all duration-300 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <i className={`${metric.bg} text-7xl text-white`}></i>
            </div>
            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-5 ${COLOR_CLASSES[metric.color]}`}>
                <i className={`${metric.icon} text-xl`}></i>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">{metric.label}</p>
              <h3 className="text-3xl font-bold text-white">{counts[metric.key] ?? '—'}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Main Content: Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <i className="ri-history-line text-gray-400"></i> Konten Terbaru
            </h2>
            <Link href="/admin/projects" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/20">
              Lihat Semua
            </Link>
          </div>
          <div className="p-0 flex-1 bg-gray-900/20">
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-500">
                <i className="ri-inbox-line text-4xl mb-3 opacity-50"></i>
                <p className="text-sm">Belum ada proyek yang ditambahkan.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {recentProjects.map((project) => (
                  <div key={project.id} className="p-5 flex items-center gap-4 hover:bg-gray-800/80 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 group-hover:border-blue-500/40 transition-colors">
                      <i className="ri-file-list-3-line text-gray-400 group-hover:text-blue-400 transition-colors"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{project.title}</h4>
                        {project.status === 'completed' && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Completed"></span>}
                        {project.status === 'wip' && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)]" title="Work in Progress"></span>}
                        {project.status === 'private' && <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" title="Private"></span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
                          <i className="ri-price-tag-3-line"></i> {project.project_types?.name || 'Tanpa Kategori'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="ri-time-line"></i> {timeAgo(project.created_at)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/projects?edit=${project.id}`} className="p-2 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all" title="Edit proyek" aria-label={`Edit ${project.title}`}>
                      <i className="ri-arrow-right-line"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Akses Cepat</h2>
            <div className="space-y-3">
              <Link href="/admin/projects?new=1" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <i className="ri-add-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Proyek Baru</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>
              
              <Link href="/admin/certificates?new=1" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <i className="ri-award-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Upload Sertifikat</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>

              <Link href="/admin/project_types" className="flex items-center gap-3 w-full p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl transition-all group shadow-sm hover:shadow-md hover:border-gray-600">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <i className="ri-folder-add-line text-lg"></i>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Kategori Baru</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden shadow-lg">
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl pointer-events-none ${failedTables.length ? 'bg-amber-500/10' : 'bg-green-500/10'}`}></div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 relative z-10">Status Sistem</h2>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative flex h-3 w-3">
                {!failedTables.length && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${failedTables.length ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              </div>
              <p className="text-sm font-semibold text-white">
                {failedTables.length ? 'Database Sebagian Bermasalah' : 'Database Online'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3 relative z-10 leading-relaxed">
              {failedTables.length
                ? `Gagal membaca tabel: ${failedTables.join(', ')}.`
                : `Semua query berhasil dalam ${latencyMs} ms.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
