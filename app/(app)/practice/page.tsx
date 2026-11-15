import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExamScope, filterExamsForScope, examPathLabel, filterSubjectsForScope, filterExamSubjectMapForScope, isExamInScope } from '@/lib/exam-scope'
import Link from 'next/link'
import PracticeConfig from '@/components/practice/practice-config'
import { getCampaignStatus } from '@/lib/campaign'
import { getUserActiveSessions } from '@/lib/practice'

export const metadata = { title: 'Practice' }

/**
 * Exams with no bank simply don't appear — content-gating by presence.
 * Reading the whole questions table per page view got expensive as the
 * bank grew, so the published-exam id list is cached for five minutes.
 */
const getPublishedExamIds = unstable_cache(
  async (): Promise<string[]> => {
    const db = createAdminClient()
    const { data, error } = await db.from('questions').select('exam_id').limit(20000)
    if (error) return []
    return [...new Set((data ?? []).map((q) => q.exam_id as string))]
  },
  ['practice-published-exam-ids'],
  { revalidate: 300 },
)

export default async function PracticePage() {
  const supabase = await createClient()

  const [examsRes, subjectsRes, examSubjectsRes, userRes, publishedExamIds, topicsRes] = await Promise.all([
    supabase.from('exams').select('id, name, slug, subject_selection_mode, school_id').order('name'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
    supabase.auth.getUser(),
    getPublishedExamIds(),
    // Published topics — shown as checkboxes under each subject so the
    // learner can route practice to a named syllabus point.
    supabase.from('topics').select('id, subject_id, name, slug, sort_order').eq('published', true).order('sort_order'),
  ])

  const allExams = examsRes.data ?? []
  const rawSubjects = subjectsRes.data ?? []

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjectsRes.data ?? []) {
    if (!examSubjectMap[es.exam_id]) examSubjectMap[es.exam_id] = []
    const arr = examSubjectMap[es.exam_id]!
    arr.push(es.subject_id)
  }

  const user = userRes.data.user ?? null
  // Practice defaults to the learner's own path. A Post-UTME learner should
  // never have to know that JAMB exists before the UI admits it exists.
  const scope = user ? await getExamScope(supabase, user.id) : null
  // Standalone verticals (Current Affairs) stay out of JAMB/Post-UTME
  // pickers in both the visible list and the no-selection default.
  const subjects = filterSubjectsForScope(rawSubjects, scope)
  const scopedExamSubjectMap = filterExamSubjectMapForScope(examSubjectMap, rawSubjects, scope)

  let activeSession: { id: string; examName: string } | null = null
  let userExamAccessIds: string[] = []
  let subjectsPending = false
  if (user) {
    const [sessions, accessRes, profileRes] = await Promise.all([
      getUserActiveSessions(user.id),
      supabase.from('user_exam_access').select('exam_id').eq('user_id', user.id),
      supabase.from('profiles').select('subjects_pending').eq('id', user.id).maybeSingle(),
    ])
    // Only the learner's own exam path gets a resume card. A JAMB-focus
    // learner never sees a Post-UTME nudge in this UI, and vice versa. An
    // untargeted learner only sees their JAMB sessions; anything else
    // waits for them to pick a target in onboarding first.
    const resume = sessions.find((session) => {
      if (scope?.restricted) {
        return isExamInScope(scope, session.exam_id)
      }
      return session.exams.slug === 'jamb'
    })
    if (resume) activeSession = { id: resume.id, examName: resume.exams.name }
    userExamAccessIds = (accessRes.data ?? []).map((a) => a.exam_id)
    subjectsPending = profileRes.data?.subjects_pending ?? false
  }

  const accessSet = new Set(userExamAccessIds)
  const campaign = user ? await getCampaignStatus() : null
  const campaignAccess = campaign?.hasAccess ?? false
  const examsWithContent = new Set(publishedExamIds)
  const pathExams = scope
    ? filterExamsForScope(allExams, scope)
    : allExams
  const exams = pathExams.filter(
    (e) => examsWithContent.has(e.id) && (campaignAccess || accessSet.has(e.id) || e.school_id === null),
  )
  const pathLabel = scope ? examPathLabel(scope) : null

  // Subject-scoped topic graph — the picker shows everything below per subject.
  const topicsBySubject: Record<string, { id: string; name: string; slug: string }[]> = {}
  for (const t of topicsRes.data ?? []) {
    ;(topicsBySubject[t.subject_id] ??= []).push({ id: t.id, name: t.name, slug: t.slug })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Practice
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          {pathLabel ? `${pathLabel} · ` : ''}You answer targeted questions and every wrong answer teaches you something
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-black">No practice material yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            {pathLabel
              ? `We are still checking the questions for ${pathLabel}, and lessons are ready to read meanwhile`
              : 'We are still checking the question banks, and lessons are ready to read meanwhile'}
          </p>
          <Link
            href="/learn"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
          >
            Browse lessons
          </Link>
        </div>
      ) : (
        <PracticeConfig
          exams={exams}
          allSubjects={subjects}
          examSubjectMap={scopedExamSubjectMap}
          activeSession={activeSession}
          subjectsPending={subjectsPending}
          topicsBySubject={topicsBySubject}
        />
      )}
    </div>
  )
}

