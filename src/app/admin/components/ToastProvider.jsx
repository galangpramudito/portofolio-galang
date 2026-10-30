'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'

const ToastContext = createContext(null)
const ConfirmContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * In-app replacement for window.confirm().
 * Usage: const confirm = useConfirm(); if (!(await confirm({ title, message }))) return
 */
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  // Stable object: consumers put `toast` in effect deps
  const toastApi = useMemo(() => ({
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error: (message, duration) => addToast({ message, type: 'error', duration: duration ?? 6000 }),
    info: (message, duration) => addToast({ message, type: 'info', duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration }),
    removeToast,
  }), [addToast, removeToast])

  const confirmResolverRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    // A new dialog supersedes any pending one
    confirmResolverRef.current?.(false)
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve
      setConfirmState({
        title: 'Konfirmasi',
        confirmLabel: 'Ya, Lanjutkan',
        cancelLabel: 'Batal',
        danger: false,
        ...(typeof options === 'string' ? { message: options } : options),
      })
    })
  }, [])

  const closeConfirm = useCallback((result) => {
    confirmResolverRef.current?.(result)
    confirmResolverRef.current = null
    setConfirmState(null)
  }, [])

  return (
    <ToastContext.Provider value={toastApi}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        {confirmState && <ConfirmDialog state={confirmState} onClose={closeConfirm} />}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}

function ConfirmDialog({ state, onClose }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    confirmRef.current?.focus()

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${state.danger ? 'bg-red-500/15 text-red-400' : 'bg-accent/15 text-accent'}`}>
            <i className={state.danger ? 'ri-delete-bin-line text-lg' : 'ri-question-line text-lg'} aria-hidden="true"></i>
          </div>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-white font-semibold">{state.title}</h2>
            {state.message && (
              <p id="confirm-message" className="text-gray-400 text-sm mt-1 whitespace-pre-line">{state.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-full text-sm font-semibold transition-colors"
          >
            {state.cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${state.danger ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-accent hover:brightness-110 text-bg-dark'}`}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none"
      role="region"
      aria-label="Notifikasi"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleRemove = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 200)
  }, [toast.id, onRemove])

  const typeStyles = {
    success: 'border-green-800/60 bg-green-950/80',
    error: 'border-red-800/60 bg-red-950/80',
    warning: 'border-yellow-800/60 bg-yellow-950/80',
    info: 'border-blue-800/60 bg-blue-950/80',
  }

  const typeTextColor = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300',
  }

  const typeIcons = {
    success: 'ri-check-line',
    error: 'ri-error-warning-line',
    warning: 'ri-alert-line',
    info: 'ri-information-line',
  }

  const isUrgent = toast.type === 'error' || toast.type === 'warning'

  return (
    <div
      className={`
        ${typeStyles[toast.type]}
        border rounded-lg
        px-3 py-2.5 flex items-center gap-2.5
        pointer-events-auto backdrop-blur-sm
        transition-all duration-200
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      role={isUrgent ? 'alert' : 'status'}
    >
      <i className={`${typeIcons[toast.type]} ${typeTextColor[toast.type]}`} aria-hidden="true"></i>
      <p className="flex-1 text-gray-200 text-sm leading-snug whitespace-pre-line break-words">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="text-gray-500 hover:text-gray-300 transition-colors p-0.5"
        aria-label="Tutup notifikasi"
      >
        <i className="ri-close-line text-sm"></i>
      </button>
    </div>
  )
}
