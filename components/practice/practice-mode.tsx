'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, RotateCcw, CheckCircle } from 'lucide-react'
import QuestionCard from './question-card'
import { submitAnswer } from '@/lib/actions/practice'

interface SessionQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
}

interface PracticeModeProps {
  sessionId: string
  questions: SessionQuestion[]
}

export default function PracticeMode({ sessionId, questions }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctAnswer: string
    explanation: string
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)

  const currentQuestion = questions[currentIndex]

  const handleSelectOption = useCallback((key: string) => {
    if (!feedback) {
      setSelectedOption(key)
    }
  }, [feedback])

  const handleCheck = async () => {
    if (!selectedOption || !currentQuestion) return

    setSubmitting(true)
    try {
      const result = await submitAnswer(sessionId, currentQuestion.id, selectedOption)
      setFeedback(result as { isCorrect: boolean; correctAnswer: string; explanation: string })
      setAnsweredCount((prev) => prev + 1)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setFeedback(null)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-xl font-extrabold text-gray-900">Practice complete</h2>
        <p className="mt-2 text-sm text-gray-500 mb-6">
          You answered {answeredCount} of {questions.length} questions.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0)
            setSelectedOption(null)
            setFeedback(null)
            setCompleted(false)
            setAnsweredCount(0)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </button>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Practice Mode
        </span>
      </div>

      <QuestionCard
        question={currentQuestion}
        mode="practice"
        feedback={feedback}
        selectedOption={selectedOption}
        onSelectOption={handleSelectOption}
      />

      <div className="mt-6 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {answeredCount} answered
        </span>

        <div className="flex gap-3">
          {feedback ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCheck}
              disabled={!selectedOption || submitting}
              className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors min-h-[44px] cursor-pointer ${
                selectedOption && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Checking...' : 'Check Answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
