'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { submitRecallMark, type RecallCard } from '@/lib/actions/recall'

/**
 * Quick recall: one fact, flip, mark. No options, no timer — retrieval,
 * not a quiz. Marks feed the same mastery model as lessons and sessions.
 */
export default function RecallPlayer({ cards }: { cards: RecallCard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [marked, setMarked] = useState<{ gotIt: number; learning: number }>({ gotIt: 0, learning: 0 })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const card = cards[index]
  const done = index >= cards.length || !card

  const mark = async (known: boolean) => {
    if (!card) return
    setBusy(true)
    setError(null)
    try {
      await submitRecallMark({ cardId: card.id, known })
      setMarked((m) => ({
        gotIt: m.gotIt + (known ? 1 : 0),
        learning: m.learning + (known ? 0 : 1),
      }))
      setFlipped(false)
      setIndex((i) => i + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your answer.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center animate-pop-in">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={2.5} />
        <h2 className="mt-3 font-display text-3xl font-medium text-black">Round done.</h2>
        <p className="mt-2 text-[15px] font-semibold text-ink-soft">
          You recalled {marked.gotIt} of {marked.gotIt + marked.learning}. The rest come
          back soon.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href="/practice"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[52px] pressable"
          >
            Practise next <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-extrabold text-ink-soft hover:bg-gray-50 min-h-[52px] pressable"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  const pct = Math.round((index / cards.length) * 100)

  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-fade-up">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
        Quick recall · {card.subjectName} · {index + 1} of {cards.length}
      </p>

      <button
        key={card.id}
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-4 w-full rounded-3xl border-2 border-gray-100 bg-cream p-6 sm:p-8 text-center min-h-[220px] flex flex-col items-center justify-center cursor-pointer pressable animate-pop-in"
      >
        {!flipped ? (
          <>
            <p className="font-display text-2xl sm:text-3xl font-medium text-black">{card.front}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-extrabold text-blue-700">
              <RotateCcw className="h-4 w-4" /> Tap to see the answer
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl sm:text-3xl font-medium text-black">{card.back}</p>
            {card.hint && (
              <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-ink-soft">{card.hint}</p>
            )}
          </>
        )}
      </button>

      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={busy || !flipped}
          onClick={() => void mark(true)}
          className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-extrabold text-emerald-700 min-h-[56px] cursor-pointer disabled:opacity-50 pressable"
        >
          Got it
        </button>
        <button
          type="button"
          disabled={busy || !flipped}
          onClick={() => void mark(false)}
          className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-4 text-sm font-extrabold text-amber-700 min-h-[56px] cursor-pointer disabled:opacity-50 pressable"
        >
          Still learning
        </button>
      </div>
      {!flipped && (
        <p className="mt-2.5 text-center text-[12px] font-semibold text-gray-500">
          Flip the card first.
        </p>
      )}
    </div>
  )
}
