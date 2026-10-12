'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { Check, X, Clock, BookOpen, ChevronDown, ChevronUp, Target, ArrowRight } from 'lucide-react'
import { getSessionResults } from '@/lib/actions/practice'
import { LoadingCards, ErrorState } from '@/components/ui-states'

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
  misconception: { name: string; explanation: string; repairHref: string | null } | null
}

interface SubjectBreakdown {
  subjectId: string
  name: string
  correct: number
  total: number
  accuracy: number
}

interface ResultsData {
  session: { id: string; mode: string; completedAt: string | null; timeLimitSeconds: number | null }
  exam: { name: string; slug: string }
  result: { score: number; accuracy: number; createdAt: string }
  timeTakenMs: number
  questions: QuestionReview[]
  subjectBreakdown: SubjectBreakdown[]
  weakestSubject: { subjectId: string; name: string } | null
  nextReview: Record<string, string | null>
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [nowMs] = useState(() => Date.now())

  useEffect(() => {
    let live = true
    getSessionResults(sessionId)
      .then((result) => { if (live) setData(result as ResultsData) })
      .catch((err) => { if (live) setError(err instanceof Error ? err.message : 'Failed to load results') })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [sessionId])

  if (loading) return <div className="mx-auto max-w-2xl"><LoadingCards count={2} /></div>
  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message={error ?? 'Results not found'} backHref="/practice" backLabel="Back to Practice" />
      </div>
    )
  }

  const correctCount = data.questions.filter((q) => q.isCorrect === true).length
  const totalCount = data.questions.length
  const accuracyPct = Math.round(data.result.accuracy * 100)

  const daysUntil = (iso: string | null | undefined): string | null => {
    if (!iso) return null
    const days = Math.max(0, Math.round((new Date(iso).getTime() - nowMs) / 86400000))
    return days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`
  }

  const secured = data.subjectBreakdown.filter((sb) => sb.total > 0 && sb.accuracy >= 80)
  const developing = data.subjectBreakdown.filter((sb) => sb.total > 0 && sb.accuracy >= 50 && sb.accuracy < 80)

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(id)) nextSet.delete(id)
      else nextSet.add(id)
      return nextSet
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Close-out: proof first */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-5 sm:p-7 text-center animate-pop">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Session complete</p>
        <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium text-black">
          {correctCount}/{totalCount} · {accuracyPct}%
        </h1>
        <p className="mt-1.5 text-sm font-semibold text-ink-soft">Here&apos;s what stuck.</p>

        {(secured.length > 0 || developing.length > 0) && (
          <ul className="mt-4 space-y-2 text-left">
            {secured.map((sb) => (
              <li key={sb.subjectId} className="flex items-center gap-2 rounded-2xl bg-white/70 border border-emerald-200 px-4 py-2.5 text-sm font-extrabold text-emerald-800">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                {sb.name} — secured ({sb.correct}/{sb.total})
              </li>
            ))}
            {developing.map((sb) => {
              const when = daysUntil(data.nextReview[sb.subjectId])
              return (
                <li key={sb.subjectId} className="flex items-center gap-2 rounded-2xl bg-white/70 border border-amber-200 px-4 py-2.5 text-sm font-extrabold text-amber-800">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                  {sb.name} — developing{when ? `, back ${when}` : ''}
                </li>
              )
            })}
          </ul>
        )}

        {data.weakestSubject ? (
          <Link
            href="/practice"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px]"
          >
            <Target className="h-4 w-4" />
            Work on {data.weakestSubject.name} next
          </Link>
        ) : (
          <Link
            href="/practice"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px]"
          >
            Practice again
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Review: wrong first */}
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <h2 className="font-display text-xl font-medium text-black mb-4">Review</h2>
        <div className="space-y-3">
          {[...data.questions]
            .sort((a, b) => Number(a.isCorrect === true) - Number(b.isCorrect === true))
            .map((q, idx) => {
              const open = expanded.has(q.questionId)
              const unanswered = q.selectedAnswer === null
              return (
                <div
                  key={q.questionId}
                  className={`rounded-2xl border-2 overflow-hidden ${
                    unanswered ? 'border-gray-200' : q.isCorrect ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  <button
                    onClick={() => toggle(q.questionId)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left min-h-[52px] cursor-pointer"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                        unanswered ? 'bg-gray-100 text-gray-400' : q.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {unanswered ? <Clock className="h-3.5 w-3.5" /> : q.isCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="text-sm font-extrabold text-black">Question {idx + 1}</span>
                    </span>
                    {open ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                      <p className="text-[15px] font-bold text-black leading-snug">{q.questionText}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const mine = opt.key === q.selectedAnswer
                          const right = opt.key === q.correctAnswer
                          let style = 'border-gray-200 bg-white text-ink-soft'
                          if (right) style = 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          if (mine && !q.isCorrect) style = 'border-red-300 bg-red-50 text-red-800'
                          return (
                            <div key={opt.key} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${style}`}>
                              <span className="shrink-0 w-4 text-center">{opt.key}</span>
                              <span>{opt.text}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-3.5">
                        <p className="flex items-center gap-1.5 font-display text-sm font-medium text-blue-900 mb-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          Explanation
                        </p>
                        <p className="text-[13px] font-semibold text-ink-soft leading-relaxed">{q.explanation}</p>
                      </div>
                      {!q.isCorrect && q.misconception && (
                        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-3.5">
                          <p className="text-[13px] font-extrabold text-amber-800 mb-1">
                            Why this tempts: {q.misconception.name}
                          </p>
                          <p className="text-[13px] font-semibold text-ink-soft leading-relaxed">{q.misconception.explanation}</p>
                          {q.misconception.repairHref && (
                            <Link
                              href={q.misconception.repairHref}
                              className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-extrabold text-blue-700 min-h-[40px]"
                            >
                              Open the repair lesson
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
