import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope, filterExamsForScope, examPathLabel, filterSubjectsForScope, filterExamSubjectMapForScope } from '@/lib/exam-scope'
import MockLauncher from '@/components/mocks/mock-launcher'
import { getMockDefaults, type MockDefaults } from '@/lib/practice'
import { listMockEvents } from '@/lib/mock-events'
import Link from 'next/link'

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
 * Published questions per exam and subject. A single grouped aggregate in the
 * database replaces the old full-table pagination, so a cold cache miss is
 * O(1) round trips instead of one per 1,000 question rows. Data is the same
 * public catalogue and stays cached for five minutes.
 */
const getPublishedCounts = unstable_cache(
  async (): Promise<Record<string, Record<string, number>>> => {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('get_published_question_counts')
    if (error) throw new Error('Could not count the question banks')
    return (data ?? {}) as Record<string, Record<string, number>>
  },
  ['mock-published-counts'],
  { revalidate: 300 },
)

export default async function MocksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const scope = user ? await getExamScope(supabase, user.id) : null
  const pathLabel = scope ? examPathLabel(scope) : null
  const profileRes = user
    ? await supabase.from('profiles').select('subject_combinations').eq('id', user.id).maybeSingle()
    : { data: null }
  const defaultSubjectSlugs = ((profileRes.data as { subject_combinations?: string[] } | null)?.subject_combinations ?? []) as string[]
  const mockEvents = await listMockEvents()
  // eslint-disable-next-line react-hooks/purity -- request-time filter; page reads cookies() every render
  const liveOrUpcoming = mockEvents.filter((e) => new Date(e.ends_at).getTime() >= Date.now())

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

      {liveOrUpcoming.length > 0 && (
        <Link
          href={`/mocks/event/${liveOrUpcoming[0]!.slug}`}
          className="mb-5 block overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-5 text-white shadow-[0_24px_48px_-24px_rgba(37,99,235,0.55)] transition-transform hover:-translate-y-0.5"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-200">Mock event · Pro</p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-[1.12] text-white">{liveOrUpcoming[0]!.name}</h2>
          <p className="mt-1 text-sm font-semibold text-blue-100/90">
            {new Date(liveOrUpcoming[0]!.starts_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} to {new Date(liveOrUpcoming[0]!.ends_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
          </p>
        </Link>
      )}

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
          defaultSubjectSlugs={defaultSubjectSlugs}
        />
      )}
    </div>
  )
}
