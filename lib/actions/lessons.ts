'use server'

import { randomUUID } from 'node:crypto'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applySubjectEvidence, getNextReviews } from '@/lib/mastery'
import { findPrerequisiteRepair } from '@/lib/practice'
import { getNoteById } from '@/lib/notes'
import type { RevisionNote } from '@/lib/notes'
import type { LessonEnhancement } from '@/lib/lessons'

export interface LessonQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  responseType: 'mcq' | 'text' | 'derivation'
}

/**
 * Lesson content, DB-first. Published DB rows win; the static library is
 * the fallback (and remains the seed source). Returns null when neither
 * has the lesson.
 */
export interface LessonEnglish {
  passages: {
    title: string
    purpose: string
    paragraphs: string[]
    questions: {
      question: string
      skill: string
      options: { key: string; text: string }[]
      answer: string
      explanation: string
      evidence: { paragraph: number; start: number; end: number }[]
    }[]
  }[]
  pairs: { pair: [string, string]; correctIndex: 0 | 1; rule: string; counterexample: string }[]
  rebuilds: { prompt: string; answer: string; rule: string }[]
  reflections: { prompt: string; modelResponse: string }[]
}

function toEnglishBlocks(
  byType: (t: string) => { block_type: string; content: Record<string, unknown> }[],
): LessonEnglish {
  const str = (v: unknown): string => (typeof v === 'string' ? v : '')
  const english: LessonEnglish = { passages: [], pairs: [], rebuilds: [], reflections: [] }

  for (const b of byType('passage')) {
    const c = b.content
    const paragraphs = (Array.isArray(c.paragraphs) ? c.paragraphs : []).map(String)
    if (paragraphs.length === 0) continue
    english.passages.push({
      title: str(c.title),
      purpose: str(c.purpose),
      paragraphs,
      questions: (Array.isArray(c.questions) ? c.questions : []).map((q) => {
        const o = q as Record<string, unknown>
        return {
          question: str(o.question),
          skill: str(o.skill) || 'comprehension',
          options: (Array.isArray(o.options) ? o.options : []).map((op) => {
            const oo = op as Record<string, unknown>
            return { key: str(oo.key), text: str(oo.text) }
          }),
          answer: str(o.answer),
          explanation: str(o.explanation),
          evidence: (Array.isArray(o.evidence) ? o.evidence : []).map((e) => {
            const ee = e as Record<string, unknown>
            return {
              paragraph: typeof ee.paragraph === 'number' ? ee.paragraph : 0,
              start: typeof ee.start === 'number' ? ee.start : 0,
              end: typeof ee.end === 'number' ? ee.end : 0,
            }
          }),
        }
      }),
    })
  }

  for (const b of byType('minimal_pair')) {
    const c = b.content
    const pair = Array.isArray(c.pair) ? c.pair.map(String) : []
    if (pair.length < 2) continue
    english.pairs.push({
      pair: [pair[0] ?? '', pair[1] ?? ''],
      correctIndex: c.correctIndex === 1 ? 1 : 0,
      rule: str(c.rule),
      counterexample: str(c.counterexample),
    })
  }

  for (const b of byType('sentence_rebuild')) {
    const c = b.content
    if (!str(c.prompt) || !str(c.answer)) continue
    english.rebuilds.push({ prompt: str(c.prompt), answer: str(c.answer), rule: str(c.rule) })
  }

  for (const b of byType('reflection')) {
    const c = b.content
    if (!str(c.prompt)) continue
    english.reflections.push({
      prompt: str(c.prompt),
      modelResponse: str(c.modelResponse ?? c.model_response),
    })
  }

  return english
}

/**
 * Lesson content, DB-first. Published DB rows win; the static library is
 * the fallback (and remains the seed source). Returns null when neither
 * has the lesson.
 */
