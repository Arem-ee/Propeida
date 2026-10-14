import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Duplicate a lesson with all its blocks. The copy always starts as a
 * draft — provenance for a new structure, never a shadow publish.
 * Body: { id, slug }.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, slug } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 })
    }
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'slug must be lowercase letters, numbers, and hyphens' }, { status: 400 })
    }

    const { data: source, error: sourceError } = await supabase
      .from('lessons')
      .select('subject_id, topic_id, title, objective, estimated_minutes, source_ref')
      .eq('id', id)
      .single()
    if (sourceError || !source) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const { data: blocks } = await supabase
      .from('lesson_blocks')
      .select('position, block_type, content')
      .eq('lesson_id', id)
      .order('position')

    const { data: created, error: insertError } = await supabase
      .from('lessons')
      .insert({
        subject_id: source.subject_id,
        topic_id: source.topic_id,
        slug,
        title: `${source.title} (copy)`,
        objective: source.objective,
        estimated_minutes: source.estimated_minutes,
        source_ref: source.source_ref,
        status: 'draft',
        version: 1,
      })
      .select('id')
      .single()
    if (insertError || !created) {
      const taken = insertError?.code === '23505'
      return NextResponse.json(
        { error: taken ? 'That slug is already taken' : 'Failed to duplicate lesson' },
        { status: taken ? 409 : 500 },
      )
    }

    if ((blocks ?? []).length > 0) {
      const { error: blocksError } = await supabase.from('lesson_blocks').insert(
        (blocks ?? []).map((b) => ({
          lesson_id: created.id,
          position: b.position,
          block_type: b.block_type,
          content: b.content,
        })),
      )
      if (blocksError) {
        await supabase.from('lessons').delete().eq('id', created.id)
        return NextResponse.json({ error: 'Failed to copy blocks — nothing was created' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, id: created.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
