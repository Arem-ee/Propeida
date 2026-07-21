import { createClient } from '@/lib/supabase/server'
import SelectionScreen from '@/components/practice/selection-screen'
import { getUserActiveSessions } from '@/lib/practice'
import Link from 'next/link'

export default async function PracticePage(props: { searchParams: Promise<{ hub?: string }> }) {
  const searchParams = await props.searchParams
  const hub = searchParams.hub === 'universities' ? 'universities' : 'jamb'
  const supabase = await createClient()

  const [examsRes, subjectsRes, examSubjectsRes] = await Promise.all([
    supabase.from('exams').select('id, name, slug, subject_selection_mode, school_id').order('name'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
  ])

  const allExams = examsRes.data ?? []
  const subjects = subjectsRes.data ?? []

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjectsRes.data ?? []) {
    if (!examSubjectMap[es.exam_id]) examSubjectMap[es.exam_id] = []
    const arr = examSubjectMap[es.exam_id]!
    arr.push(es.subject_id)
  }

  const { data: { user } } = await supabase.auth.getUser()
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
  let exams
  if (hub === 'universities') {
    exams = allExams.filter((e) => e.school_id !== null && accessSet.has(e.id))
  } else {
    exams = allExams.filter((e) => e.school_id === null || accessSet.has(e.id))
  }

  const hasSchoolAccess = userExamAccessIds.length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">
        {hub === 'universities' ? 'University Practice & Mock Exams' : 'Practice & Mock Exams'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Select an exam, configure your session, and start practicing.</p>

      {hub === 'jamb' && !hasSchoolAccess && allExams.some((e) => e.school_id !== null) && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
          Add your target institutions to access their Post-UTME prep materials.{' '}
          <Link href="/account/institutions" className="font-bold text-amber-900 underline">My Institutions</Link>
        </div>
      )}

      {hub === 'universities' && exams.length === 0 && (
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