export async function getLessonByPath(
  subjectSlug: string,
  lessonSlug: string,
): Promise<{
  note: RevisionNote
  enhancement: LessonEnhancement | null
  english: LessonEnglish
  subjectId: string
} | null> {
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, slug')
    .eq('slug', subjectSlug)
    .single()

  if (subject) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, slug, title, objective')
      .eq('subject_id', subject.id)
      .eq('slug', lessonSlug)
      .eq('status', 'published')
      .single()

    if (lesson) {
      const { data: blocks } = await supabase
        .from('lesson_blocks')
        .select('block_type, content')
        .eq('lesson_id', lesson.id)
        .order('position')

      const byType = (t: string) =>
        ((blocks ?? []) as { block_type: string; content: Record<string, unknown> }[]).filter(
          (b) => b.block_type === t,
        )

      const texts = byType('text')
      const first = texts[0]
      const sections = texts.slice(1).map((b) => ({
        heading: String(b.content.heading ?? ''),
        paragraphs: (b.content.paragraphs ?? []) as string[],
        bullets: (b.content.bullets ?? []) as string[],
      }))
      const callout = byType('callout')[0]
      const workedBlocks = byType('worked_example')
      const guided = byType('guided_question')[0]
      const vocabBlocks = byType('vocabulary_card')

      const firstParagraphs = (first?.content.paragraphs ?? []) as string[]
      const note: RevisionNote = {
        id: `${subject.slug}-${lesson.slug}`,
        subject: subject.slug as RevisionNote['subject'],
        topic: lesson.title,
        slug: lesson.slug,
        summary: firstParagraphs[0] ?? String(lesson.objective ?? ''),
        sections,
        examTip: callout ? String(callout.content.body ?? '') : '',
        practiceTopic: lesson.slug,
      }

      const enhancement: LessonEnhancement | null =
        workedBlocks.length > 0 || guided || vocabBlocks.length > 0
          ? {
              noteId: note.id,
              ...(workedBlocks.length > 0
                ? {
                    workedExamples: workedBlocks.map((worked) => ({
                      problem: String(worked.content.problem ?? ''),
                      steps: ((worked.content.steps ?? []) as {
                        operation: string
                        reason: string
                        result: string
                        predictPrompt: string
                        visual?: { kind: 'number-line' | 'fraction-bars' | 'balance' | 'plane'; props: Record<string, unknown> } | null
                      }[]).map((s) => ({
                        operation: String(s.operation ?? ''),
                        reason: String(s.reason ?? ''),
                        result: String(s.result ?? ''),
                        predictPrompt: String(s.predictPrompt ?? ''),
                        ...(s.visual && typeof s.visual === 'object' ? { visual: s.visual } : {}),
                      })),
                    })),
                  }
                : {}),
              ...(guided
                ? {
                    supported: {
                      question: String(guided.content.question ?? ''),
                      hints: ((guided.content.hints ?? []) as unknown[]).map(String),
                    },
                  }
                : {}),
              ...(vocabBlocks.length > 0
                ? {
                    vocabulary: vocabBlocks.flatMap(
                      (vocab) =>
                        ((vocab.content.words ?? []) as {
                          word: string
                          definition: string
                          contrast: string
                          sentence: string
                        }[]).map((w) => ({
                          word: String(w.word ?? ''),
                          definition: String(w.definition ?? ''),
                          contrast: String(w.contrast ?? ''),
                          sentence: String(w.sentence ?? ''),
                        }))),
                    }
                : {}),
            }
          : null

      return { note, enhancement, english: toEnglishBlocks(byType), subjectId: subject.id }
    }
  }

  const { getNoteByPath } = await import('@/lib/notes')
  const { getEnhancement } = await import('@/lib/lessons')
  const staticNote = getNoteByPath(subjectSlug, lessonSlug)
  if (!staticNote) return null
  return {
    note: staticNote,
    enhancement: getEnhancement(staticNote.id),
    english: { passages: [], pairs: [], rebuilds: [], reflections: [] },
    subjectId: subject?.id ?? '',
  }
}

