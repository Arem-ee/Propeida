import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadSessionData } from '@/lib/actions/practice'
import MockPlayer from '@/components/mocks/mock-player'
import { ErrorState } from '@/components/ui-states'

export const metadata = { title: 'Mock exam' }

export default async function MockSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  let session: Awaited<ReturnType<typeof loadSessionData>>
  try {
    session = await loadSessionData(sessionId)
  } catch {
    notFound()
  }

  if (session.mode !== 'mock' || !session.timeLimitSeconds) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message="This session is not a mock exam." backHref="/mocks" backLabel="Back to Mocks" />
      </div>
    )
  }

  const supabase = await createClient()
  const subjectIds = [...new Set(session.questions.map((q) => q.subjectId))]
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds.length > 0 ? subjectIds : ['00000000-0000-0000-0000-000000000000'])
  const names = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  return (
    <MockPlayer
      sessionId={session.id}
      questions={session.questions.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: names.get(q.subjectId) ?? 'Subject',
        questionText: q.questionText,
        options: q.options,
        selectedAnswer: q.selectedAnswer,
      }))}
      timeLimitSeconds={session.timeLimitSeconds}
      startedAt={session.startedAt}
    />
  )
}
