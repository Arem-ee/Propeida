import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/explore/slug'
import { UNIVERSITY_TYPES } from '@/lib/explore/constants'

type UniversityPayload = Record<string, unknown> & { id?: string }

function parseUniversity(body: UniversityPayload) {
  const name = String(body.name ?? '').trim()
  if (!name) return { error: 'Name is required' as const }
  const slug = String(body.slug ?? '').trim() || slugify(name)
  const type = String(body.type ?? '').trim()
  if (type && !UNIVERSITY_TYPES.includes(type as (typeof UNIVERSITY_TYPES)[number])) {
    return { error: 'Unknown university type' as const }
  }
  return {
    values: {
      slug,
      name,
      location: String(body.location ?? '').trim() || null,
      type: type || null,
      description: String(body.description ?? '').trim() || null,
      website: String(body.website ?? '').trim() || null,
      published: Boolean(body.published),
    },
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('schools')
      .select('id, slug, name, location, type, published, updated_at')
      .order('name')
      .limit(300)
    return NextResponse.json({ items: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const parsed = parseUniversity(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('schools')
      .upsert(parsed.values, { onConflict: 'slug' })
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const courses = Array.isArray(body.courses) ? body.courses.filter(Boolean) : []
    if (courses.length > 0) {
      const { error: relError } = await supabase
        .from('course_universities')
        .upsert(
          courses.map((courseId: string) => ({ course_id: courseId, university_id: data.id })),
          { onConflict: 'course_id,university_id', ignoreDuplicates: true },
        )
      if (relError) {
        return NextResponse.json({ error: relError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ item: data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !body.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const parsed = parseUniversity(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('schools')
      .update(parsed.values)
      .eq('id', body.id)
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const courses = Array.isArray(body.courses) ? body.courses.filter(Boolean) : []
    await supabase.from('course_universities').delete().eq('university_id', data.id)
    if (courses.length > 0) {
      const { error: relError } = await supabase
        .from('course_universities')
        .upsert(
          courses.map((courseId: string) => ({ course_id: courseId, university_id: data.id })),
          { onConflict: 'course_id,university_id', ignoreDuplicates: true },
        )
      if (relError) {
        return NextResponse.json({ error: relError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ item: data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json().catch(() => null)
    if (!body?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('schools')
      .update({ published: Boolean(body.published) })
      .eq('id', body.id)
      .select('id, published')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ item: data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}