interface AttemptInput {
  subjectId: string
  lessonId: string
  questionId: string | null
  selectedAnswer: string | null
  confidence: 'sure' | 'unsure' | null
  attemptType: 'diagnostic' | 'supported' | 'independent'
}

async function resolveExamForSubject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subjectId: string,
): Promise<string | null> {
  const { data: links } = await supabase
    .from('exam_subjects')
    .select('exam_id')
    .eq('subject_id', subjectId)
  const examIds = (links ?? []).map((l) => l.exam_id)
  if (examIds.length === 0) return null

  // Prefer the exam holding the deepest bank for this subject.
  let best: string | null = null
  let bestCount = -1
  for (const examId of examIds) {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', examId)
      .eq('subject_id', subjectId)
      .eq('status', 'published')
    if ((count ?? 0) > bestCount) {
      bestCount = count ?? 0
      best = examId
    }
  }
  return bestCount > 0 ? best : null
}

/**
 * Lesson question set: 1 diagnostic + 2 independent, drawn from the
 * deepest bank holding this subject. Answers never leave the server —
 * checking happens in recordLessonAttempt.
 */
export async function getLessonQuestions(subjectId: string): Promise<{
  examId: string
  diagnostic: LessonQuestion | null
  independent: LessonQuestion[]
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const examId = await resolveExamForSubject(supabase, subjectId)
  if (!examId) return { examId: '', diagnostic: null, independent: [] }

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: examId,
    p_subject_ids: [subjectId],
    p_difficulty: null,
    p_limit: 3,
    p_seed: randomUUID(),
    p_response_types: ['mcq', 'text', 'derivation'],
  })
  if (error) throw new Error('Failed to load lesson questions')

  const rows = ((data ?? []) as {
    id: string
    subjectId?: string
    subject_id?: string
    questionText?: string
    question_text?: string
    options: { key: string; text: string }[] | null
    responseType?: string
    response_type?: string
  }[]).map((q) => ({
    id: q.id,
    subjectId: q.subjectId ?? q.subject_id ?? subjectId,
    questionText: q.questionText ?? q.question_text ?? '',
    options: q.options ?? [],
    responseType: (q.responseType ?? q.response_type ?? (q.options && q.options.length > 0 ? 'mcq' : 'text')) as
      | 'mcq'
      | 'text'
      | 'derivation',
  }))

  const [diagnostic, ...independent] = rows
  return { examId, diagnostic: diagnostic ?? null, independent }
}

/**
 * Checkout twin: one isomorphic follow-up (same topic where mapped, else
 * same subject, always unseen here) after an incorrect independent answer.
 * Transfer proven, not memorised. Returns null when the bank has nothing
 * fresh to offer.
 */
export async function getTwinQuestion(
  subjectId: string,
  excludeIds: string[],
  sourceQuestionId?: string,
): Promise<LessonQuestion | null> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const examId = await resolveExamForSubject(supabase, subjectId)
  if (!examId) return null

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: examId,
    p_subject_ids: [subjectId],
    p_difficulty: null,
    p_limit: 8,
    p_seed: randomUUID(),
    p_response_types: ['mcq', 'text', 'derivation'],
  })
  if (error) return null

  const rows = ((data ?? []) as {
    id: string
    subjectId?: string
    subject_id?: string
    questionText?: string
    question_text?: string
    options: { key: string; text: string }[] | null
    responseType?: string
    response_type?: string
  }[])
  const fresh = rows.filter((q) => !excludeIds.includes(q.id))
  if (fresh.length === 0) return null

  // Prefer the same topic as the missed question when mappings exist.
  let pick = fresh[0]!
  if (sourceQuestionId) {
    const { data: sourceTopics } = await supabase
      .from('question_topics')
      .select('topic_id')
      .eq('question_id', sourceQuestionId)
    const topicIds = (sourceTopics ?? []).map((t) => t.topic_id)
    if (topicIds.length > 0) {
      const { data: sameTopic } = await supabase
        .from('question_topics')
        .select('question_id')
        .in('topic_id', topicIds)
        .in('question_id', fresh.map((q) => q.id))
        .limit(1)
      const match = (sameTopic ?? [])[0]
      const found = match && fresh.find((q) => q.id === match.question_id)
      if (found) pick = found
    }
  }

  return {
    id: pick.id,
    subjectId: pick.subjectId ?? pick.subject_id ?? subjectId,
    questionText: pick.questionText ?? pick.question_text ?? '',
    options: pick.options ?? [],
    responseType: (pick.responseType ?? pick.response_type ?? (pick.options && pick.options.length > 0 ? 'mcq' : 'text')) as
      | 'mcq'
      | 'text'
      | 'derivation',
  }
}

