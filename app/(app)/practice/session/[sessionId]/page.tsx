'use client'

import { Suspense, useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import PracticePlayer, { type PlayerQuestion } from '@/components/practice/practice-player'
import { LoadingCards, ErrorState } from '@/components/ui-states'
import { loadSessionData } from '@/lib/actions/practice'

function SessionInner({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams()
  const warmupIds = (searchParams.get('warmup') ?? '').split(',').filter(Boolean)
  const lessonNoteId = searchParams.get('lesson')
  const [questions, setQuestions] = useState<PlayerQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    loadSessionData(sessionId)
      .then((data) => {
        if (!live) return
        if (data.mode !== 'practice') {
          setError('This session is not a practice session.')
          return
        }
        setQuestions(data.questions)
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : 'Failed to load session')
      })
    return () => { live = false }
  }, [sessionId])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message={error} backHref="/practice" backLabel="Back to Practice" />
      </div>
    )
  }

  if (!questions) {
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingCards count={1} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message="This session has no questions." backHref="/practice" backLabel="Back to Practice" />
      </div>
    )
  }

  return (
    <PracticePlayer
      sessionId={sessionId}
      questions={questions}
      warmupIds={warmupIds}
      lessonNoteId={lessonNoteId}
    />
  )
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl"><LoadingCards count={1} /></div>}>
      <SessionInner sessionId={sessionId} />
    </Suspense>
  )
}
