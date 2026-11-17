import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

function asDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'mock-event'
}

/** List all mock events (newest first) with exam names. */
export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('mock_events')
      .select('id, name, slug, exam_id, starts_at, ends_at, description, created_at, exams!inner(name, slug)')
      .order('starts_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ events: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { name, exam_id, starts_at, ends_at, description } = body

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Give the event a name' }, { status: 400 })
    }
    if (typeof exam_id !== 'string' || !exam_id.trim()) {
      return NextResponse.json({ error: 'Pick an exam' }, { status: 400 })
    }
    const starts = asDate(starts_at)
    const ends = asDate(ends_at)
    if (!starts || !ends) return NextResponse.json({ error: 'Both starts and ends are required' }, { status: 400 })
    if (new Date(ends) <= new Date(starts)) {
      return NextResponse.json({ error: 'The event must end after it starts' }, { status: 400 })
    }

    const { count: attempts } = await supabase
      .from('mock_events')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', exam_id)
    const suffix = attempts && attempts > 0 ? `-${attempts + 1}` : ''
    const slug = `${slugify(name)}${suffix}`

    const { data, error } = await supabase
      .from('mock_events')
      .insert({
        name: name.trim(),
        exam_id,
        slug,
        starts_at: starts,
        ends_at: ends,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      })
      .select('id, slug')
      .single()
    if (error) return NextResponse.json({ error: error.message ?? 'Failed to create the event' }, { status: 500 })
    return NextResponse.json({ success: true, id: data.id, slug: data.slug })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, name, description, starts_at, ends_at } = body
    if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      updates.name = name.trim()
    }
    if (description !== undefined) updates.description = typeof description === 'string' && description.trim() ? description.trim() : null
    if (starts_at !== undefined) updates.starts_at = asDate(starts_at)
    if (ends_at !== undefined) updates.ends_at = asDate(ends_at)
    if (updates.starts_at && updates.ends_at && new Date(String(updates.ends_at)) <= new Date(String(updates.starts_at))) {
      return NextResponse.json({ error: 'The event must end after it starts' }, { status: 400 })
    }

    const { error } = await supabase.from('mock_events').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message ?? 'Failed to update the event' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 })

    // Sessions keep their completed results; the event row goes, sessions
    // keep mock_event_id null via ON DELETE SET NULL.
    const { error } = await supabase.from('mock_events').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete the event' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
