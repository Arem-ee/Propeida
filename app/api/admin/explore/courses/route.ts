import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/explore/slug'

type CoursePayload = Record<string, unknown> & { id?: string }

function parseCourse(body: CoursePayload) {
  const name = String(body.name ?? '').trim()
  if (!name) return { error: 'Name is required' as const }
  const slug = String(body.slug ?? '').trim() || slugify(name)
  return {
    values: {
      slug,
      name,
      description: String(body.description ?? '').trim() || null,
      published: Boolean(body.published),
    },
  }
}

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('courses')
      .select('id, slug, name, published, updated_at')
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

    const parsed = parseCourse(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('courses')
      .insert(parsed.values)
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const careers = Array.isArray(body.careers) ? body.careers.filter(Boolean) : []
    if (careers.length > 0) {
      const { error: relError } = await supabase
        .from('career_courses')
        .upsert(
          careers.map((careerId: string) => ({ career_id: careerId, course_id: data.id })),
          { onConflict: 'career_id,course_id', ignoreDuplicates: true },
        )
      if (relError) {
        return NextResponse.json({ error: relError.message }, { status: 400 })
      }
    }

    const universities = Array.isArray(body.universities) ? body.universities.filter(Boolean) : []
    if (universities.length > 0) {
      const { error: uniError } = await supabase
        .from('course_universities')
        .upsert(
          universities.map((schoolId: string) => ({ course_id: data.id, university_id: schoolId })),
          { onConflict: 'course_id,university_id', ignoreDuplicates: true },
        )
      if (uniError) {
        return NextResponse.json({ error: uniError.message }, { status: 400 })
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

    const parsed = parseCourse(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { data, error } = await supabase
      .from('courses')
      .update(parsed.values)
      .eq('id', body.id)
      .select('id, slug')
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const careers = Array.isArray(body.careers) ? body.careers.filter(Boolean) : []
    await supabase.from('career_courses').delete().eq('course_id', data.id)
    if (careers.length > 0) {
      const { error: relError } = await supabase
        .from('career_courses')
        .upsert(
          careers.map((careerId: string) => ({ career_id: careerId, course_id: data.id })),
          { onConflict: 'career_id,course_id', ignoreDuplicates: true },
        )
      if (relError) {
        return NextResponse.json({ error: relError.message }, { status: 400 })
      }
    }

    const universities = Array.isArray(body.universities) ? body.universities.filter(Boolean) : []
    await supabase.from('course_universities').delete().eq('course_id', data.id)
    if (universities.length > 0) {
      const { error: uniError } = await supabase
        .from('course_universities')
        .upsert(
          universities.map((schoolId: string) => ({ course_id: data.id, university_id: schoolId })),
          { onConflict: 'course_id,university_id', ignoreDuplicates: true },
        )
      if (uniError) {
        return NextResponse.json({ error: uniError.message }, { status: 400 })
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
      .from('courses')
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