import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Delete several blocks at once. Single confirmation in the UI, single
 * request here; every affected lesson's positions compact to 0..n after.
 * Body: { ids: string[] }.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => typeof i === 'string')) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
    }

    const { data: doomed } = await supabase
      .from('lesson_blocks')
      .select('id, lesson_id')
      .in('id', ids)
    if (!doomed || doomed.length !== ids.length) {
      return NextResponse.json({ error: 'Some blocks were not found — nothing was deleted' }, { status: 404 })
    }
    const lessonIds = [...new Set(doomed.map((d) => (d as { lesson_id: string }).lesson_id))]

    const { error: deleteError } = await supabase
      .from('lesson_blocks')
      .delete()
      .in('id', ids)
    if (deleteError) return NextResponse.json({ error: 'Failed to delete blocks' }, { status: 500 })

    for (const lessonId of lessonIds) {
      const { data: remaining } = await supabase
        .from('lesson_blocks')
        .select('id')
        .eq('lesson_id', lessonId)
        .order('position')
      let i = 0
      for (const row of remaining ?? []) {
        const { error } = await supabase
          .from('lesson_blocks')
          .update({ position: i })
          .eq('id', (row as { id: string }).id)
        if (error) {
          return NextResponse.json(
            { error: 'Blocks deleted, but positions need a reorder — use the ↑↓ buttons once' },
            { status: 500 },
          )
        }
        i += 1
      }
    }

    return NextResponse.json({ success: true, deleted: ids.length })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
