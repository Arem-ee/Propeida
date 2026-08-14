import { createClient } from '@/lib/supabase/server'
import SelectionScreen from '@/components/practice/selection-screen'
import ComingSoon from '@/components/coming-soon'
import CampaignPanel from '@/components/campaign/campaign-panel'
import { getCampaignStatus } from '@/lib/campaign'
import { getUserActiveSessions } from '@/lib/practice'
import Link from 'next/link'

export default async function PracticePage(props: { searchParams: Promise<{ hub?: string }> }) {
  const searchParams = await props.searchParams
  const hub = searchParams.hub === 'universities' ? 'universities' : 'jamb'

  if (hub === 'jamb') {
    return (
      <div className="mx-auto max-w-2xl">
        <ComingSoon />
      </div>
    )
  }

  const supabase = await createClient()

  const [examsRes, subjectsRes, examSubjectsRes, userRes] = await Promise.all([
    supabase.from('exams').select('id, name, slug, subject_selection_mode, school_id').order('name'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
    supabase.auth.getSession(),
  ])

  const allExams = examsRes.data ?? []
  const subjects = subjectsRes.data ?? []

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjectsRes.data ?? []) {
    if (!examSubjectMap[es.exam_id]) examSubjectMap[es.exam_id] = []
    const arr = examSubjectMap[es.exam_id]!
    arr.push(es.subject_id)
  }

  const user = userRes.data.session?.user ?? null
  let activeSession = null
  let userExamAccessIds: string[] = []
  if (user) {
    const [sessions, accessRes] = await Promise.all([
      getUserActiveSessions(user.id),
      supabase.from('user_exam_access').select('exam_id').eq('user_id', user.id),
    ])
    activeSession = sessions.length > 0 ? sessions[0] : null
    userExamAccessIds = (accessRes.data ?? []).map((a) => a.exam_id)
  }

  const accessSet = new Set(userExamAccessIds)
  const campaign = user ? await getCampaignStatus() : null
  const campaignAccess = campaign?.hasAccess ?? false
  const exams = allExams.filter(
    (e) => e.school_id !== null && (campaignAccess || accessSet.has(e.id))
  )

  return (
    <div className="mx-auto max-w-2xl">
      {campaign && <CampaignPanel status={campaign} />}
      <h1 className="text-2xl font-extrabold text-gray-900">University Practice & Mock Exams</h1>
      <p className="mt-1 text-sm text-gray-500">Select an exam, configure your session, and start practicing.</p>

      {exams.length === 0 && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
          You haven&apos;t added any universities yet.{' '}
          <Link href="/account/institutions" className="font-bold text-amber-900 underline">Add institutions</Link>
        </div>
      )}

      <SelectionScreen
        exams={exams}
        allSubjects={subjects}
        examSubjectMap={examSubjectMap}
        activeSession={activeSession ? { id: activeSession.id, mode: activeSession.mode, examName: 'name' in activeSession.exams ? (activeSession.exams as { name: string }).name : '' } : null}
      />
    </div>
  )
}
