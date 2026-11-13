'use server'

import { randomUUID } from 'node:crypto'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applySubjectEvidence, getNextReviews } from '@/lib/mastery'
import { findPrerequisiteRepair } from '@/lib/practice'
import { getNoteById } from '@/lib/notes'
import type { RevisionNote } from '@/lib/notes'
import type { NoteSection } from '@/lib/notes'
import { toLessonVisual } from '@/lib/notes/visual'
import type { LessonEnhancement } from '@/lib/lessons'
import { getExamScope } from '@/lib/exam-scope'

/** One inline check authored on a text block: question, options, answer index. */
function toSectionCheck(value: unknown): NoteSection['check'] {
  if (!value || typeof value !== 'object') return undefined
  const v = value as Record<string, unknown>
  const question = typeof v.question === 'string' ? v.question.trim() : ''
  const options = Array.isArray(v.options) ? v.options.map(String) : []
  const answer = typeof v.answer === 'number' ? v.answer : -1
  if (!question || options.length < 2 || answer < 0 || answer >= options.length) return undefined
  return {
    question,
    options,
    answer,
    ...(typeof v.why === 'string' && v.why.trim() ? { why: v.why.trim() } : {}),
  }
}

/** One figure on a text block; malformed figures are simply dropped. */
function toSectionVisual(value: unknown): NoteSection['visual'] {
  return toLessonVisual(value) ?? undefined
}

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
  examId: string | null
  lessonId: string
  topicId: string | null
  /**
   * Free users get the first lesson of each subject. Everything after is
   * Pro. The server enforces it here -- a deep link must not open what
   * the list page hides.
   */
  gated: boolean
  /** The one line shown to free users behind the gate. */
  teaserTakeaway: string | null
} | null> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id, slug')
    .eq('slug', subjectSlug)
    .single()

  // Content is path-bound: a Post-UTME learner must not open a JAMB lesson,
  // even from an old bookmark or a leaked link.
  const { data: { user } } = await supabase.auth.getUser()
  const scope = user ? await getExamScope(supabase, user.id) : null

  if (subject) {
    // Lesson content is paid material: read it with the service role so the
    // paywall decision happens in this action, not in what the caller can
    // see via PostgREST. RLS denies published-lesson reads to anyone who is
    // not the first-lesson free tier or an entitled learner.
    const { data: lesson } = await admin
      .from('lessons')
      .select('id, slug, title, objective, exam_id, topic_id')
      .eq('subject_id', subject.id)
      .eq('slug', lessonSlug)
      .eq('status', 'published')
      .single()

    if (lesson) {
      if (scope?.restricted && lesson.exam_id && !scope.examIds?.includes(lesson.exam_id)) {
        return null
      }
      const { data: blocks } = await admin
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
      const firstParagraphs = (first?.content.paragraphs ?? []) as string[]
      const sections = [
        ...(firstParagraphs.length > 1
          ? [{ heading: '', paragraphs: firstParagraphs.slice(1), bullets: [] }]
          : []),
        ...texts.slice(1).map((b) => ({
          heading: String(b.content.heading ?? ''),
          paragraphs: (b.content.paragraphs ?? []) as string[],
          bullets: (b.content.bullets ?? []) as string[],
          ...(typeof b.content.takeaway === 'string' && b.content.takeaway.trim()
            ? { takeaway: b.content.takeaway.trim() }
            : {}),
          ...(toSectionCheck(b.content.check)
            ? { check: toSectionCheck(b.content.check) }
            : {}),
          ...(toSectionVisual(b.content.visual)
            ? { visual: toSectionVisual(b.content.visual) }
            : {}),
        })),
      ]
      const callout = byType('callout')[0]
      const workedBlocks = byType('worked_example')
      const guided = byType('guided_question')[0]
      const vocabBlocks = byType('vocabulary_card')

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

      // Free lesson gate: the first lesson of each subject is free.
      const teaserTakeaway =
        sections.find((s) => (s.takeaway ?? '').trim())?.takeaway ??
        note.summary ??
        null
      let gated = false
      if (user) {
        const { getProStatus } = await import('@/lib/entitlements')
        const pro = await getProStatus(user.id)
        if (!pro.isPro) {
          const [{ data: subjectTopics }, { data: subjectLessons }] = await Promise.all([
            supabase
              .from('topics')
              .select('id, sort_order')
              .eq('subject_id', subject.id)
              .eq('published', true)
              .order('sort_order'),
            admin
              .from('lessons')
              .select('id, topic_id, exam_id')
              .eq('subject_id', subject.id)
              .eq('status', 'published'),
          ])
          const orderOf = new Map(
            (subjectTopics ?? []).map((t) => [t.id, t.sort_order ?? 0]),
          )
          const visible = (subjectLessons ?? []).filter(
            (l) =>
              l.exam_id === null ||
              (scope?.examIds?.includes(l.exam_id) ?? false),
          )
          const first = visible
            .filter((l) => l.topic_id && orderOf.has(l.topic_id))
            .sort(
              (a, b) =>
                (orderOf.get(a.topic_id!) ?? 0) - (orderOf.get(b.topic_id!) ?? 0),
            )[0]
          if (first && first.id !== lesson.id) gated = true
        }
      }

      return {
        note,
        enhancement,
        english: toEnglishBlocks(byType),
        subjectId: subject.id,
        examId: lesson.exam_id ?? null,
        lessonId: lesson.id,
        topicId: lesson.topic_id ?? null,
        gated,
        teaserTakeaway,
      }
    }
  }

  const { getNoteByPath } = await import('@/lib/notes')
  const { getEnhancement } = await import('@/lib/lessons')
  const staticNote = getNoteByPath(subjectSlug, lessonSlug)
  if (!staticNote) return null
  const { getProStatus } = await import('@/lib/entitlements')
  const pro = user ? await getProStatus(user.id).catch(() => null) : null
  const staticGated = !(pro?.isPro)
  return {
    note: staticNote,
    enhancement: getEnhancement(staticNote.id),
    english: { passages: [], pairs: [], rebuilds: [], reflections: [] },
    subjectId: subject?.id ?? '',
    examId: null,
    lessonId: '',
    topicId: null,
    gated: staticGated,
    teaserTakeaway: staticGated ? staticNote.summary : null,
  }
}

