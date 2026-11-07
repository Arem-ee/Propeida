import type { createClient } from './supabase/server'

export {
  filterExamSubjectMapForScope,
  filterSubjectsForScope,
  isStandaloneSubject,
  STANDALONE_SUBJECT_SLUGS,
} from './subject-scope'

/**
 * One place that answers: which exam is this learner actually preparing for?
 *
 * JAMB and Post-UTME are separate paths, not two options in one shared
 * syllabus. The answer drives the cohort card, the curriculum, the default
 * practice/mock exam, and the lessons we are willing to serve. If we cannot
 * answer honestly, the scope is `general` and the UI must not claim a path.
 */

export type ExamTarget = 'jamb' | 'post-utme' | 'general'

export interface ExamScope {
  target: ExamTarget
  /** Where the target came from. Useful for honest UI copy and diagnostics. */
  source: 'profile' | 'access' | 'sessions' | 'none'
  /** True when the learner has declared (or behaviourally shown) one path. */
  restricted: boolean
  /**
   * Exam ids that belong to the path. `null` means unrestricted (general).
   * Empty array means a path was declared but has no exam yet (for example a
   * Post-UTME learner who has not chosen an institution).
   */
  examIds: string[] | null
  primaryExamId: string | null
  primaryExamName: string | null
  primaryExamSlug: string | null
}

export interface ExamRow {
  id: string
  name: string
  slug: string
  school_id: string | null
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

function normalizeTarget(value: unknown): ExamTarget | null {
  return value === 'jamb' || value === 'post-utme' || value === 'general' ? value : null
}

function toExamRow(value: unknown): ExamRow | null {
  if (!value) return null
  const row = (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | null
  if (!row) return null
  if (typeof row.id !== 'string' || typeof row.name !== 'string' || typeof row.slug !== 'string') {
    return null
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    school_id: typeof row.school_id === 'string' ? row.school_id : null,
  }
}

function dedupe(exams: ExamRow[]): ExamRow[] {
  const seen = new Set<string>()
  const out: ExamRow[] = []
  for (const exam of exams) {
    if (seen.has(exam.id)) continue
    seen.add(exam.id)
    out.push(exam)
  }
  return out
}

function buildScope(
  target: ExamTarget,
  source: ExamScope['source'],
  exams: ExamRow[],
  restricted: boolean,
): ExamScope {
  const unique = dedupe(exams)
  const primary = unique[0] ?? null
  return {
    target,
    source,
    restricted,
    examIds: restricted ? unique.map((exam) => exam.id) : null,
    primaryExamId: primary?.id ?? null,
    primaryExamName: primary?.name ?? null,
    primaryExamSlug: primary?.slug ?? null,
  }
}

/**
 * Exams the learner has already attached to Post-UTME, either through
 * `user_exam_access` or a saved target school. Access wins because it is the
 * row the question RLS policy actually checks.
 */
async function getSchoolExams(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExamRow[]> {
  const [accessRes, targetRes] = await Promise.all([
    supabase
      .from('user_exam_access')
      .select('added_at, exams!inner(id, name, slug, school_id)')
      .eq('user_id', userId)
      .order('added_at', { ascending: true }),
    supabase
      .from('student_targets')
      .select('priority, exams!inner(id, name, slug, school_id)')
      .eq('user_id', userId)
      .eq('active', true)
      .order('priority', { ascending: true }),
  ])

  const exams: ExamRow[] = []
  for (const row of accessRes.data ?? []) {
    const exam = toExamRow((row as { exams: unknown }).exams)
    if (exam?.school_id) exams.push(exam)
  }
  for (const row of targetRes.data ?? []) {
    const exam = toExamRow((row as { exams: unknown }).exams)
    if (exam?.school_id) exams.push(exam)
  }
  return dedupe(exams)
}

/** Most recent exam the learner actually used, used only when nothing is declared. */
async function getMostRecentExam(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExamRow | null> {
  const { data } = await supabase
    .from('exam_sessions')
    .select('started_at, exams!inner(id, name, slug, school_id)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(20)

  for (const row of data ?? []) {
    const exam = toExamRow((row as { exams: unknown }).exams)
    if (exam) return exam
  }
  return null
}

export async function getExamScope(
  supabase: SupabaseClient,
  userId: string,
  options?: { profileTarget?: string | null },
): Promise<ExamScope> {
  let profileTarget = options?.profileTarget
  if (profileTarget === undefined) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('exam_target')
      .eq('id', userId)
      .maybeSingle()
    profileTarget = profile?.exam_target ?? null
  }

  const declared = normalizeTarget(profileTarget)

  if (declared === 'general') {
    return buildScope('general', 'profile', [], false)
  }

  if (declared === 'jamb') {
    const { data: exam } = await supabase
      .from('exams')
      .select('id, name, slug, school_id')
      .eq('slug', 'jamb')
      .maybeSingle()
    return buildScope('jamb', 'profile', exam ? [exam as ExamRow] : [], true)
  }

  if (declared === 'post-utme') {
    let exams = await getSchoolExams(supabase, userId)
    if (exams.length === 0) {
      const recent = await getMostRecentExam(supabase, userId)
      if (recent?.school_id) exams = [recent]
    }
    return buildScope('post-utme', 'profile', exams, true)
  }

  // The live base predates `exam_target`; most profiles are null. Infer from
  // what the learner has actually attached or used rather than guessing JAMB,
  // which would put Post-UTME learners on the wrong path overnight.
  const schoolExams = await getSchoolExams(supabase, userId)
  if (schoolExams.length > 0) {
    return buildScope('post-utme', 'access', schoolExams, true)
  }

  const recent = await getMostRecentExam(supabase, userId)
  if (recent?.school_id) {
    return buildScope('post-utme', 'sessions', [recent], true)
  }
  if (recent?.slug === 'jamb') {
    return buildScope('jamb', 'sessions', [recent], true)
  }

  return buildScope('general', 'none', [], false)
}

export function filterExamsForScope<T extends { id: string }>(
  exams: T[],
  scope: ExamScope,
): T[] {
  if (!scope.restricted || !scope.examIds) return exams
  const allowed = new Set(scope.examIds)
  return exams.filter((exam) => allowed.has(exam.id))
}

export function isExamInScope(scope: ExamScope, examId: string): boolean {
  if (!scope.restricted) return true
  return !!scope.examIds?.includes(examId)
}

/** Short, honest label for the app shell and page headers. */
export function examPathLabel(scope: ExamScope): string {
  if (scope.target === 'jamb') return 'JAMB UTME'
  if (scope.target === 'post-utme') {
    if (!scope.primaryExamName) return 'Post-UTME'
    const school = scope.primaryExamName.replace(/\s+Post-UTME$/i, '')
    return `Post-UTME · ${school}`
  }
  return 'No exam path yet'
}
