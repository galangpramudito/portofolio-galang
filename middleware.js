import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isApiRoute = pathname.startsWith('/api/admin')

  if (isAdminRoute && !isLoginPage) {
    const session = req.cookies.get(SESSION_COOKIE)?.value

    // Verify signature + expiry, not just format
    if (!(await verifySessionToken(session))) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url))
      if (session) response.cookies.delete(SESSION_COOKIE)
      return response
    }
  }

  // Add security headers
  const response = NextResponse.next()

  // Prevent admin pages from being embedded in iframes
  if (isAdminRoute || isApiRoute) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
