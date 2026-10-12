import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Clone a question with its misconception and topic maps, for authoring
 * variants. The copy opens directly in the edit form.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id } = body
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing question id' }, { status: 400 })
    }

    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty, source')
      .eq('id', id)
      .single()
    if (qError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const [{ data: mcs }, { data: topics }] = await Promise.all([
      supabase
        .from('question_misconceptions')
        .select('option_key, misconception_code, misconception_name, explanation, repair_note_id')
        .eq('question_id', id),
      supabase
        .from('question_topics')
        .select('topic_id, role')
        .eq('question_id', id),
    ])

    const { data: created, error: insertError } = await supabase
      .from('questions')
      .insert({
        exam_id: question.exam_id,
        subject_id: question.subject_id,
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        source: question.source ?? 'clone',
      })
      .select('id')
      .single()
    if (insertError || !created) {
      return NextResponse.json({ error: 'Failed to clone question' }, { status: 500 })
    }

    const newId = created.id as string
    // Maps copy best-effort: the question stands alone if these fail and
    // can be re-added in the edit form.
    let mapsCopied = true
    if ((mcs ?? []).length > 0) {
      const { error: mcError } = await supabase
        .from('question_misconceptions')
        .insert((mcs ?? []).map((m) => ({ ...m, question_id: newId })))
      if (mcError) mapsCopied = false
    }
    if ((topics ?? []).length > 0) {
      const { error: topicError } = await supabase
        .from('question_topics')
        .insert((topics ?? []).map((t) => ({ ...t, question_id: newId })))
      if (topicError) mapsCopied = false
    }

    if (!mapsCopied) {
      return NextResponse.json({ success: true, id: newId, warning: 'Question cloned; some maps were not copied' })
    }

    return NextResponse.json({ success: true, id: newId })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
