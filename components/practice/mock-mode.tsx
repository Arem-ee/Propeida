'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import QuestionCard from './question-card'
import Timer from './timer'
import { submitAnswer, completeMockSession } from '@/lib/actions/practice'

interface SessionQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
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
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const persisted: Record<string, string> = {}
    for (const q of questions) {
      if (q.selectedAnswer) persisted[q.id] = q.selectedAnswer
    }
    return persisted
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [done, setDone] = useState(false)
  const questionCardRef = useRef<HTMLDivElement>(null)
  const skipScrollRef = useRef(false)

  const total = questions.length
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(selections).length
  const isLast = currentIndex === total - 1

  const handleTimerExpire = useCallback(() => setTimedOut(true), [])

  const handleSubmitAll = useCallback(async () => {
    if (finalizing) return
    setFinalizing(true)
    setShowConfirm(false)
    try {
      await completeMockSession(sessionId)
      setDone(true)
    } catch {
      setFinalizing(false)
    }
  }, [finalizing, sessionId])

  useEffect(() => {
    if (timedOut && !finalizing && !done) {
      void handleSubmitAll()
    }
  }, [timedOut, finalizing, done, handleSubmitAll])

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false
      return
    }
    const el = questionCardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentIndex])

  const goToQuestion = useCallback((idx: number) => {
    skipScrollRef.current = true
    setCurrentIndex(Math.min(Math.max(0, idx), total - 1))
  }, [total])

  const goAdjacent = useCallback((dir: 1 | -1) => {
    skipScrollRef.current = false
    setCurrentIndex((prev) => Math.min(Math.max(0, prev + dir), total - 1))
  }, [total])

  const handleSelectOption = useCallback((key: string) => {
    if (!currentQuestion) return
    setSelections((prev) => ({ ...prev, [currentQuestion.id]: key }))
    submitAnswer(sessionId, currentQuestion.id, key).catch(() => {})
  }, [currentQuestion, sessionId])

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
          type="button"
          onClick={() => router.push(`/practice${hubParam}`)}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] touch-manipulation cursor-pointer"
        >
          Back to Practice
        </button>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mx-auto max-w-4xl pb-32 lg:pb-24">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Timer
            startedAt={startedAt}
            timeLimitSeconds={timeLimitSeconds}
            onExpire={handleTimerExpire}
          />
          <span className="text-xs text-gray-400">
            {answeredCount}/{total} answered
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={finalizing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px] touch-manipulation cursor-pointer"
        >
          <Send className="h-4 w-4" />
          Submit All
        </button>
      </div>

      <div ref={questionCardRef}>
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
      </div>

      <section aria-label="Question palette" className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Questions</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {answeredCount} of {total} answered
          </span>
        </div>
        <div className="max-h-44 overflow-y-auto overscroll-y-contain touch-pan-y pr-1 sm:max-h-none sm:overflow-visible">
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = q.id in selections
              const isCurrent = idx === currentIndex

              return (
                <QuestionNumberButton
                  key={q.id}
                  number={idx + 1}
                  isAnswered={isAnswered}
                  isCurrent={isCurrent}
                  onClick={() => goToQuestion(idx)}
                />
              )
            })}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-16 lg:bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur safe-area-bottom">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goAdjacent(-1)}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] touch-manipulation cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <span className="flex-1 text-center text-xs font-bold text-gray-500 tabular-nums">
            Question {currentIndex + 1} of {total}
          </span>

          {!isLast ? (
            <button
              type="button"
              onClick={() => goAdjacent(1)}
              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 active:bg-blue-700 min-h-[48px] touch-manipulation cursor-pointer"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={finalizing}
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 min-h-[48px] touch-manipulation cursor-pointer"
            >
              Submit All
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white border border-gray-100 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Submit mock exam?</h3>
            <p className="mt-2 text-sm text-gray-500">
              You have answered {answeredCount} of {total} questions. Unanswered questions will be marked as incorrect.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 min-h-[44px] touch-manipulation cursor-pointer"
              >
                Continue exam
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitAll()}
                disabled={finalizing}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] touch-manipulation cursor-pointer"
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

const QuestionNumberButton = memo(function QuestionNumberButton({
  number,
  isAnswered,
  isCurrent,
  onClick,
}: {
  number: number
  isAnswered: boolean
  isCurrent: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isCurrent ? 'true' : undefined}
      aria-label={`Go to question ${number}${isAnswered ? ', answered' : ''}`}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer ${
        isCurrent
          ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
          : isAnswered
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {number}
    </button>
  )
}, (prev, next) =>
  prev.number === next.number &&
  prev.isAnswered === next.isAnswered &&
  prev.isCurrent === next.isCurrent
)