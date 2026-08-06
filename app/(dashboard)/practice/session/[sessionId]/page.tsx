'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import PracticeMode from '@/components/practice/practice-mode'
import MockMode from '@/components/practice/mock-mode'
import { loadSessionData } from '@/lib/actions/practice'
import { track } from '@/lib/analytics'

interface SessionData {
  id: string
  mode: 'practice' | 'mock'
  status: string
  startedAt: string
  timeLimitSeconds: number | null
  questions: {
    id: string
    subjectId: string
    questionText: string
    options: { key: string; text: string }[]
    selectedAnswer?: string | null
  }[]
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await loadSessionData(sessionId)
        setSession(data)
        if (data.mode === 'mock') {
          void track('mock-start', { questionCount: data.questions.length })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
      </div>
    )
  }

  if (!session || session.questions.length === 0) return null

  if (session.mode === 'practice') {
    return <PracticeMode sessionId={session.id} questions={session.questions} />
  }

  if (session.mode === 'mock' && session.timeLimitSeconds) {
    return (
      <MockMode
        sessionId={session.id}
        questions={session.questions}
        timeLimitSeconds={session.timeLimitSeconds}
        startedAt={session.startedAt}
      />
    )
  }

  return null
}
