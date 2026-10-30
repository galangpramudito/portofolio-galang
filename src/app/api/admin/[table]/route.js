import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/project-utils'
import { isValidSession } from '@/lib/session'
export const dynamic = 'force-dynamic'

const WHITELIST = ['projects', 'project_images', 'project_types', 'designs', 'design_images', 'videos', 'skills', 'certificates', 'certificate_images', 'profile', 'timeline', 'timeline_images']

const URL_FIELDS = ['demo_url', 'play_store_url', 'apk_url', 'repo_url', 'credential_url', 'verify_url', 'video_url', 'image_url', 'thumbnail_url', 'cover_image_url', 'github_url']

// Foreign keys allowed as GET filters (?project_id=...)
const FILTER_FIELDS = ['project_id', 'design_id', 'certificate_id', 'timeline_id', 'project_type_id']

// UUID v4 pattern or integer
const VALID_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidId(id) {
  const str = String(id)
  return /^\d+$/.test(str) || VALID_ID_PATTERN.test(str)
}

const validateSession = isValidSession

// Slug from a name; falls back when name has no ASCII letters/digits
function typeSlug(name) {
  const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  return slug || `type-${Date.now().toString(36)}`
}

// PostgREST "column not found" — lets slug writes degrade gracefully if the column is missing
function isMissingColumn(error, column) {
  return (error?.code === 'PGRST204' || error?.code === '42703') && error?.message?.includes(column)
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function notAllowedResponse() {
  return NextResponse.json({ error: 'Table not allowed' }, { status: 403 })
}

function badRequestResponse(message = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 })
}

function serverErrorResponse(message = 'Internal server error', details = null) {
  console.error('Server error:', message, details)
  // Session-protected admin API: DB message helps the admin fix input, raw objects stay in logs
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function GET(req, { params }) {
  try {
    if (!(await validateSession(req))) return unauthorizedResponse()

    const { table } = await params
    if (!WHITELIST.includes(table)) return notAllowedResponse()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // Validate id if provided
    if (id && !isValidId(id)) {
      return badRequestResponse('Invalid ID format')
    }

    let query = supabaseAdmin
      .from(table)
      .select('*')

    // Apply ordering based on table structure
    // Some tables have sort_order, others only have created_at
    const tablesWithSortOrder = ['projects', 'designs', 'videos', 'skills', 'certificates', 'project_images', 'design_images', 'certificate_images', 'timeline', 'timeline_images']

    if (tablesWithSortOrder.includes(table)) {
      query = query.order('sort_order', { ascending: true, nullsFirst: false })
    }
    if (table !== 'profile') {
      query = query.order('created_at', { ascending: false })
    }

    if (id) query = query.eq('id', id)

    for (const field of FILTER_FIELDS) {
      const value = searchParams.get(field)
      if (value === null) continue
      if (!isValidId(value)) return badRequestResponse(`Invalid ${field} format`)
      query = query.eq(field, value)
    }

    const { data, error } = await query

    if (error) {
      console.error(`GET ${table} error:`, error)
      return serverErrorResponse(error.message, error)
    }

    return NextResponse.json(data)
  } catch (error) {
    return serverErrorResponse(error.message, error)
  }
}

export async function POST(req, { params }) {
  try {
    if (!(await validateSession(req))) return unauthorizedResponse()

    const { table } = await params
    if (!WHITELIST.includes(table)) return notAllowedResponse()

    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return badRequestResponse('Invalid request body')
    }

    // Prevent injection of protected fields
    const { id, created_at, updated_at, ...safeBody } = body

    // Validate required fields based on table
    if (table === 'projects') {
      if (!safeBody.title || !safeBody.project_type_id) {
        return badRequestResponse('Title and project_type_id are required')
      }
      safeBody.slug = generateSlug(safeBody.title)
    }
    if (table === 'project_types') {
      if (!safeBody.name) {
        return badRequestResponse('Name is required')
      }
      if (!safeBody.slug) {
        safeBody.slug = typeSlug(safeBody.name)
      }
    }
    if (table === 'designs' && !safeBody.title) {
      return badRequestResponse('Title is required')
    }
    if (table === 'videos' && (!safeBody.title || !safeBody.video_url)) {
      return badRequestResponse('Title and video URL are required')
    }
    if (table === 'certificates' && (!safeBody.title || !safeBody.issuer)) {
      return badRequestResponse('Title and issuer are required')
    }
    if (table === 'timeline' && (!safeBody.role || !safeBody.institution || !safeBody.period)) {
      return badRequestResponse('Role, institution, and period are required')
    }
    if (table === 'timeline_images' && (!safeBody.timeline_id || !safeBody.image_url)) {
      return badRequestResponse('Timeline ID and image URL are required')
    }
    if (table === 'project_images' && (!safeBody.project_id || !safeBody.image_url)) {
      return badRequestResponse('Project ID and image URL are required')
    }
    if (table === 'certificate_images' && (!safeBody.certificate_id || !safeBody.image_url)) {
      return badRequestResponse('Certificate ID and image URL are required')
    }
    if (table === 'design_images' && (!safeBody.design_id || !safeBody.image_url)) {
      return badRequestResponse('Design ID and image URL are required')
    }
    if (table === 'skills' && !safeBody.category) {
      return badRequestResponse('Category is required')
    }

    // Sanitize URL fields to prevent XSS
    for (const field of URL_FIELDS) {
      if (safeBody[field] && typeof safeBody[field] === 'string') {
        const val = safeBody[field].trim()
        if (val.startsWith('/') || val.startsWith('./')) {
          continue
        }
        // Basic URL validation
        try {
          new URL(val)
        } catch {
          return badRequestResponse(`Invalid URL format for ${field}`)
        }
      }
    }

    let { data, error } = await supabaseAdmin.from(table).insert(safeBody).select()

    if (error && table === 'projects' && isMissingColumn(error, 'slug')) {
      delete safeBody.slug
      ;({ data, error } = await supabaseAdmin.from(table).insert(safeBody).select())
    }

    if (error && table === 'skills') {
      let modified = false
      for (const col of ['desc', 'highlight']) {
        if (isMissingColumn(error, col) && col in safeBody) {
          delete safeBody[col]
          modified = true
        }
      }
      if (modified) {
        ;({ data, error } = await supabaseAdmin.from(table).insert(safeBody).select())
      }
    }

    if (error) {
      console.error(`POST ${table} error:`, error)
      return serverErrorResponse(error.message, error)
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(data)
  } catch (error) {
    return serverErrorResponse(error.message, error)
  }
}

export async function PUT(req, { params }) {
  try {
    if (!(await validateSession(req))) return unauthorizedResponse()

    const { table } = await params
    if (!WHITELIST.includes(table)) return notAllowedResponse()

    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return badRequestResponse('Invalid request body')
    }

    const { id, created_at, updated_at, ...safeBody } = body

    if (!id || !isValidId(id)) {
      return badRequestResponse('Valid ID is required')
    }

    if (table === 'projects') {
      // Slug is stable once set (public URLs depend on it); only backfill when empty
      delete safeBody.slug
      if (safeBody.title) {
        const { data: existing, error: slugError } = await supabaseAdmin
          .from('projects').select('slug').eq('id', id).maybeSingle()
        if (!slugError && existing && !existing.slug) {
          safeBody.slug = generateSlug(safeBody.title)
        }
      }
    }

    if (table === 'project_types') {
      if (safeBody.name && !safeBody.slug) {
        safeBody.slug = typeSlug(safeBody.name)
      }
    }

    // Sanitize URL fields
    for (const field of URL_FIELDS) {
      if (safeBody[field] && typeof safeBody[field] === 'string') {
        const val = safeBody[field].trim()
        if (val.startsWith('/') || val.startsWith('./')) {
          continue
        }
        try {
          new URL(val)
        } catch {
          return badRequestResponse(`Invalid URL format for ${field}`)
        }
      }
    }

    let { data, error } = await supabaseAdmin
      .from(table)
      .update(safeBody)
      .eq('id', id)
      .select()

    if (error && table === 'skills') {
      let modified = false
      for (const col of ['desc', 'highlight']) {
        if (isMissingColumn(error, col) && col in safeBody) {
          delete safeBody[col]
          modified = true
        }
      }
      if (modified) {
        ;({ data, error } = await supabaseAdmin
          .from(table)
          .update(safeBody)
          .eq('id', id)
          .select())
      }
    }

    if (error) {
      console.error(`PUT ${table} error:`, error)
      return serverErrorResponse(error.message, error)
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json(data)
  } catch (error) {
    return serverErrorResponse(error.message, error)
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!(await validateSession(req))) return unauthorizedResponse()

    const { table } = await params
    if (!WHITELIST.includes(table)) return notAllowedResponse()

    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return badRequestResponse('Invalid request body')
    }

    const { id } = body

    if (!id || !isValidId(id)) {
      return badRequestResponse('Valid ID is required')
    }

    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`DELETE ${table} error:`, error)
      return serverErrorResponse(error.message, error)
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverErrorResponse(error.message, error)
  }
}

