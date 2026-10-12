'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, Send, CheckCircle, Calculator } from 'lucide-react'
import { submitAnswer, completeMockSession } from '@/lib/actions/practice'
import { celebrate } from '@/lib/celebrate'

function SafeCalculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0')
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)

  const input = (d: string) => {
    setDisplay((prev) => (fresh || prev === '0' ? d : prev.length >= 12 ? prev : prev + d))
    setFresh(false)
  }

  const compute = (a: number, b: number, operation: string): number | null => {
    switch (operation) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b === 0 ? null : a / b
      default: return null
    }
  }

  const applyOp = (next: string) => {
    const current = parseFloat(display)
    if (Number.isNaN(current)) return
    if (stored !== null && op && !fresh) {
      const result = compute(stored, current, op)
      if (result === null || !Number.isFinite(result)) {
        setDisplay('Error')
        setStored(null)
        setOp(null)
        setFresh(true)
        return
      }
      const rounded = Math.round(result * 1e10) / 1e10
      setDisplay(String(rounded))
      setStored(rounded)
    } else {
      setStored(current)
    }
    setOp(next)
    setFresh(true)
  }

  const equals = () => {
    if (stored === null || !op) return
    const current = parseFloat(display)
    if (Number.isNaN(current)) return
    const result = compute(stored, current, op)
    if (result === null || !Number.isFinite(result)) {
      setDisplay('Error')
    } else {
      setDisplay(String(Math.round(result * 1e10) / 1e10))
    }
    setStored(null)
    setOp(null)
    setFresh(true)
  }

  const clear = () => {
    setDisplay('0')
    setStored(null)
    setOp(null)
    setFresh(true)
  }

  const backspace = () => {
    setDisplay((prev) => (prev.length <= 1 || fresh ? '0' : prev.slice(0, -1)))
  }

  const keys: { label: string; action: () => void; wide?: boolean; tone?: 'op' | 'danger' }[] = [
    { label: 'C', action: clear, tone: 'danger' },
    { label: '⌫', action: backspace, tone: 'danger' },
    { label: '÷', action: () => applyOp('÷'), tone: 'op' },
    { label: '7', action: () => input('7') },
    { label: '8', action: () => input('8') },
    { label: '9', action: () => input('9') },
    { label: '×', action: () => applyOp('×'), tone: 'op' },
    { label: '4', action: () => input('4') },
    { label: '5', action: () => input('5') },
    { label: '6', action: () => input('6') },
    { label: '−', action: () => applyOp('−'), tone: 'op' },
    { label: '1', action: () => input('1') },
    { label: '2', action: () => input('2') },
    { label: '3', action: () => input('3') },
    { label: '+', action: () => applyOp('+'), tone: 'op' },
    { label: '0', action: () => input('0'), wide: true },
    { label: '.', action: () => input('.') },
    { label: '=', action: equals, tone: 'op' },
  ]

  return (
    <div className="rounded-3xl border-2 border-gray-200 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] w-[260px]" role="dialog" aria-label="Calculator">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Calculator</span>
        <button onClick={onClose} className="text-xs font-bold text-gray-400 min-h-[36px] px-2 cursor-pointer" aria-label="Close calculator">Close</button>
      </div>
      <div className="rounded-2xl bg-ink text-white px-4 py-3 font-display text-2xl font-medium text-right tabular-nums truncate" aria-live="polite">
        {display}
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {keys.map((k) => (
          <button
            key={k.label}
            onClick={k.action}
            className={`rounded-xl py-2.5 text-base font-extrabold min-h-[48px] cursor-pointer transition-colors ${
              k.tone === 'op'
                ? 'bg-blue-600 text-white'
                : k.tone === 'danger'
                  ? 'bg-gray-100 text-red-600'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
            } ${k.wide ? 'col-span-2' : ''}`}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export interface MockQuestion {
  id: string
  subjectId: string
  subjectName: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
}

function useCountdown(startedAt: string, limitSeconds: number, onExpire: () => void) {
  const [left, setLeft] = useState(() => {
    const deadline = new Date(startedAt).getTime() + limitSeconds * 1000
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000))
  })
  const expiredRef = useRef(false)
  useEffect(() => {
    if (left <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onExpire])
  return left
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

export default function MockPlayer({
  sessionId,
  questions,
  timeLimitSeconds,
  startedAt,
}: {
  sessionId: string
  questions: MockQuestion[]
  timeLimitSeconds: number
  startedAt: string
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const q of questions) {
      if (q.selectedAnswer) init[q.id] = q.selectedAnswer
    }
    return init
  })
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [done, setDone] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  const total = questions.length
  const current = questions[index]
  const answeredCount = Object.keys(selections).length

  const submitAll = useCallback(async () => {
    if (finalizing) return
    setFinalizing(true)
    setConfirming(false)
    try {
      await completeMockSession(sessionId)
      celebrate()
      setDone(true)
    } catch {
      setFinalizing(false)
    }
  }, [finalizing, sessionId])

  const handleExpire = useCallback(() => {
    setTimedOut(true)
    void submitAll()
  }, [submitAll])

  const left = useCountdown(startedAt, timeLimitSeconds, handleExpire)
  const urgent = left < 300

  const subjects = useMemo(() => {
    const seen = new Map<string, string>()
    for (const q of questions) {
      if (!seen.has(q.subjectId)) seen.set(q.subjectId, q.subjectName)
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }))
  }, [questions])
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)
  const visibleIndexes = useMemo(
    () =>
      questions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => !subjectFilter || q.subjectId === subjectFilter)
        .map(({ i }) => i),
    [questions, subjectFilter],
  )

  const select = (key: string) => {
    if (!current || done) return
    setSelections((prev) => ({ ...prev, [current.id]: key }))
    void submitAnswer(sessionId, current.id, key).catch(() => {})
  }

  const toggleFlag = () => {
    if (!current) return
    setFlagged((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(current.id)) nextSet.delete(current.id)
      else nextSet.add(current.id)
      return nextSet
    })
  }

  const goTo = (i: number) => setIndex(Math.min(Math.max(0, i), total - 1))

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-pop">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-5">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </span>
        <h2 className="font-display text-3xl font-medium text-black">
          {timedOut ? 'Time is up — submitted' : 'Mock submitted'}
        </h2>
        <p className="mt-2 text-[15px] font-semibold text-ink-soft mb-7">
          {answeredCount} of {total} answered. Answers autosaved throughout.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/results/${sessionId}`)}
            className="rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[52px] cursor-pointer transition-all"
          >
            See results
          </button>
          <button
            onClick={() => router.push('/mocks')}
            className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-soft min-h-[52px] cursor-pointer"
          >
            Back to Mocks
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="mx-auto max-w-3xl pb-40 lg:pb-28">
      {/* Hall bar: subjects + timer */}
      <div className="sticky top-16 lg:top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-paper/95 backdrop-blur py-3 border-b border-blue-100/60">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSubjectFilter(null)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold min-h-[40px] cursor-pointer transition-all ${
              !subjectFilter ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
            }`}
          >
            All
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectFilter((f) => (f === s.id ? null : s.id))}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold min-h-[40px] cursor-pointer transition-all ${
                subjectFilter === s.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            onClick={() => setCalculatorOpen((v) => !v)}
            aria-pressed={calculatorOpen}
            aria-label="Toggle calculator"
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold min-h-[40px] cursor-pointer transition-all ${
              calculatorOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            Calc
          </button>
          <span className={`ml-auto shrink-0 rounded-full px-3.5 py-2 font-display text-base font-semibold tabular-nums min-h-[40px] inline-flex items-center ${
            urgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-ink text-white'
          }`}>
            {formatClock(left)}
          </span>
        </div>
      </div>

      {calculatorOpen && (
        <div className="fixed bottom-[150px] lg:bottom-24 right-4 z-40 animate-pop">
          <SafeCalculator onClose={() => setCalculatorOpen(false)} />
        </div>
      )}

      {/* Question */}
      <div className="mt-5 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-white border border-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-ink-soft shadow-sm">
            Question {index + 1} of {total}
          </span>
          <button
            onClick={toggleFlag}
            aria-pressed={flagged.has(current.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold min-h-[40px] cursor-pointer transition-all ${
              flagged.has(current.id) ? 'bg-amber-400 text-black' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            {flagged.has(current.id) ? 'Flagged' : 'Flag'}
          </button>
        </div>

        <h3 className="font-display text-lg sm:text-xl font-medium leading-snug text-black mb-5">{current.questionText}</h3>
        <div className="space-y-2.5">
          {current.options.map((opt) => {
            const isSel = selections[current.id] === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => select(opt.key)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left min-h-[56px] transition-all cursor-pointer ${
                  isSel ? 'border-blue-600 bg-blue-50/60' : 'border-gray-200 bg-white'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold border-2 ${
                  isSel ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500 bg-white'
                }`}>
                  {opt.key}
                </span>
                <span className="text-[15px] font-bold text-black">{opt.text}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const pos = visibleIndexes.indexOf(index)
              goTo(visibleIndexes[Math.max(0, pos - 1)] ?? index)
            }}
            disabled={visibleIndexes.indexOf(index) <= 0}
            className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-ink-soft min-h-[48px] cursor-pointer disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => {
              const pos = visibleIndexes.indexOf(index)
              goTo(visibleIndexes[Math.min(visibleIndexes.length - 1, pos + 1)] ?? index)
            }}
            disabled={visibleIndexes.indexOf(index) >= visibleIndexes.length - 1}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white min-h-[48px] cursor-pointer disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Palette */}
      <div className="mt-5 rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
            {answeredCount}/{total} answered
          </p>
          <button
            onClick={() => setConfirming(true)}
            disabled={finalizing}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white min-h-[40px] cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            End exam
          </button>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
          {questions.map((q, i) => {
            const answered = q.id in selections
            const isCurrent = i === index
            const isFlagged = flagged.has(q.id)
            return (
              <button
                key={q.id}
                onClick={() => goTo(i)}
                aria-label={`Question ${i + 1}${answered ? ', answered' : ', unanswered'}${isFlagged ? ', flagged' : ''}`}
                className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-extrabold min-h-[36px] cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : answered
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white" />
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-gray-400">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Attempted</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-gray-200" /> Unattempted</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-600" /> Current</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Flagged</span>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Confirm submit">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 animate-pop">
            <h2 className="font-display text-2xl font-medium text-black">End exam?</h2>
            <p className="mt-2 text-sm font-semibold text-ink-soft">
              {answeredCount} of {total} answered.
              {answeredCount < total ? ' Unanswered questions stay blank.' : ' Everything is in.'}
            </p>
            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => void submitAll()}
                disabled={finalizing}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] cursor-pointer disabled:opacity-50"
              >
                {finalizing ? 'Submitting...' : 'Submit exam'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-extrabold text-ink-soft min-h-[48px] cursor-pointer"
              >
                Keep going
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky submit */}
      {!confirming && (
        <div className="fixed bottom-[76px] lg:bottom-6 left-0 right-0 z-40 px-4">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-3 rounded-2xl bg-ink text-white px-5 py-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <span className="text-xs font-extrabold tabular-nums">{formatClock(left)} · {answeredCount}/{total}</span>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-black min-h-[44px] cursor-pointer"
            >
              End exam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
