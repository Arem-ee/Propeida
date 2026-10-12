import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeOptions, validateMisconceptions, validateTopics, type MisconceptionInput, type TopicInput } from '@/lib/questions'

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Registry codes for a subject, for validating misconception rows.
 * Empty registry (new subject) means no codes validate — author codes first.
 */
async function registryCodesFor(supabase: AdminClient, subjectId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('misconception_codes')
    .select('code')
    .eq('subject_id', subjectId)
  return new Set((data ?? []).map((r) => r.code))
}

/**
 * Replace-all write for a question's topic map. Same rationale as
 * misconceptions: authoring-scale volumes favor delete+insert.
 */
async function saveTopics(
  supabase: AdminClient,
  questionId: string,
  rows: TopicInput[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('question_topics')
    .delete()
    .eq('question_id', questionId)
  if (deleteError) throw new Error('Failed to replace topic mappings')
  if (rows.length === 0) return
  const { error: insertError } = await supabase
    .from('question_topics')
    .insert(rows.map((r) => ({ ...r, question_id: questionId })))
  if (insertError) throw new Error('Failed to save topic mappings')
}

async function fetchTopicsForValidation(
  supabase: AdminClient,
  ids: string[],
): Promise<{ id: string; subject_id: string }[]> {
  const { data, error } = await supabase.from('topics').select('id, subject_id').in('id', ids)
  if (error) throw new Error('Failed to look up topics')
  return (data ?? []) as { id: string; subject_id: string }[]
}

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

    const cognitiveLevel = body.cognitive_level ?? null
    if (cognitiveLevel !== null && !['remember', 'understand', 'apply', 'analyze'].includes(cognitiveLevel)) {
      return NextResponse.json({ error: 'cognitive_level must be remember, understand, apply, or analyze' }, { status: 400 })
    }

    let misconceptions: MisconceptionInput[] = []
    try {
      misconceptions = validateMisconceptions(body.misconceptions, correct_answer, await registryCodesFor(supabase, subject_id))
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid misconceptions' }, { status: 400 })
    }

    let topics: TopicInput[] = []
    try {
      topics = await validateTopics(
        (ids) => fetchTopicsForValidation(supabase, ids),
        body.topics,
        subject_id,
      )
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid topics' }, { status: 400 })
    }

    const { data: created, error } = await supabase.from('questions').insert({
      exam_id,
      subject_id,
      question_text,
      options: normalizeOptions(options),
      correct_answer,
      explanation: explanation || null,
      difficulty,
      cognitive_level: cognitiveLevel,
    }).select('id').single()

    if (error || !created) return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })

    try {
      await saveMisconceptions(supabase, created.id, misconceptions)
      await saveTopics(supabase, created.id, topics)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save maps' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: created.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, exam_id, subject_id, question_text, options, correct_answer, explanation, difficulty } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing question id' }, { status: 400 })
    }

    const update: Record<string, unknown> = {
      exam_id, subject_id, question_text,
      options: normalizeOptions(options),
      correct_answer, explanation: explanation || null, difficulty,
    }
    if (body.cognitive_level !== undefined) {
      if (body.cognitive_level !== null && !['remember', 'understand', 'apply', 'analyze'].includes(body.cognitive_level)) {
        return NextResponse.json({ error: 'cognitive_level must be remember, understand, apply, or analyze' }, { status: 400 })
      }
      update.cognitive_level = body.cognitive_level
    }

    // Editorial workflow: status and verification travel with the edit.
    // The gate: nothing publishes while still unverified.
    if (body.status !== undefined) {
      if (!['draft', 'in_review', 'published', 'rejected'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      update.status = body.status
    }
    if (body.verified_state !== undefined) {
      if (!['unverified', 'source_cited', 'human_verified'].includes(body.verified_state)) {
        return NextResponse.json({ error: 'Invalid verified_state' }, { status: 400 })
      }
      update.verified_state = body.verified_state
      if (body.verified_state !== 'unverified') {
        update.verified_by = user.id
        update.verified_at = new Date().toISOString()
      }
    }
    if (body.review_note !== undefined) {
      update.review_note = body.review_note || null
    }

    if (update.status === 'published') {
      const state = update.verified_state as string | undefined
      if (state === 'unverified') {
        return NextResponse.json({ error: 'Verify the question before publishing' }, { status: 400 })
      }
      if (state === undefined) {
        // Status change without a verification change: check the stored state.
        const { data: current } = await supabase
          .from('questions')
          .select('verified_state')
          .eq('id', id)
          .single()
        if (!current || current.verified_state === 'unverified') {
          return NextResponse.json({ error: 'Verify the question before publishing' }, { status: 400 })
        }
      }
    }

    let misconceptions: MisconceptionInput[] | null = null
    if (body.misconceptions !== undefined) {
      try {
        misconceptions = validateMisconceptions(
          body.misconceptions,
          correct_answer,
          await registryCodesFor(supabase, subject_id),
        )
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid misconceptions' }, { status: 400 })
      }
    }

    let topics: TopicInput[] | null = null
    if (body.topics !== undefined) {
      try {
        topics = await validateTopics(
          (ids) => fetchTopicsForValidation(supabase, ids),
          body.topics,
          subject_id,
        )
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid topics' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('questions')
      .update(update)
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })

    if (misconceptions !== null) {
      try {
        await saveMisconceptions(supabase, id, misconceptions)
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save misconceptions' }, { status: 500 })
      }
    }

    if (topics !== null) {
      try {
        await saveTopics(supabase, id, topics)
      } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to save topics' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