export async function PATCH(req, { params }) {
  try {
    if (!(await validateSession(req))) return unauthorizedResponse()

    const { table } = await params
    if (!WHITELIST.includes(table)) return notAllowedResponse()

    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return badRequestResponse('Invalid request body')
    }

    const { items } = body

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return badRequestResponse('Items array is required')
    }

    // Validate each item has id, sort_order, and featured
    for (const item of items) {
      // Check if id exists (can be UUID string or integer)
      if (!item.id && item.id !== 0) {
        console.error('Invalid item:', item)
        return badRequestResponse('Each item must have an ID')
      }

      // Validate ID format
      if (!isValidId(item.id)) {
        console.error('Invalid ID format for item:', item)
        return badRequestResponse('Each item must have a valid ID')
      }

      if (typeof item.sort_order !== 'number' || isNaN(item.sort_order)) {
        console.error('Invalid sort_order:', item.sort_order, 'for item:', item)
        return badRequestResponse('Each item must have a valid sort_order number')
      }

      // featured is optional — not all tables have it (e.g., image tables)
      if (item.featured !== undefined && typeof item.featured !== 'boolean') {
        console.error('Invalid featured:', item.featured, 'for item:', item)
        return badRequestResponse('featured must be a boolean if provided')
      }
    }

    // Batch update using Promise.all for better performance
    const updates = items.map(item => {
      const updateData = { sort_order: item.sort_order }
      // Only include featured if the item provides it
      if (item.featured !== undefined) {
        updateData.featured = item.featured
      }
      return supabaseAdmin
        .from(table)
        .update(updateData)
        .eq('id', item.id) // Use raw id (UUID or int)
    })

    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error(`PATCH ${table} batch update errors:`, errors)
      return serverErrorResponse('Some updates failed', errors)
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({
      ok: true,
      updated: items.length,
      message: `Successfully updated ${items.length} items`
    })
  } catch (error) {
    console.error('[PATCH] Unexpected error:', error)
    return serverErrorResponse(error.message, error)
  }
}