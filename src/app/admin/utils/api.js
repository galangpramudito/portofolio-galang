// Client-side helpers shared by admin pages

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // mirrors /api/upload (Vercel body limit is 4.5MB)
const TOO_LARGE_MESSAGE = 'File terlalu besar. Maksimal 4MB'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Responses aren't always JSON (e.g. the platform's 413 page), so parsing must never throw
export async function readJson(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

function errorFor(res, data, fallback) {
  if (res.status === 401) return new ApiError('Sesi berakhir. Silakan login kembali.', 401)
  if (res.status === 413) return new ApiError(TOO_LARGE_MESSAGE, 413)
  return new ApiError(data?.error || fallback, res.status)
}

export async function apiRequest(url, { method = 'GET', body, fallback = 'Permintaan gagal' } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
  const data = await readJson(res)
  if (!res.ok) throw errorFor(res, data, fallback)
  return data
}

export async function uploadFile(file, bucket = 'thumbnails', filename) {
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(TOO_LARGE_MESSAGE, 413)

  const fd = new FormData()
  if (filename) fd.append('file', file, filename)
  else fd.append('file', file)
  fd.append('bucket', bucket)

  const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
  const data = await readJson(res)
  if (!res.ok || !data.url) throw errorFor(res, data, 'Gagal mengunggah file')
  return data.url
}

// next/image throws for hosts missing from images.remotePatterns; render those unoptimized
export function isOptimizableImage(url) {
  try {
    return new URL(url).hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}
