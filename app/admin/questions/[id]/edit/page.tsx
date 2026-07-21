import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import EditQuestionForm from './form'

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: question } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (!question) redirect('/admin/questions')

  const [examsRes, subjectsRes] = await Promise.all([
    supabase.from('exams').select('id, name').order('name'),
    supabase.from('subjects').select('id, name').order('name'),
  ])

  return (
    <EditQuestionForm
      question={question}
      exams={examsRes.data ?? []}
      subjects={subjectsRes.data ?? []}
    />
  )
}
