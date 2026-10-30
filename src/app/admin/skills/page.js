"use client"

import CrudManager from '@/app/admin/CrudManager'

const skillFields = [
  {
    key: 'category',
    label: 'Kategori Keahlian',
    type: 'text',
    required: true,
    placeholder: 'Contoh: Backend & Architecture, Database, Frontend',
    suggestions: [
      'Backend & Architecture',
      'Database & Optimization',
      'AI Integration',
      'Frontend & Visual',
      'DevOps & Automation',
      'Mobile Development',
    ],
  },
  {
    key: 'desc',
    label: 'Deskripsi Singkat',
    type: 'textarea',
    placeholder: 'Keahlian utama — membangun arsitektur aplikasi web tangguh dan dapat diskalakan.',
  },
  {
    key: 'items',
    label: 'Daftar Skill & Tools (Pisahkan dengan koma)',
    type: 'tags',
    delimiter: ',',
    placeholder: 'PHP Laravel, PostgreSQL, Redis, Docker, Git',
  },
  {
    key: 'icon',
    label: 'Class Icon (Remixicon)',
    type: 'text',
    placeholder: 'Contoh: ri-server-line, ri-database-2-line, ri-brain-line',
    suggestions: [
      'ri-server-line',
      'ri-database-2-line',
      'ri-brain-line',
      'ri-layout-3-line',
      'ri-git-branch-line',
      'ri-smartphone-line',
      'ri-code-s-slash-line',
      'ri-tools-line',
    ],
  },
  {
    key: 'highlight',
    label: 'Tandai sebagai Keahlian Utama (Highlight)',
    type: 'checkbox',
  },
]

const skillColumns = [
  { key: 'category', label: 'Kategori' },
  {
    key: 'icon',
    label: 'Icon',
    render: (val) => (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-gray-300">
        <i className={val || 'ri-tools-line'}></i>
        <code>{val || '-'}</code>
      </span>
    ),
  },
  {
    key: 'items',
    label: 'Skill / Tools',
    render: (val) => {
      const list = Array.isArray(val) ? val : []
      if (list.length === 0) return <span className="text-gray-500 text-xs">-</span>
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {list.slice(0, 3).map((item, idx) => (
            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-300">
              {item}
            </span>
          ))}
          {list.length > 3 && (
            <span className="text-[10px] text-gray-500 self-center">+{list.length - 3}</span>
          )}
        </div>
      )
    },
  },
  { key: 'highlight', label: 'Highlight' },
]

export default function SkillsAdminPage() {
  return (
    <CrudManager
      table="skills"
      title="Skills & Keahlian"
      description="Kelola kartu bento skills dan tools yang ditampilkan di halaman beranda."
      fields={skillFields}
      columns={skillColumns}
      searchFields={['category', 'desc']}
    />
  )
}
