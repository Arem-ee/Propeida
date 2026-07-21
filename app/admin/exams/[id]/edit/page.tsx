import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditExamForm from './form'

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .single()

  if (!exam) redirect('/admin/exams')

  const { data: examSubjects } = await supabase
    .from('exam_subjects')
    .select('subject_id')
    .eq('exam_id', id)

  const linkedSubjectIds = new Set((examSubjects ?? []).map((es) => es.subject_id))

  const [schoolsRes, subjectsRes, configRes] = await Promise.all([
    supabase.from('schools').select('id, name').order('name'),
    supabase.from('subjects').select('id, name').order('name'),
    supabase.from('app_config').select('value').eq('key', 'mock_defaults').single(),
  ])

  const mockDefaults = configRes.data?.value as Record<string, { question_count: number | null; time_limit_seconds: number | null }> | undefined
  const examDefaults: { question_count: number | null; time_limit_seconds: number | null } = mockDefaults?.[exam.slug] ?? { question_count: null, time_limit_seconds: null }

  return (
    <EditExamForm
      exam={exam}
      schools={schoolsRes.data ?? []}
      allSubjects={subjectsRes.data ?? []}
      linkedSubjectIds={linkedSubjectIds}
      mockQuestionCount={examDefaults.question_count}
      mockTimeLimit={examDefaults.time_limit_seconds}
    />
  )
}
