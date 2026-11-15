'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { recordStepFeedback } from '@/lib/actions/step-feedback'

type StepFeedbackRating = 'helped' | 'didnt_help'

/**
 * One-tap helpfulness check on the practice feedback card. Lives next to the
 * worked steps it rates. Separate component so it can be wired into the
 * player without touching the celebration plumbing.
 */
export function StepFeedback({ questionId }: { questionId: string }) {
  const [given, setGiven] = useState<StepFeedbackRating | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const tap = async (rating: StepFeedbackRating) => {
    if (busy) return
    setBusy(true)
    setFailed(false)
    try {
      await recordStepFeedback(questionId, rating)
      setGiven(rating)
    } catch {
      setFailed(true)
    }
    setBusy(false)
  }

  if (given) {
    return (
      <p className="mt-3 text-[12px] font-semibold leading-snug text-ink-soft">
        {given === 'helped' ? 'Good, keep them.' : 'Noted. We will sharpen them.'}
      </p>
    )
  }

  return (
    <div className="mt-3">
      <p className="text-[12px] font-bold leading-snug text-ink-soft">
        Did these steps help?
      </p>
      <div className="mt-1.5 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => tap('helped')}
          aria-label="The steps helped"
          className="inline-flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-[12px] font-extrabold text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-50"
        >
          <ThumbsUp className="h-4 w-4" aria-hidden />
          They helped
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => tap('didnt_help')}
          aria-label="The steps did not help"
          className="inline-flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[12px] font-extrabold text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100 disabled:opacity-50"
        >
          <ThumbsDown className="h-4 w-4" aria-hidden />
          Not really
        </button>
      </div>
      {failed && (
        <p className="mt-1.5 text-[11px] font-semibold text-amber-700">
          That did not save. Give it another tap.
        </p>
      )}
    </div>
  )
}
