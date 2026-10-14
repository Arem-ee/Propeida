import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Publish several reviewed questions at once. The gate holds under volume:
 * every selected item must already carry a verification state, otherwise
 * the whole batch is refused WITH NAMES — no silent partial publish, no
 * unverified item reaching learners through a bulk action.
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

    const { data: rows } = await supabase
      .from('questions')
      .select('id, question_text, status, verified_state')
      .in('id', ids)
    if (!rows || rows.length !== ids.length) {
      return NextResponse.json({ error: 'Some questions were not found — nothing was published' }, { status: 404 })
    }

    const refused = (rows as { id: string; question_text: string; verified_state: string }[])
      .filter((r) => r.verified_state === 'unverified')
      .map((r) => ({ id: r.id, text: r.question_text.slice(0, 80) }))
    if (refused.length > 0) {
      return NextResponse.json(
        {
          error: `Verify before publishing — ${refused.length} still unverified`,
          refused,
        },
        { status: 400 },
      )
    }

    const { error } = await supabase
      .from('questions')
      .update({ status: 'published' })
      .in('id', ids)
    if (error) return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })

    return NextResponse.json({ success: true, published: ids.length })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
