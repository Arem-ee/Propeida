import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { parsePastedQuestions } from '@/lib/question-text'

/**
 * Paste import: same validation bar as CSV, human format instead.
 * The text is re-parsed server-side — client previews are advisory only.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const text = typeof body.text === 'string' ? body.text : ''

    if (!text.trim()) {
      return NextResponse.json({ error: 'Nothing to import' }, { status: 400 })
    }

    const { questions, issues } = parsePastedQuestions(text)
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found', issues },
        { status: 400 },
      )
    }

    const { data: exams } = await supabase.from('exams').select('id, slug')
    const { data: subjects } = await supabase.from('subjects').select('id, slug')
    const examMap = new Map((exams ?? []).map((e) => [e.slug, e.id]))
    const subjectMap = new Map((subjects ?? []).map((s) => [s.slug, s.id]))

    const inserts: Record<string, unknown>[] = []
    const errors: string[] = issues.map((i) => `[block ${i.block}] ${i.reason}`)

    questions.forEach((q, i) => {
      const examId = examMap.get(q.exam_slug)
      const subjectId = subjectMap.get(q.subject_slug)
      if (!examId) {
        errors.push(`[block ${i + 1}] invalid exam_slug "${q.exam_slug}"`)
        return
      }
      if (!subjectId) {
        errors.push(`[block ${i + 1}] invalid subject_slug "${q.subject_slug}"`)
        return
      }
      inserts.push({
        exam_id: examId,
        subject_id: subjectId,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        cognitive_level: q.cognitive_level,
        source: q.source,
      })
    })

    let inserted = 0
    if (inserts.length > 0) {
      const { error } = await supabase.from('questions').insert(inserts)
      if (error) {
        errors.push('DB insert error: database operation failed')
      } else {
        inserted = inserts.length
      }
    }

    return NextResponse.json({ inserted, errors })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