/**
 * The next lesson in curriculum order, from the database.
 *
 * The static notes library is the seed source, not the running order — it
 * holds five lessons and knows nothing about the syllabus, so a learner who
 * finished "The Cloze Test" would be sent to "Parts of Speech".
 */
export async function getNextLessonInCurriculum(
  subjectSlug: string,
  currentSlug: string,
): Promise<{ topic: string; href: string } | null> {
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single()
  if (!subject) return null

  const { data: { user } } = await supabase.auth.getUser()
  const scope = user ? await getExamScope(supabase, user.id) : null
  const pathExamId = scope?.primaryExamId ?? null

  const { data: allLessons } = await createAdminClient()
    .from('lessons')
    .select('slug, title, sort_order, exam_id')
    .eq('subject_id', subject.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  // Shared lessons travel with every path; exam-scoped lessons stay in their
  // own lane. The next link must never jump from a Post-UTME lesson into JAMB.
  const lessons = (allLessons ?? []).filter(
    (l) => l.exam_id === null || (pathExamId !== null && l.exam_id === pathExamId),
  )

  if (lessons.length === 0) return null

  const index = lessons.findIndex((l) => l.slug === currentSlug)
  if (index < 0) return null
  const next = lessons[index + 1]
  if (!next) return null
  return { topic: next.title, href: `/learn/${subjectSlug}/${next.slug}` }
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
  examId?: string | null,
): Promise<string | null> {
  // Never infer an exam from "whichever bank is deepest". That was the
  // original collision: shared lessons fell through to the largest bank,
  // which meant JAMB questions inside a Post-UTME lesson (or the reverse).
  // The caller must pass the lesson's exam, or the learner's path exam.
  if (!examId) return null

  const { data: link } = await supabase
    .from('exam_subjects')
    .select('exam_id')
    .eq('exam_id', examId)
    .eq('subject_id', subjectId)
    .maybeSingle()

  return link?.exam_id ?? null
}

/**
 * Lesson question set: 1 diagnostic + 2 independent, drawn from the bank's
 * exam for this subject. Answers never leave the server — checking happens
 * in recordLessonAttempt.
 *
 * When a lesson is scoped to an exam, only that exam's bank is used. A
 * JAMB lesson must never be quizzed with a Post-UTME question.
 *
 * When the lesson's topic has tagged questions, those are preferred, so
 * the micro-check tests what the learner has just been taught rather than
 * whatever the bank happened to return.
 */
export async function getLessonQuestions(
  subjectId: string,
  examId?: string | null,
  topicId?: string | null,
): Promise<{
  examId: string
  diagnostic: LessonQuestion | null
  independent: LessonQuestion[]
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const scope = await getExamScope(supabase, user.id)
  const requestedExamId =
    examId && (!scope.restricted || scope.examIds?.includes(examId))
      ? examId
      : scope.primaryExamId
  const scoped = await resolveExamForSubject(supabase, subjectId, requestedExamId)
  if (!scoped) return { examId: '', diagnostic: null, independent: [] }

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: scoped,
    p_subject_ids: [subjectId],
    p_difficulty: null,
    p_limit: 12,
    p_seed: randomUUID(),
    p_response_types: ['mcq', 'text', 'derivation'],
  })
  if (error) throw new Error('Could not load this lesson.')

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

  // Prefer questions tagged to this lesson's topic.
  let ordered = rows
  if (topicId && rows.length > 0) {
    const { data: tagged } = await supabase
      .from('question_topics')
      .select('question_id')
      .eq('topic_id', topicId)
      .in('question_id', rows.map((r) => r.id))
    const taggedIds = new Set((tagged ?? []).map((t) => t.question_id))
    const onTopic = rows.filter((r) => taggedIds.has(r.id))
    const rest = rows.filter((r) => !taggedIds.has(r.id))
    ordered = [...onTopic, ...rest]
  }

  const [diagnostic, ...independent] = ordered
  return { examId: scoped, diagnostic: diagnostic ?? null, independent }
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
  examId?: string | null,
): Promise<LessonQuestion | null> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return null

  const scope = await getExamScope(supabase, user.id)
  const requestedExamId =
    examId && (!scope.restricted || scope.examIds?.includes(examId))
      ? examId
      : scope.primaryExamId
  const scoped = await resolveExamForSubject(supabase, subjectId, requestedExamId)
  if (!scoped) return null

  const { data, error } = await supabase.rpc('get_session_questions', {
    p_exam_id: scoped,
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
  if (!user) throw new Error('Please sign in again.')

  // Attempts are server-authored evidence: learners can read their own rows,
  // but only the service role writes them (and the mastery fold below).
  const admin = createAdminClient()

  if (input.confidence !== null && !['sure', 'unsure'].includes(input.confidence)) {
    throw new Error('Please choose how confident you feel.')
  }
  if (!['diagnostic', 'supported', 'independent'].includes(input.attemptType)) {
    throw new Error('Something was wrong with that answer.')
  }

  // Open-ended supported prompts carry no bank question: engagement is
  // recorded (is_correct null) without polluting the mastery model.
  if (!input.questionId) {
    const { error: insertError } = await admin.from('learning_attempts').insert({
      user_id: user.id,
      subject_id: input.subjectId,
      question_id: null,
      lesson_id: input.lessonId,
      attempt_type: input.attemptType,
      is_correct: null,
      confidence: input.confidence,
    })
    if (insertError) throw new Error('Could not save your answer.')
    return { isCorrect: false, graded: false, correctAnswer: '', explanation: '', misconception: null, prerequisite: null }
  }

  // The answer key lives in question_answers, a table the learner role
  // cannot read at all. It is read with the service-role client, inside
  // an action that has already proven the caller's identity with the
  // caller's own session, and only what this action chooses to return
  // ever leaves the server.
  const { data: question, error: qError } = await admin
    .from('questions')
    .select('id, response_type')
    .eq('id', input.questionId)
    .single()
  if (qError || !question) throw new Error('That question could not be found.')

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
    const { data: mc } = await admin
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

  const { error: insertError } = await admin.from('learning_attempts').insert({
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
  if (insertError) throw new Error('Could not save your answer.')

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
  if (!user) throw new Error('Please sign in again.')

  const correct = Math.max(0, Math.min(input.correct, 12))
  const total = Math.max(1, Math.min(input.total, 12))

  const bySubject = new Map<string, { correct: number; total: number }>()
  bySubject.set(input.subjectId, { correct, total })

  try {
    // Lesson evidence belongs to the learner's current path exam — never to a
    // global pool. Shared lessons still record here, under their own path.
    const scope = await getExamScope(supabase, user.id)
    await applySubjectEvidence(supabase, user.id, bySubject, null, scope.primaryExamId)
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
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase.from('lesson_reflections').insert({
    user_id: user.id,
    lesson_id: input.lessonId,
    explanation_text: input.explanation,
  })
  if (error) throw new Error('Could not save your reflection.')
}

export async function getNextRecommendedLesson(subjectSlug: string): Promise<{
  note: { id: string; topic: string; slug: string; summary: string; subject: string; responseType: 'mcq' | 'text' | 'derivation' } | null;
  completed: boolean;
}> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  // Get subject ID
  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single()

  if (!subject) return { note: null, completed: true }

  // Curriculum order: a lesson's place in the syllabus. Rows without a
  // place fall back to the order they were created, so nothing is lost.
  // The lesson set is path-bound: shared lessons plus the learner's own
  // exam. A Post-UTME learner is never recommended a JAMB lesson.
  const scope = await getExamScope(supabase, user.id)
  const pathExamId = scope.primaryExamId

  const { data: allNotes } = await supabase
    .from('lessons')
    .select('id, title, slug, objective, status, sort_order, created_at, exam_id')
    .eq('subject_id', subject.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  const notes = (allNotes ?? []).filter(
    (l) => l.exam_id === null || (pathExamId !== null && l.exam_id === pathExamId),
  )

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
  examSlug: string | null
}> {
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single()
  if (!subject) return { sections: [], recommendedLessonId: null, examSlug: null }

  // The curriculum travels with the learner's path, not with whichever exam
  // happened to own the first topic row. Shared content stays visible to
  // every path; exam-scoped content stays in its lane. English is the proof:
  // JAMB's Use of English is not UNILORIN Post-UTME's, so the same subject
  // slug cannot mean one global syllabus for everyone.
  const { data: { user } } = await supabase.auth.getUser()
  const scope = user ? await getExamScope(supabase, user.id) : null
  const pathExamId = scope?.primaryExamId ?? null
  const examSlug = scope?.primaryExamSlug ?? null

  const { data: topics } = await supabase
    .from('topics')
    .select('id, slug, name, description, sort_order, section_key, section_title, exam_id')
    .eq('subject_id', subject.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  // Shared topics (no exam scope) stay visible to every path.
  const visible = (topics ?? []).filter(
    (t) => t.exam_id === null || (pathExamId !== null && t.exam_id === pathExamId),
  )

  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, slug, title, objective, topic_id, estimated_minutes, exam_id')
    .eq('subject_id', subject.id)
    .eq('status', 'published')

  // Shared lessons (no exam scope) stay available to every path.
  const lessons = (allLessons ?? []).filter(
    (l) => l.exam_id === null || (pathExamId !== null && l.exam_id === pathExamId),
  )

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
  for (const t of visible) {
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
          const ta = visible.find((t) => t.id === a.topic_id)?.sort_order ?? 0
          const tb = visible.find((t) => t.id === b.topic_id)?.sort_order ?? 0
          return ta - tb
        })
      recommendedLessonId = ordered.find((l) => !done.has(l.id))?.id ?? null
    }
  } catch {
    // An unauthenticated visitor still gets the map; only the highlight is
    // missing.
  }

  return { sections: [...bySection.values()], recommendedLessonId, examSlug }
}
