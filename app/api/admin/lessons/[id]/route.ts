import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

const STATUSES = ['draft', 'review', 'published', 'retired']

/** Update lesson metadata. Publishing from a non-published state bumps version. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { data: current } = await supabase
      .from('lessons')
      .select('status, version')
      .eq('id', id)
      .single()
    if (!current) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (typeof body.title === 'string' && body.title.trim()) patch.title = body.title.trim()
    if (typeof body.objective === 'string') patch.objective = body.objective.trim() || null
    if (body.estimated_minutes === null || Number.isInteger(body.estimated_minutes)) {
      patch.estimated_minutes = body.estimated_minutes
    }
    if (typeof body.topic_id === 'string' || body.topic_id === null) {
      patch.topic_id = body.topic_id
    }
    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      patch.status = body.status
      if (body.status === 'published' && current.status !== 'published') {
        patch.version = (current.version as number) + 1
      }
    }

    const { error } = await supabase.from('lessons').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
