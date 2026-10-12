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

  const [examsRes, subjectsRes, misconceptionsRes, topicsRes] = await Promise.all([
    supabase.from('exams').select('id, name').order('name'),
    supabase.from('subjects').select('id, name').order('name'),
    supabase
      .from('question_misconceptions')
      .select('option_key, misconception_code, misconception_name, explanation, repair_note_id')
      .eq('question_id', id),
    supabase
      .from('question_topics')
      .select('topic_id, role')
      .eq('question_id', id),
  ])

  const initialMisconceptions: Record<string, { misconception_code: string; misconception_name: string; explanation: string; repair_note_id: string }> = {}
  for (const m of misconceptionsRes.data ?? []) {
    initialMisconceptions[m.option_key] = {
      misconception_code: m.misconception_code,
      misconception_name: m.misconception_name,
      explanation: m.explanation,
      repair_note_id: m.repair_note_id ?? '',
    }
  }

  return (
    <EditQuestionForm
      question={question}
      exams={examsRes.data ?? []}
      subjects={subjectsRes.data ?? []}
      initialMisconceptions={initialMisconceptions}
      initialTopics={(topicsRes.data ?? []).map((t) => ({ topic_id: t.topic_id, role: t.role }))}
    />
  )
}
