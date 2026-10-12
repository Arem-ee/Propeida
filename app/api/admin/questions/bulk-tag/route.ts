import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Bulk topic tagging: apply one (topic, role) mapping to many questions.
 * Subject mismatches are skipped and reported, never stored. Existing
 * identical mappings are left alone (no duplicates, no errors).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { ids, topic_id, role } = body as { ids: unknown; topic_id: unknown; role: unknown }

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200) {
      return NextResponse.json({ error: 'Provide 1-200 question ids' }, { status: 400 })
    }
    if (typeof topic_id !== 'string' || !topic_id) {
      return NextResponse.json({ error: 'Provide a topic_id' }, { status: 400 })
    }
    const roleValue = typeof role === 'string' ? role : 'practice'
    if (!['diagnostic', 'practice', 'review', 'mock'].includes(roleValue)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const [{ data: topic }, { data: questions }] = await Promise.all([
      supabase.from('topics').select('id, subject_id').eq('id', topic_id).single(),
      supabase.from('questions').select('id, subject_id').in('id', ids as string[]),
    ])
    if (!topic) {
      return NextResponse.json({ error: 'Unknown topic' }, { status: 400 })
    }

    const matching = (questions ?? []).filter((q) => q.subject_id === topic.subject_id)
    const skipped = (questions ?? []).length - matching.length

    let applied = 0
    if (matching.length > 0) {
      const { error } = await supabase.from('question_topics').upsert(
        matching.map((q) => ({ question_id: q.id, topic_id, role: roleValue })),
        { onConflict: 'question_id,topic_id,role', ignoreDuplicates: true },
      )
      if (error) {
        return NextResponse.json({ error: 'Failed to apply mappings' }, { status: 500 })
      }
      applied = matching.length
    }

    return NextResponse.json({ applied, skipped })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
