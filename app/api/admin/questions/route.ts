import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeOptions } from '@/lib/questions'

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

    const { error } = await supabase.from('questions').insert({
      exam_id,
      subject_id,
      question_text,
      options: normalizeOptions(options),
      correct_answer,
      explanation: explanation || null,
      difficulty,
    })

    if (error) return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    return NextResponse.json({ success: true })
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

    const { error } = await supabase
      .from('questions')
      .update({ exam_id, subject_id, question_text, options: normalizeOptions(options), correct_answer, explanation: explanation || null, difficulty })
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
