import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

export async function POST() {
  try {
    // Always clear the cookie; logging out without a session is not an error
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)

    return NextResponse.json({ ok: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
