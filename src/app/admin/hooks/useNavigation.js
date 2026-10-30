'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useEffect } from 'react'

/**
 * Safe navigation hook that prevents memory leaks
 * Use this instead of window.location.href
 */
export function useSafeNavigation() {
  const router = useRouter()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const navigate = useCallback((path, options = {}) => {
    if (!isMountedRef.current) return

    // Use Next.js router for client-side navigation
    if (options.replace) {
      router.replace(path)
    } else {
      router.push(path)
    }
  }, [router])

  const redirectToLogin = useCallback(() => {
    navigate('/admin/login', { replace: true })
  }, [navigate])

  return {
    navigate,
    redirectToLogin,
    router
  }
}