export async function recordLessonAttempt(input: AttemptInput): Promise<{
  isCorrect: boolean
  graded: boolean
  correctAnswer: string
  explanation: string
  misconception: { name: string; explanation: string; repeatCount: number; repairHref: string | null } | null
  prerequisite: { name: string; href: string } | null
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  if (input.confidence !== null && !['sure', 'unsure'].includes(input.confidence)) {
    throw new Error('Invalid confidence')
  }
  if (!['diagnostic', 'supported', 'independent'].includes(input.attemptType)) {
    throw new Error('Invalid attempt type')
  }

  // Open-ended supported prompts carry no bank question: engagement is
  // recorded (is_correct null) without polluting the mastery model.
  if (!input.questionId) {
    const { error: insertError } = await supabase.from('learning_attempts').insert({
      user_id: user.id,
      subject_id: input.subjectId,
      question_id: null,
      lesson_id: input.lessonId,
      attempt_type: input.attemptType,
      is_correct: null,
      confidence: input.confidence,
    })
    if (insertError) throw new Error('Failed to record attempt')
    return { isCorrect: false, graded: false, correctAnswer: '', explanation: '', misconception: null, prerequisite: null }
  }

  // The answer key lives in question_answers, a table the learner role
  // cannot read at all. It is read with the service-role client, inside
  // an action that has already proven the caller's identity with the
  // caller's own session, and only what this action chooses to return
  // ever leaves the server.
  const admin = createAdminClient()
  const { data: question, error: qError } = await admin
    .from('questions')
    .select('id, response_type')
    .eq('id', input.questionId)
    .single()
  if (qError || !question) throw new Error('Question not found')

  const { data: answer } = await admin
    .from('question_answers')
    .select('correct_answer, explanation')
    .eq('question_id', input.questionId)
    .maybeSingle()

  const responseType = question.response_type ?? 'mcq'
  // Free-response and derivation items are not graded by key match. The
  // same column carries the model answer, which is revealed rather than
  // compared — so these attempts record is_correct null (unknown), never
  // a false that would drag the mastery score down.
  const isFreeResponse = responseType === 'text' || responseType === 'derivation'
  const isCorrect = isFreeResponse ? false : answer?.correct_answer === input.selectedAnswer

  let misconception: { name: string; explanation: string; repeatCount: number; repairHref: string | null } | null = null
  let misconceptionCode: string | null = null
  let prerequisite: { name: string; href: string } | null = null
  if (!isFreeResponse && !isCorrect && input.selectedAnswer) {
    const { data: mc } = await supabase
      .from('question_misconceptions')
      .select('misconception_code, misconception_name, explanation, repair_note_id')
      .eq('question_id', input.questionId)
      .eq('option_key', input.selectedAnswer)
      .maybeSingle()
    if (mc) {
      misconceptionCode = mc.misconception_code
      // Repeat detection: how many times has this exact error appeared
      // before for this learner? A repeat routes to root-fix, not retry.
      const { count: repeats } = await supabase
        .from('learning_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('misconception_code', mc.misconception_code)
      const repairNote = mc.repair_note_id ? getNoteById(mc.repair_note_id) : null
      misconception = {
        name: mc.misconception_name,
        explanation: mc.explanation,
        repeatCount: repeats ?? 0,
        repairHref: repairNote ? `/learn/${repairNote.subject}/${repairNote.slug}` : null,
      }
      // Prerequisite routing: on a repeat, walk down to root-fix.
      if ((repeats ?? 0) > 0) {
        prerequisite = await findPrerequisiteRepair(supabase, input.questionId)
      }
    }
  }

  const { error: insertError } = await supabase.from('learning_attempts').insert({
    user_id: user.id,
    subject_id: input.subjectId,
    question_id: input.questionId,
    lesson_id: input.lessonId,
    attempt_type: input.attemptType,
    // Unknown, not false: an ungraded attempt must not count against the
    // learner in the mastery model.
    is_correct: isFreeResponse ? null : isCorrect,
    confidence: input.confidence,
    misconception_code: misconceptionCode,
    ...(isFreeResponse ? { response_text: input.selectedAnswer } : {}),
  })
  if (insertError) throw new Error('Failed to record attempt')

  return {
    isCorrect,
    graded: !isFreeResponse,
    correctAnswer: answer?.correct_answer ?? '',
    explanation: answer?.explanation ?? '',
    misconception,
    prerequisite,
  }
}

/**
 * Close-out: fold this lesson's diagnostic + independent results into the
 * learner model through the same rules as sessions. Counts come from the
 * client (its own model — gaming it only mis-schedules its own reviews),
 * bounded sanely server-side.
 */
export async function completeLesson(input: {
  subjectId: string
  correct: number
  total: number
}): Promise<{ nextReviewAt: string | null; status: string }> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const correct = Math.max(0, Math.min(input.correct, 12))
  const total = Math.max(1, Math.min(input.total, 12))

  const bySubject = new Map<string, { correct: number; total: number }>()
  bySubject.set(input.subjectId, { correct, total })

  try {
    await applySubjectEvidence(supabase, user.id, bySubject, null)
  } catch (err) {
    console.error('[mastery] completeLesson failed:', err)
  }

  // A finished lesson is a completed planned action: it extends the
  // streak. Best-effort, like all post-completion writes.
  try {
    await supabase.rpc('update_streak', { p_user_id: user.id })
  } catch (err) {
    console.error('[streak] update_streak failed:', err)
  }

  const reviews = await getNextReviews(supabase, user.id, [input.subjectId])
  return { nextReviewAt: reviews[input.subjectId] ?? null, status: 'recorded' }
}

