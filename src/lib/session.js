// Signed admin session token: `${exp}.${nonce}.${hmac}`
// Uses Web Crypto so it works in proxy, route handlers and server components.

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 // 1 day (seconds)

const encoder = new TextEncoder()

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('')
}

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
}

// Constant-time comparison for equal-length hex strings
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function createSessionToken() {
  const secret = getSecret()
  if (!secret) throw new Error('ADMIN_SESSION_SECRET / ADMIN_PASSWORD is not configured')

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const payload = `${exp}.${nonce}`
  return `${payload}.${await sign(payload, secret)}`
}

export async function verifySessionToken(token) {
  try {
    const secret = getSecret()
    if (!secret || typeof token !== 'string') return false

    const match = /^(\d{10,})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token)
    if (!match) return false

    const [, exp, nonce, signature] = match
    if (Number(exp) < Math.floor(Date.now() / 1000)) return false

    return safeEqual(signature, await sign(`${exp}.${nonce}`, secret))
  } catch {
    return false
  }
}

// Convenience for route handlers: reads the cookie from a NextRequest
export function isValidSession(req) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
}
