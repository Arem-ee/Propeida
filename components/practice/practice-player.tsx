'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, CheckCircle, Flame, BookOpen, Play, Check, X } from 'lucide-react'
import { submitAnswer, completePracticeSession } from '@/lib/actions/practice'
import { getNoteById } from '@/lib/notes'
import { celebrate } from '@/lib/celebrate'

export interface PlayerQuestion {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
  correctAnswer?: string | null
  explanation?: string | null
}

interface Feedback {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  misconception?: { code: string; name: string; explanation: string; sharedPct: number | null } | null
}

export default function PracticePlayer({
  sessionId,
  questions,
  warmupIds = [],
  lessonNoteId = null,
}: {
  sessionId: string
  questions: PlayerQuestion[]
  warmupIds?: string[]
  lessonNoteId?: string | null
}) {
  const router = useRouter()

  const ordered = useMemo(() => {
    if (warmupIds.length === 0) return questions
    const set = new Set(warmupIds)
    const warm = warmupIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is PlayerQuestion => Boolean(q))
    return [...warm, ...questions.filter((q) => !set.has(q.id))]
  }, [questions, warmupIds])

  const warmupCount = useMemo(
    () => ordered.slice(0, warmupIds.length).filter((q) => warmupIds.includes(q.id)).length,
    [ordered, warmupIds],
  )
  const alreadyStarted = useMemo(() => ordered.some((q) => q.selectedAnswer != null), [ordered])
  const lesson = lessonNoteId ? getNoteById(lessonNoteId) : null

  const [showLearn, setShowLearn] = useState(Boolean(lesson) && !alreadyStarted)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [checking, setChecking] = useState(false)
  const [finished, setFinished] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [answered, setAnswered] = useState(0)

  const q = ordered[index]
  const isWarmup = index < warmupCount

  const check = async () => {
    if (!selected || !q || feedback) return
    if (q.correctAnswer) {
      setFeedback({
        isCorrect: q.correctAnswer === selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? '',
      })
      setAnswered((n) => n + 1)
      void submitAnswer(sessionId, q.id, selected).catch(() => {})
      return
    }
    setChecking(true)
    try {
      const result = await submitAnswer(sessionId, q.id, selected)
      setFeedback(result as Feedback)
      setAnswered((n) => n + 1)
    } catch {
      // network failure: stay on the question, allow retry
    } finally {
      setChecking(false)
    }
  }

  const next = () => {
    if (index < ordered.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setFeedback(null)
    } else {
      setFinished(true)
    }
  }

  const finish = async () => {
    if (finishing) return
    setFinishing(true)
    setFinishError(null)
    try {
      const result = await completePracticeSession(sessionId)
      celebrate()
      router.push(`/results/${result.sessionId}`)
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : 'Could not finish session')
      setFinishing(false)
    }
  }

  if (showLearn && lesson) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700">
            <BookOpen className="h-3.5 w-3.5" />
            Learn first
          </span>
        </div>
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
          <h2 className="font-display text-2xl sm:text-[28px] font-medium leading-tight text-black">{lesson.topic}</h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft font-semibold">{lesson.summary}</p>
          <div className="mt-6 space-y-5">
            {lesson.sections.map((section) => (
              <div key={section.heading}>
                <h3 className="font-display text-lg font-medium text-black">{section.heading}</h3>
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-1.5 text-sm leading-relaxed text-ink-soft font-semibold">{p}</p>
                ))}
                <ul className="mt-2 space-y-1.5">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-soft font-semibold">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {lesson.examTip && (
            <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <p className="font-display text-sm font-medium text-amber-800">Exam tip</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900 font-semibold">{lesson.examTip}</p>
            </div>
          )}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowLearn(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 min-h-[44px] cursor-pointer"
            >
              Skip to questions
            </button>
            <button
              onClick={() => setShowLearn(false)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[52px] cursor-pointer transition-all"
            >
              <Play className="h-4 w-4" />
              Start practice
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-pop">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-5">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </span>
        <h2 className="font-display text-3xl font-medium text-black">Session complete</h2>
        <p className="mt-2 text-[15px] font-semibold text-ink-soft mb-7">
          You answered {answered} of {ordered.length} questions.
        </p>
        {finishError && <p className="mb-4 text-sm font-bold text-red-600">{finishError}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={finish}
            disabled={finishing}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px] cursor-pointer disabled:opacity-60 transition-all"
          >
            {finishing ? 'Wrapping up...' : 'See what stuck'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setIndex(0); setSelected(null); setFeedback(null); setFinished(false); setAnswered(0) }}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-soft min-h-[52px] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Start over
          </button>
        </div>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full bg-white border border-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-ink-soft shadow-sm">
          {isWarmup ? `Warm-up ${index + 1} of ${warmupCount}` : `Question ${index + 1 - warmupCount} of ${ordered.length - warmupCount}`}
        </span>
        <span className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-extrabold text-white">Practice</span>
      </div>

      {isWarmup && index === 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border-2 border-orange-200 bg-orange-50 px-4 py-3.5">
          <Flame className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
          <p className="text-[13px] leading-relaxed font-bold text-orange-900">
            Still got it? These are from last time — quick retrieval before new material.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
        <h3 className="font-display text-lg sm:text-xl font-medium leading-snug text-black mb-6">{q.questionText}</h3>
        <div className="space-y-3">
          {q.options.map((opt) => {
            const isSel = selected === opt.key
            const revealed = feedback !== null
            const isCorrectOpt = revealed && opt.key === feedback.correctAnswer
            return (
              <button
                key={opt.key}
                disabled={revealed}
                onClick={() => setSelected(opt.key)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-left min-h-[56px] transition-all ${
                  revealed
                    ? isCorrectOpt
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : isSel
                        ? 'border-red-400 bg-red-50/60'
                        : 'border-gray-200 bg-white opacity-70'
                    : isSel
                      ? 'border-blue-600 bg-blue-50/60 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold border-2 ${
                  revealed && isCorrectOpt
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : revealed && isSel
                      ? 'bg-red-500 border-red-500 text-white'
                      : isSel
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-500 bg-white'
                }`}>
                  {opt.key}
                </span>
                <span className="text-[15px] font-bold text-black">{opt.text}</span>
              </button>
            )
          })}
        </div>

        {feedback && (
          <div className="mt-6 space-y-4 animate-pop">
            <div className={`flex items-center gap-2 rounded-2xl px-4 py-3.5 border ${
              feedback.isCorrect ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {feedback.isCorrect
                ? <Check className="h-5 w-5 shrink-0" strokeWidth={3} />
                : <X className="h-5 w-5 shrink-0" strokeWidth={3} />}
              <span className="font-display text-lg font-medium">
                {feedback.isCorrect ? 'Correct — nice.' : `Not quite — it was ${feedback.correctAnswer}`}
              </span>
            </div>
            <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4 sm:p-5">
              <p className="font-display text-base font-medium text-blue-900 mb-2">Explanation</p>
              <p className="text-sm text-ink-soft leading-relaxed font-semibold">{feedback.explanation}</p>
            </div>
            {feedback.misconception && (
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 sm:p-5">
                <p className="font-display text-base font-medium text-amber-900 mb-2">
                  Why this tempts: {feedback.misconception.name}
                </p>
                {feedback.misconception.sharedPct !== null && (
                  <p className="mb-2 text-xs font-extrabold text-amber-700">
                    {feedback.misconception.sharedPct}% of students also picked this on their first try — it&apos;s not just you.
                  </p>
                )}
                <p className="text-sm text-ink-soft leading-relaxed font-semibold">{feedback.misconception.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span className="font-display text-sm font-medium text-ink-soft/70">{answered} answered</span>
        {feedback ? (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[52px] cursor-pointer transition-all"
          >
            {index < ordered.length - 1 ? 'Next' : 'Finish'}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={check}
            disabled={!selected || checking}
            className={`rounded-2xl px-7 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
              selected && !checking ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] cursor-pointer' : 'bg-gray-300'
            }`}
          >
            {checking ? 'Checking...' : 'Check answer'}
          </button>
        )}
      </div>
    </div>
  )
}
