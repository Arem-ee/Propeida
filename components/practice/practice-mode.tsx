'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, CheckCircle, Flame, BookOpen, Play } from 'lucide-react'
import QuestionCard from './question-card'
import { submitAnswer, completePracticeSession } from '@/lib/actions/practice'
import { getNoteById } from '@/lib/notes'

interface SessionQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
  correctAnswer?: string | null
  explanation?: string | null
}

interface PracticeModeProps {
  sessionId: string
  questions: SessionQuestion[]
  warmupIds?: string[]
  lessonNoteId?: string | null
}

export default function PracticeMode({ sessionId, questions, warmupIds = [], lessonNoteId = null }: PracticeModeProps) {
  const router = useRouter()

  // Warm-up questions (re-attempts from last time) come first, in URL order;
  // the rest follow in session order. session_answers rows carry random UUIDs,
  // so DB order cannot be trusted for positioning.
  const orderedQuestions = useMemo(() => {
    if (warmupIds.length === 0) return questions
    const warmupSet = new Set(warmupIds)
    const warmup = warmupIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is SessionQuestion => Boolean(q))
    const rest = questions.filter((q) => !warmupSet.has(q.id))
    return [...warmup, ...rest]
  }, [questions, warmupIds])

  const alreadyStarted = useMemo(
    () => orderedQuestions.some((q) => q.selectedAnswer != null),
    [orderedQuestions],
  )
  const lesson = lessonNoteId ? getNoteById(lessonNoteId) : null

  const [phase, setPhase] = useState<'learn' | 'questions'>(
    lesson && !alreadyStarted ? 'learn' : 'questions',
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctAnswer: string
    explanation: string
    misconception?: { code: string; name: string; explanation: string; sharedPct: number | null } | null
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)

  const warmupCount = useMemo(
    () => orderedQuestions.slice(0, warmupIds.length).filter((q) => warmupIds.includes(q.id)).length,
    [orderedQuestions, warmupIds],
  )
  const currentQuestion = orderedQuestions[currentIndex]
  const isWarmup = currentIndex < warmupCount

  const handleSelectOption = (key: string) => {
    if (!feedback) {
      setSelectedOption(key)
    }
  }

  const handleCheck = async () => {
    if (!selectedOption || !currentQuestion) return

    if (currentQuestion.correctAnswer) {
      setFeedback({
        isCorrect: currentQuestion.correctAnswer === selectedOption,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation ?? '',
      })
      setAnsweredCount((prev) => prev + 1)
      void submitAnswer(sessionId, currentQuestion.id, selectedOption).catch(() => {})
      return
    }

    setSubmitting(true)
    try {
      const result = await submitAnswer(sessionId, currentQuestion.id, selectedOption)
      setFeedback(result as { isCorrect: boolean; correctAnswer: string; explanation: string; misconception?: { code: string; name: string; explanation: string; sharedPct: number | null } | null })
      setAnsweredCount((prev) => prev + 1)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < orderedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setFeedback(null)
    } else {
      setCompleted(true)
    }
  }

  const handleFinish = async () => {
    if (finishing) return
    setFinishing(true)
    setFinishError(null)
    try {
      const result = await completePracticeSession(sessionId)
      router.push(`/results/${result.sessionId}`)
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : 'Could not finish session')
      setFinishing(false)
    }
  }

  if (phase === 'learn' && lesson) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BookOpen className="h-3.5 w-3.5" />
            Learn first
          </span>
          <span className="text-xs font-bold text-gray-400">
            {lesson.topic}
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-gray-900">{lesson.topic}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{lesson.summary}</p>

          <div className="mt-6 space-y-5">
            {lesson.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="text-sm font-extrabold text-gray-900">{section.heading}</h3>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-1.5 text-sm leading-relaxed text-gray-600">{p}</p>
                ))}
                <ul className="mt-2 space-y-1.5">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {lesson.examTip && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800">Exam tip</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900">{lesson.examTip}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setPhase('questions')}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 min-h-[44px] cursor-pointer"
            >
              Skip to questions
            </button>
            <button
              onClick={() => setPhase('questions')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
            >
              <Play className="h-4 w-4" />
              Start practice
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
        <h2 className="text-xl font-extrabold text-gray-900">Session complete</h2>
        <p className="mt-2 text-sm text-gray-500 mb-6">
          You answered {answeredCount} of {orderedQuestions.length} questions.
        </p>
        {finishError && (
          <p className="mb-4 text-sm font-semibold text-red-600">{finishError}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer disabled:opacity-60"
          >
            {finishing ? 'Wrapping up...' : 'See what stuck'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0)
              setSelectedOption(null)
              setFeedback(null)
              setCompleted(false)
              setAnsweredCount(0)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">
          {isWarmup
            ? `Warm-up ${currentIndex + 1} of ${warmupCount}`
            : `Question ${currentIndex + 1 - warmupCount} of ${orderedQuestions.length - warmupCount}`}
        </span>
        <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Practice Mode
        </span>
      </div>

      {isWarmup && currentIndex === 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <Flame className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
          <p className="text-xs leading-relaxed text-orange-800">
            <strong>Still got it?</strong> These are from last time — quick retrieval before new material.
          </p>
        </div>
      )}

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
              {currentIndex < orderedQuestions.length - 1 ? 'Next Question' : 'Finish'}
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