export async function saveLessonReflection(input: {
  lessonId: string
  explanation: string
}): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('lesson_reflections').insert({
    user_id: user.id,
    lesson_id: input.lessonId,
    explanation_text: input.explanation,
  })
  if (error) throw new Error('Failed to save reflection')
}

export async function getNextRecommendedLesson(subjectSlug: string): Promise<{
  note: { id: string; topic: string; slug: string; summary: string; subject: string; responseType: 'mcq' | 'text' | 'derivation' } | null;
  completed: boolean;
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  // Get subject ID
  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single()

  if (!subject) return { note: null, completed: true }

  // Curriculum order: a lesson's place in the syllabus. Rows without a
  // place fall back to the order they were created, so nothing is lost.
  const { data: notes } = await supabase
    .from('lessons')
    .select('id, title, slug, objective, status, sort_order, created_at')
    .eq('subject_id', subject.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (!notes || notes.length === 0) return { note: null, completed: true }

  // Get user's completed lesson IDs for this subject
  const { data: attempts } = await supabase
    .from('learning_attempts')
    .select('lesson_id, is_correct, attempt_type')
    .eq('user_id', user.id)
    .eq('subject_id', subject.id)
    .not('lesson_id', 'is', null)

  // Build a map of lesson_id -> has_correct_independent
  const completedLessonIds = new Set<string>()
  for (const a of attempts ?? []) {
    if (a.lesson_id && a.is_correct === true && a.attempt_type === 'independent') {
      completedLessonIds.add(a.lesson_id)
    }
  }

  // Find first incomplete lesson
  for (const lesson of notes) {
    if (!completedLessonIds.has(lesson.id)) {
      return {
        note: {
          id: lesson.id,
          topic: lesson.title,
          slug: lesson.slug,
          summary: lesson.objective ?? '',
          subject: subjectSlug,
          responseType: 'mcq' as const, // DB doesn't have response_type yet; default to mcq
        },
        completed: false,
      }
    }
  }

  return { note: null, completed: true }
}

export interface CurriculumLesson {
  id: string
  slug: string
  title: string
  objective: string
  estimatedMinutes: number | null
}

export interface CurriculumTopicNode {
  id: string
  slug: string
  name: string
  description: string
  order: number
  section: string
  sectionTitle: string
  lesson: CurriculumLesson | null
}

export interface CurriculumSection {
  key: string
  title: string
  topics: CurriculumTopicNode[]
}

/**
 * The subject curriculum map: syllabus sections, the topics under them, and
 * the lesson that teaches each topic.
 *
 * A topic with no published lesson is still listed — the learner sees the
 * shape of what they are working towards, and that the topic is still to
 * come.
 */
export async function getSubjectCurriculum(subjectSlug: string): Promise<{
  sections: CurriculumSection[]
  recommendedLessonId: string | null
}> {
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single()
  if (!subject) return { sections: [], recommendedLessonId: null }

  const { data: topics } = await supabase
    .from('topics')
    .select('id, slug, name, description, sort_order, section_key, section_title')
    .eq('subject_id', subject.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug, title, objective, topic_id, estimated_minutes')
    .eq('subject_id', subject.id)
    .eq('status', 'published')

  const lessonByTopic = new Map<string, CurriculumLesson>()
  for (const l of lessons ?? []) {
    if (!l.topic_id) continue
    lessonByTopic.set(l.topic_id, {
      id: l.id,
      slug: l.slug,
      title: l.title,
      objective: l.objective ?? '',
      estimatedMinutes: l.estimated_minutes ?? null,
    })
  }

  const bySection = new Map<string, CurriculumSection>()
  for (const t of topics ?? []) {
    const key = t.section_key ?? 'A'
    if (!bySection.has(key)) {
      bySection.set(key, {
        key,
        title: t.section_title ?? key,
        topics: [],
      })
    }
    bySection.get(key)!.topics.push({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description ?? '',
      order: t.sort_order ?? 0,
      section: key,
      sectionTitle: t.section_title ?? key,
      lesson: lessonByTopic.get(t.id) ?? null,
    })
  }

  // The recommended lesson is the first one in curriculum order that the
  // learner has not yet answered correctly on the independent attempt.
  let recommendedLessonId: string | null = null
  try {
    const user = await getAuthUser(supabase)
    if (user) {
      const { data: attempts } = await supabase
        .from('learning_attempts')
        .select('lesson_id, is_correct, attempt_type')
        .eq('user_id', user.id)
        .eq('subject_id', subject.id)
        .not('lesson_id', 'is', null)
      const done = new Set(
        (attempts ?? [])
          .filter((a) => a.is_correct === true && a.attempt_type === 'independent')
          .map((a) => a.lesson_id),
      )
      const ordered = (lessons ?? [])
        .filter((l) => l.topic_id)
        .sort((a, b) => {
          const ta = topics?.find((t) => t.id === a.topic_id)?.sort_order ?? 0
          const tb = topics?.find((t) => t.id === b.topic_id)?.sort_order ?? 0
          return ta - tb
        })
      recommendedLessonId = ordered.find((l) => !done.has(l.id))?.id ?? null
    }
  } catch {
    // An unauthenticated visitor still gets the map; only the highlight is
    // missing.
  }

  return { sections: [...bySection.values()], recommendedLessonId }
}
