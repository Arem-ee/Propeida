import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Move blocks to another lesson. Moved blocks append at the end of the
 * target; both lessons' positions compact to 0..n. Body:
 * { ids: string[], to_lesson_id: string }.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, to_lesson_id } = body

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === 'string')) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
    }
    if (!to_lesson_id || typeof to_lesson_id !== 'string') {
      return NextResponse.json({ error: 'to_lesson_id is required' }, { status: 400 })
    }

    const { data: target } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', to_lesson_id)
      .single()
    if (!target) return NextResponse.json({ error: 'Target lesson not found' }, { status: 404 })

    const { data: moving } = await supabase
      .from('lesson_blocks')
      .select('id, lesson_id')
      .in('id', ids)
    if (!moving || moving.length !== ids.length) {
      return NextResponse.json({ error: 'Some blocks were not found' }, { status: 404 })
    }
    const fromLessonId = (moving[0] as { lesson_id: string }).lesson_id
    if (!moving.every((m) => (m as { lesson_id: string }).lesson_id === fromLessonId)) {
      return NextResponse.json({ error: 'Move one lesson at a time' }, { status: 400 })
    }
    if (fromLessonId === to_lesson_id) {
      return NextResponse.json({ error: 'Blocks are already in that lesson' }, { status: 400 })
    }

    const { data: targetBlocks } = await supabase
      .from('lesson_blocks')
      .select('position')
      .eq('lesson_id', to_lesson_id)
      .order('position', { ascending: false })
      .limit(1)
    let next = ((targetBlocks ?? [])[0]?.position ?? -1) + 1

    // Preserve the source order of the moved blocks.
    const { data: ordered } = await supabase
      .from('lesson_blocks')
      .select('id')
      .in('id', ids)
      .order('position')
    for (const row of ordered ?? []) {
      const { error } = await supabase
        .from('lesson_blocks')
        .update({ lesson_id: to_lesson_id, position: next })
        .eq('id', (row as { id: string }).id)
      if (error) return NextResponse.json({ error: 'Failed to move blocks' }, { status: 500 })
      next += 1
    }

    // Compact the source lesson's remaining positions.
    const { data: remaining } = await supabase
      .from('lesson_blocks')
      .select('id')
      .eq('lesson_id', fromLessonId)
      .order('position')
    let i = 0
    for (const row of remaining ?? []) {
      const { error } = await supabase
        .from('lesson_blocks')
        .update({ position: i })
        .eq('id', (row as { id: string }).id)
      if (error) return NextResponse.json({ error: 'Blocks moved, but source positions need a reorder' }, { status: 500 })
      i += 1
    }

    return NextResponse.json({ success: true, moved: ids.length })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
