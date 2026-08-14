import { createClient, getAuthUser } from '@/lib/supabase/server'

export const revalidate = 86400

export async function GET() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('ensure_daily_question')

  const { data } = await supabase
    .from('daily_questions')
    .select(`
      id,
      question_id,
      question:question_id (
        id,
        question_text,
        options,
        subject:subject_id ( name )
      )
    `)
    .eq('date', today)
    .single()

  if (!data) {
    return Response.json({ question: null })
  }

  const q = Array.isArray(data.question) ? data.question[0] : data.question
  if (!q) {
    return Response.json({ question: null })
  }

  return Response.json({
    dailyQuestionId: data.id,
    question: {
      id: q.id,
      text: q.question_text,
      options: q.options,
      subjectName: (Array.isArray(q.subject) ? q.subject[0] : q.subject)?.name ?? null,
    },
  })
}
