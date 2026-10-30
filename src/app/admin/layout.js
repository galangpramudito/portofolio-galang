import AdminNav from './components/AdminNav'
import { ToastProvider } from './components/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

export const metadata = {
  title: 'Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-bg-dark text-white relative">
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-dark to-bg-dark opacity-80" />
          <div className="relative z-10 flex flex-col min-h-screen">
            <AdminNav />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}