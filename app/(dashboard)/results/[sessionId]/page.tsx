'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { Check, X, Clock, Target, ArrowLeft, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { getSessionResults } from '@/lib/actions/practice'

interface QuestionReview {
  questionId: string
  questionText: string
  options: { key: string; text: string }[]
  subjectId: string
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean | null
  explanation: string
  timeTakenSeconds: number | null
}

interface SubjectBreakdown {
  subjectId: string
  name: string
  correct: number
  total: number
  accuracy: number
}

interface WeakestSubject {
  subjectId: string
  name: string
  correct: number
  total: number
  accuracy: number
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [data, setData] = useState<{
    session: { id: string; mode: string; completedAt: string | null; timeLimitSeconds: number | null }
    exam: { name: string; slug: string }
    result: { score: number; accuracy: number; createdAt: string }
    timeTakenMs: number
    questions: QuestionReview[]
    subjectBreakdown: SubjectBreakdown[]
    weakestSubject: WeakestSubject | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const result = await getSessionResults(sessionId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-red-600">{error ?? 'Results not found'}</p>
        <Link href="/practice" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          Back to Practice
        </Link>
      </div>
    )
  }

  const correctCount = data.questions.filter((q) => q.isCorrect === true).length
  const totalCount = data.questions.length
  const accuracyPct = Math.round(data.result.accuracy * 100)
  const timeMinutes = Math.floor(data.timeTakenMs / 60000)
  const timeSeconds = Math.floor((data.timeTakenMs % 60000) / 1000)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/history" className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{data.exam.name} Results</h1>
          <p className="text-sm text-gray-500 capitalize">{data.session.mode} mode</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">{correctCount}<span className="text-lg text-gray-400 font-semibold">/{totalCount}</span></div>
          <div className="mt-1 text-xs font-semibold text-gray-400">Score</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 text-center">
          <div className={`text-3xl sm:text-4xl font-extrabold ${accuracyPct >= 50 ? 'text-green-600' : 'text-red-600'}`}>{accuracyPct}%</div>
          <div className="mt-1 text-xs font-semibold text-gray-400">Accuracy</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">{timeMinutes}<span className="text-lg text-gray-400 font-semibold">m</span></div>
          <div className="mt-1 text-xs font-semibold text-gray-400">{timeSeconds}s elapsed</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5 text-center">
          <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {data.questions.filter((q) => q.selectedAnswer !== null).length}
            <span className="text-lg text-gray-400 font-semibold">/{totalCount}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-gray-400">Answered</div>
        </div>
      </div>

      {data.subjectBreakdown.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">Performance by Subject</h2>
          <div className="space-y-4">
            {data.subjectBreakdown.map((sb) => {
              const barPct = Math.round(sb.accuracy)
              return (
                <div key={sb.subjectId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-gray-700">{sb.name}</span>
                    <span className="text-xs font-semibold text-gray-400">{sb.correct}/{sb.total} ({barPct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        barPct >= 70 ? 'bg-green-500' : barPct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {data.weakestSubject && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-2">Area to focus on</h2>
          <p className="text-sm text-gray-700">
            <strong>{data.weakestSubject.name}</strong> was your weakest subject ({data.weakestSubject.correct}/{data.weakestSubject.total} correct, {Math.round(data.weakestSubject.accuracy * 100)}%).
            Spend extra time drilling questions in this subject area.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="text-base font-extrabold text-gray-900 mb-4">Question Review</h2>
        <div className="space-y-3">
          {data.questions.map((q, idx) => {
            const isExpanded = expandedQuestions.has(q.questionId)
            const isUnanswered = q.selectedAnswer === null
            return (
              <div
                key={q.questionId}
                className={`rounded-xl border overflow-hidden ${
                  isUnanswered ? 'border-gray-200' : q.isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <button
                  onClick={() => toggleQuestion(q.questionId)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left min-h-[44px] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isUnanswered ? 'bg-gray-100 text-gray-400' : q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isUnanswered ? <Clock className="h-3.5 w-3.5" /> : q.isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      Question {idx + 1}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/30">
                    <p className="text-sm font-bold text-gray-900 leading-snug">{q.questionText}</p>

                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        const isUserAnswer = opt.key === q.selectedAnswer
                        const isCorrectOpt = opt.key === q.correctAnswer
                        let style = 'border-gray-200 bg-white text-gray-500'
                        if (isCorrectOpt) style = 'border-green-300 bg-green-50 text-green-800'
                        if (isUserAnswer && !q.isCorrect) style = 'border-red-300 bg-red-50 text-red-800'
                        if (isUserAnswer && q.isCorrect) style = 'border-green-300 bg-green-50 text-green-800'
                        if (isUnanswered && isCorrectOpt) style = 'border-green-300 bg-green-50 text-green-800'

                        return (
                          <div key={opt.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${style}`}>
                            <span className="shrink-0 w-4 text-center">{opt.key}</span>
                            <span>{opt.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {!isUnanswered && (
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {q.isCorrect ? (
                          <span className="text-green-700 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Correct</span>
                        ) : (
                          <span className="text-red-700 flex items-center gap-1"><X className="h-3.5 w-3.5" /> Incorrect — answer was {q.correctAnswer}</span>
                        )}
                      </div>
                    )}

                    <div className="rounded-lg bg-blue-50 border border-blue-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        Explanation
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center pb-8">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Target className="h-4 w-4" />
          Practice more
        </Link>
      </div>
    </div>
  )
}
