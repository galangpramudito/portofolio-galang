"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSafeNavigation } from '../hooks/useNavigation'
import { useConfirm } from './ToastProvider'

export default function AdminNav() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const { navigate } = useSafeNavigation()
  const confirm = useConfirm()

  // Close mobile menu on Escape key and outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  if (pathname === '/admin/login') return null

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Keluar dari Admin?',
      message: 'Sesi Anda akan diakhiri dan dialihkan ke halaman login.',
      confirmLabel: 'Logout',
      danger: true,
    })
    if (!ok) return

    setLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
      navigate('/admin/login', { replace: true })
    } catch {
      navigate('/admin/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'ri-dashboard-3-line', exact: true },
    { href: '/admin/profile', label: 'Profil', icon: 'ri-user-settings-line' },
    { href: '/admin/timeline', label: 'Timeline', icon: 'ri-time-line' },
    { href: '/admin/skills', label: 'Skills', icon: 'ri-tools-line' },
    { href: '/admin/projects', label: 'Proyek', icon: 'ri-code-box-line' },
    { href: '/admin/project_types', label: 'Kategori', icon: 'ri-list-settings-line' },
    { href: '/admin/certificates', label: 'Sertifikat', icon: 'ri-award-line' },
  ]

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/admin'
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-6 z-50 px-4"
      aria-label="Navigasi admin"
    >
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/admin"
            className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 group shrink-0"
            aria-label="Dashboard Admin"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-command-line text-accent"></i>
            </div>
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Desktop Nav (shown from lg: breakpoint to prevent wrapping) */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
                    ${active
                      ? 'bg-accent text-bg-dark shadow-md shadow-accent/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={`${item.icon} mr-1.5 ${active ? 'text-bg-dark' : ''}`}></i>
                  {item.label}
                </Link>
              )
            })}

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              aria-label="Logout dari admin"
            >
              <i className="ri-logout-circle-r-line"></i>
              {loading ? '...' : 'Logout'}
            </button>
          </div>

          {/* Mobile / Tablet Hamburger (visible below lg:) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-4-line'} text-xl`} aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden mt-3 max-w-5xl mx-auto bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2"
        >
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? 'bg-accent text-bg-dark shadow-md shadow-accent/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={`${item.icon} mr-3 text-lg ${active ? 'text-bg-dark' : 'text-gray-400'}`}></i>
                  {item.label}
                </Link>
              )
            })}

            <div className="h-px bg-white/10 my-2"></div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-50"
              aria-label="Logout dari admin"
            >
              <i className="ri-logout-circle-r-line mr-3 text-lg"></i>
              {loading ? 'Memproses...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
