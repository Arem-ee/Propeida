import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope, filterExamsForScope, examPathLabel, filterSubjectsForScope, filterExamSubjectMapForScope } from '@/lib/exam-scope'
import MockLauncher from '@/components/mocks/mock-launcher'
import { getMockDefaults, type MockDefaults } from '@/lib/practice'

export const metadata = { title: 'Mocks' }

export interface MockableExam {
  id: string
  name: string
  slug: string
  questionCount: number
  timeLimitSeconds: number
  subjectCounts: Record<string, number>
  subjectRoles: Record<string, number> | null
  subjectWeights: Record<string, number> | null
}

/**
 * Published questions per exam and subject. Counts only, read through the
 * service role so a learner who has not opened a school bank yet still sees
 * an honest readiness figure. The page never renders question content.
 * The full-table scan is cached for five minutes so page views do not
 * re-read every question row on each visit.
 */
const getPublishedCounts = unstable_cache(
  async (): Promise<Record<string, Record<string, number>>> => {
  const admin = createAdminClient()
  const counts: Record<string, Record<string, number>> = {}
  const PAGE = 1000

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await admin
      .from('questions')
      .select('exam_id, subject_id')
      .eq('status', 'published')
      .range(from, from + PAGE - 1)

    if (error) throw new Error('Could not count the question banks')
    if (!data || data.length === 0) break

    for (const row of data as { exam_id: string; subject_id: string }[]) {
      if (!counts[row.exam_id]) counts[row.exam_id] = {}
      counts[row.exam_id]![row.subject_id] = (counts[row.exam_id]![row.subject_id] ?? 0) + 1
    }

    if (data.length < PAGE) break
  }

  return counts
  },
  ['mock-published-counts'],
  { revalidate: 300 },
)

export default async function MocksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const scope = user ? await getExamScope(supabase, user.id) : null
  const pathLabel = scope ? examPathLabel(scope) : null

  const [examsRes, subjectsRes, examSubjectsRes, weightingRes, publishedCounts] = await Promise.all([
    supabase.from('exams').select('id, name, slug').order('name'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
    supabase.from('app_config').select('value').eq('key', 'subject_weighting').maybeSingle(),
    getPublishedCounts().catch((): Record<string, Record<string, number>> => ({})),
  ])

  const weighting = (weightingRes.data?.value ?? {}) as Record<string, Record<string, number>>
  const withContent = new Set(
    Object.entries(publishedCounts)
      .filter(([, subjects]) => Object.values(subjects).some((n) => n > 0))
      .map(([examId]) => examId),
  )
  const candidateExams = scope ? filterExamsForScope(examsRes.data ?? [], scope) : (examsRes.data ?? [])

  const exams: MockableExam[] = []
  for (const exam of candidateExams) {
    if (!withContent.has(exam.id)) continue
    let defaults: MockDefaults | null = null
    try {
      defaults = await getMockDefaults(exam.slug)
    } catch {
      defaults = null
    }
    if (!defaults?.question_count || !defaults?.time_limit_seconds) continue
    exams.push({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      questionCount: defaults.question_count,
      timeLimitSeconds: defaults.time_limit_seconds,
      subjectCounts: publishedCounts[exam.id] ?? {},
      subjectRoles: defaults.subject_roles ?? null,
      subjectWeights: weighting[exam.slug] ?? null,
    })
  }

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjectsRes.data ?? []) {
    if (!examSubjectMap[es.exam_id]) examSubjectMap[es.exam_id] = []
    examSubjectMap[es.exam_id]!.push(es.subject_id)
  }

  // Standalone verticals (Current Affairs) stay out of JAMB/Post-UTME
  // pickers in both the visible list and the no-selection default.
  const rawSubjects = subjectsRes.data ?? []
  const subjects = filterSubjectsForScope(rawSubjects, scope)
  const scopedExamSubjectMap = filterExamSubjectMapForScope(examSubjectMap, rawSubjects, scope)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Mocks
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          {pathLabel ? `${pathLabel} · ` : ''}You sit the real hall under a countdown, with no pauses, and your answers save themselves
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-black">No mocks ready yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            {pathLabel
              ? `We open timed mocks for ${pathLabel} as soon as we finish checking a full exam bank, and lessons and practice are ready now`
              : 'We open timed mocks as soon as we finish checking a full exam bank, and lessons and practice are ready now'}
          </p>
        </div>
      ) : (
        <MockLauncher
          exams={exams}
          allSubjects={subjects}
          examSubjectMap={scopedExamSubjectMap}
        />
      )}
    </div>
  )
}
