'use client'

import { MathText } from '@/components/lessons/math-text'
import type { WalkthroughExplanation } from '@/lib/lessons'

/**
 * MascotWalkthrough: the v3 explanation shown after a practice answer.
 * A one-line verdict naming the idea, numbered steps with the why and
 * separate workings lines, an optional distractor note (only when the
 * learner actually chose that wrong option), and a takeaway rule.
 */
export function MascotWalkthrough({
  walkthrough,
  selectedAnswer,
}: {
  walkthrough: WalkthroughExplanation
  selectedAnswer?: string | null
}) {
  const distractor = selectedAnswer
    ? walkthrough.distractorExplanations?.[selectedAnswer]
    : undefined
  return (
    <div className="mt-1.5 space-y-3">
      <p className="text-[13px] font-bold leading-relaxed text-ink">
        <MathText text={walkthrough.summaryVerdict} />
      </p>
      <ol className="space-y-3">
        {walkthrough.steps.map((s) => (
          <li key={s.stepNumber} className="rounded-2xl border border-blue-100 bg-white/70 p-3">
            <p className="font-display text-[13px] font-extrabold text-black">
              {s.stepNumber}. {s.title}
            </p>
            {s.explanation && (
              <p className="mt-0.5 text-[12px] font-semibold leading-relaxed text-ink-soft">
                <MathText text={s.explanation} />
              </p>
            )}
            {s.workings.length > 0 && (
              <div className="mt-2 space-y-1 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2">
                {s.workings.map((line, i) => (
                  <p key={i} className="font-mono text-[12px] font-semibold text-blue-900">
                    <MathText text={line} />
                  </p>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      {distractor && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-bold leading-relaxed text-amber-900">
          Why {selectedAnswer} pulls you in: {distractor.reason}
          {distractor.wrongWorkings?.map((w, i) => (
            <span key={i} className="mt-1 block font-mono text-[12px] font-semibold">
              <MathText text={w} />
            </span>
          ))}
        </p>
      )}
      {walkthrough.takeawayRule && (
        <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-extrabold text-emerald-900">
          Remember: <MathText text={walkthrough.takeawayRule} />
        </p>
      )}
    </div>
  )
}
