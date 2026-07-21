'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Send } from 'lucide-react'
import QuestionCard from './question-card'
import Timer from './timer'
import { submitAnswer, completeMockSession } from '@/lib/actions/practice'

interface SessionQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
}

interface MockModeProps {
  sessionId: string
  questions: SessionQuestion[]
  timeLimitSeconds: number
  startedAt: string
}

export default function MockMode({ sessionId, questions, timeLimitSeconds, startedAt }: MockModeProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hubParam = searchParams.get('hub') === 'universities' ? '?hub=universities' : ''
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [done, setDone] = useState(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(selections).length

  useEffect(() => {
    if (timedOut && !finalizing && !done) {
      handleSubmitAll()
    }
  }, [timedOut])

  const handleSelectOption = useCallback((key: string) => {
    if (!currentQuestion) return
    setSelections((prev) => ({ ...prev, [currentQuestion.id]: key }))
    submitAnswer(sessionId, currentQuestion.id, key).catch(() => {})
  }, [currentQuestion, sessionId])

  const handleSubmitAll = async () => {
    if (finalizing) return
    setFinalizing(true)
    setShowConfirm(false)

    try {
      await completeMockSession(sessionId)
      setDone(true)
    } catch {
      setFinalizing(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 text-green-600 mb-4 border border-green-100">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">
          {timedOut ? 'Time is up!' : 'Mock exam submitted'}
        </h2>
        <p className="mt-2 text-sm text-gray-500 mb-6">
          Your answers have been recorded.
        </p>
        <button
          onClick={() => router.push(`/practice${hubParam}`)}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
        >
          Back to Practice
        </button>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Timer
            startedAt={startedAt}
            timeLimitSeconds={timeLimitSeconds}
            onExpire={() => setTimedOut(true)}
          />
          <span className="text-xs text-gray-400">
            {answeredCount}/{questions.length} answered
          </span>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={finalizing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          <Send className="h-4 w-4" />
          Submit All
        </button>
      </div>

      <QuestionCard
        question={{
          ...currentQuestion,
          selectedAnswer: selections[currentQuestion.id] ?? null,
          isCorrect: null,
        }}
        mode="mock"
        feedback={null}
        selectedOption={selections[currentQuestion.id] ?? null}
        onSelectOption={handleSelectOption}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const isAnswered = q.id in selections
          const isCurrent = idx === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors min-h-[44px] min-w-[44px] cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600 text-white'
                  : isAnswered
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
        >
          Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={finalizing}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 min-h-[44px] cursor-pointer"
          >
            Submit All
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white border border-gray-100 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Submit mock exam?</h3>
            <p className="mt-2 text-sm text-gray-500">
              You have answered {answeredCount} of {questions.length} questions. Unanswered questions will be marked as incorrect.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 min-h-[44px] cursor-pointer"
              >
                Continue exam
              </button>
              <button
                onClick={handleSubmitAll}
                disabled={finalizing}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
              >
                {finalizing ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
