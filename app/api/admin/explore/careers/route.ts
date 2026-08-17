import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { CAREER_CATEGORIES } from '@/lib/explore/constants'
import { slugify } from '@/lib/explore/slug'

type CareerPayload = Record<string, unknown> & { id?: string }

function parseCareer(body: CareerPayload) {
  const name = String(body.name ?? '').trim()
  if (!name) return { error: 'Name is required' as const }
  const slug = String(body.slug ?? '').trim() || slugify(name)
  const category = String(body.category ?? '').trim()
  if (category && !CAREER_CATEGORIES.includes(category as (typeof CAREER_CATEGORIES)[number])) {
    return { error: 'Unknown category' as const }
  }
  return {
    values: {
      slug,
      name,
      category,
      short_description: String(body.short_description ?? '').trim() || null,
      description: String(body.description ?? '').trim() || null,
      what_you_do: Array.isArray(body.what_you_do) ? body.what_you_do.filter(Boolean) : [],
      work_environments: Array.isArray(body.work_environments) ? body.work_environments.filter(Boolean) : [],
      industries: Array.isArray(body.industries) ? body.industries.filter(Boolean) : [],
      common_job_titles: Array.isArray(body.common_job_titles) ? body.common_job_titles.filter(Boolean) : [],
      skills: Array.isArray(body.skills) ? body.skills.filter(Boolean) : [],
      misconceptions: Array.isArray(body.misconceptions) ? body.misconceptions.filter(Boolean) : [],
      career_progression: String(body.career_progression ?? '').trim() || null,
      related_careers: Array.isArray(body.related_careers) ? body.related_careers.filter(Boolean) : [],
      published: Boolean(body.published),
    },
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('careers')
      .select('id, slug, name, category, published, updated_at')
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

    const parsed = parseCareer(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('careers')
      .insert(parsed.values)
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const courses = Array.isArray(body.courses) ? body.courses.filter(Boolean) : []
    if (courses.length > 0) {
      const { error: relError } = await supabase
        .from('career_courses')
        .upsert(
          courses.map((courseId: string) => ({ career_id: data.id, course_id: courseId })),
          { onConflict: 'career_id,course_id', ignoreDuplicates: true },
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

    const parsed = parseCareer(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('careers')
      .update(parsed.values)
      .eq('id', body.id)
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const courses = Array.isArray(body.courses) ? body.courses.filter(Boolean) : []
    await supabase.from('career_courses').delete().eq('career_id', data.id)
    if (courses.length > 0) {
      const { error: relError } = await supabase
        .from('career_courses')
        .upsert(
          courses.map((courseId: string) => ({ career_id: data.id, course_id: courseId })),
          { onConflict: 'career_id,course_id', ignoreDuplicates: true },
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
      .from('careers')
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