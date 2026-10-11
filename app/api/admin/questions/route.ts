import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeOptions, validateMisconceptions, type MisconceptionInput } from '@/lib/questions'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Replace-all write for a question's misconception map. Authoring-scale
 * volumes make delete+insert simpler and safer than diffing.
 */
async function saveMisconceptions(
  supabase: AdminClient,
  questionId: string,
  rows: MisconceptionInput[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('question_misconceptions')
    .delete()
    .eq('question_id', questionId)
  if (deleteError) throw new Error('Failed to replace misconceptions')
  if (rows.length === 0) return
  const { error: insertError } = await supabase
    .from('question_misconceptions')
    .insert(rows.map((r) => ({ ...r, question_id: questionId })))
  if (insertError) throw new Error('Failed to save misconceptions')
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    const { exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty } = body

    if (!exam_id || typeof exam_id !== 'string' || !subject_id || typeof subject_id !== 'string' || !question_text || !options || !correct_answer || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['a', 'b', 'c', 'd'].includes(correct_answer)) {
      return NextResponse.json({ error: 'correct_answer must be a, b, c, or d' }, { status: 400 })
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'difficulty must be easy, medium, or hard' }, { status: 400 })
    }

    let misconceptions: MisconceptionInput[] = []
    try {
      misconceptions = validateMisconceptions(body.misconceptions, correct_answer)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid misconceptions' }, { status: 400 })
    }

    const { data: created, error } = await supabase.from('questions').insert({
      exam_id,
      subject_id,
      question_text,
      options: normalizeOptions(options),
      correct_answer,
      explanation: explanation || null,
      difficulty,
    }).select('id').single()

    if (error || !created) return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })

    try {
      await saveMisconceptions(supabase, created.id, misconceptions)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save misconceptions' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: created.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing question id' }, { status: 400 })
    }

    let misconceptions: MisconceptionInput[] | null = null
    if (body.misconceptions !== undefined) {
      try {
        misconceptions = validateMisconceptions(body.misconceptions, correct_answer)
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid misconceptions' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('questions')
      .update({ exam_id, subject_id, question_text, options: normalizeOptions(options), correct_answer, explanation: explanation || null, difficulty })
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })

    if (misconceptions !== null) {
      try {
        await saveMisconceptions(supabase, id, misconceptions)
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save misconceptions' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
