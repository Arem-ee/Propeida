'use client'

import { Mascot, type MascotExpression } from '@/components/mascot'
import { MathText } from '@/components/lessons/math-text'

/**
 * SpeechBubble: the mascot's voice in the interface.
 *
 * Personality lines only — never instructions, never errors, never
 * payments. Short, warm, human. Sits above the fold of the moment:
 * it pops in 180ms after the mascot pops in.
 *
 * Use as a standalone bubble or via MascotSays for the composed
 * "mascot + bubble" moment.
 */
export function SpeechBubble({
  text,
  tail = 'left',
  className,
}: {
  text: string
  tail?: 'left' | 'right'
  className?: string
}) {
  return (
    <div
      className={`speech-pop relative inline-block max-w-[230px] rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-[13px] leading-snug font-extrabold text-ink-soft shadow-[0_6px_20px_-8px_rgba(16,28,51,0.25)] ${className ?? ''}`}
      role="status"
    >
      {text}
      <span
        aria-hidden="true"
        className={`absolute bottom-[-7px] h-3.5 w-3.5 rotate-45 border-b border-r border-blue-100 bg-white ${
          tail === 'left' ? 'left-5' : 'right-5'
        }`}
      />
    </div>
  )
}

/**
 * MascotSays: the composed delight moment — mascot pops in carrying a
 * speech bubble with a short, warm line. This is how the mascot "talks"
 * until the AI voice is integrated.
 */
export function MascotSays({
  expression = 'idle',
  text,
  size = 'md',
  tail = 'left',
  popKey,
  className,
}: {
  expression?: MascotExpression
  text: string
  size?: 'sm' | 'md' | 'lg'
  tail?: 'left' | 'right'
  popKey?: number
  className?: string
}) {
  return (
    <div className={`flex items-end gap-3 ${className ?? ''}`}>
      <Mascot expression={expression} size={size} popKey={popKey} />
      <SpeechBubble text={text} tail={tail} />
    </div>
  )
}

/**
 * MascotMisconception: the worried pose owns the "why this tempts you"
 * card. Honest empathy, verbatim diagnostic content. Repair CTAs render
 * below this component and stay sober.
 */
export function MascotMisconception({
  name,
  explanation,
  sharedPct,
  repeatCount,
  popKey,
}: {
  name: string
  explanation: string
  sharedPct: number | null
  repeatCount: number
  popKey?: number
}) {
  return (
    <div className="flex items-start gap-3 animate-pop-in" style={{ animationDelay: '120ms' }}>
      <Mascot expression="worried" size="md" popKey={popKey} className="mt-1 shrink-0" />
      <div className="speech-pop relative flex-1 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 sm:p-5">
        <span
          aria-hidden="true"
          className="absolute top-5 -left-[10px] h-4 w-4 rotate-45 border-b border-l border-amber-200 bg-amber-50"
        />
        <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-amber-800">
          Why this answer tempts you
        </p>
        <p className="mt-0.5 font-display text-base font-medium text-amber-900">{name}</p>
        {sharedPct !== null && (
          <p className="mt-1.5 text-xs font-extrabold text-amber-700">
            {sharedPct}% of people also picked this first, so it is not just you
          </p>
        )}
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft font-semibold">{explanation}</p>
        {repeatCount > 0 && (
          <p className="mt-1.5 text-xs font-extrabold text-red-700">
            You have hit this exact error {repeatCount + 1} times, so fix the root instead of retrying harder
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * MascotExamTip: the lightbulb pose owns the "exam tip" callout —
 * the one trick worth remembering walking into the hall.
 */
export function MascotExamTip({ tip, className }: { tip: string; className?: string }) {
  if (!tip) return null
  return (
    <div className={`flex items-start gap-3 ${className ?? ''}`}>
      <Mascot expression="thinking" size="md" className="mt-1 shrink-0" />
      <div className="speech-pop relative flex-1 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
        <span
          aria-hidden="true"
          className="absolute top-4 -left-[10px] h-4 w-4 rotate-45 border-b border-l border-amber-200 bg-amber-50"
        />
        <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-amber-800">
          Exam tip
        </p>
        <p className="mt-1 text-sm leading-relaxed font-semibold text-amber-900">{tip}</p>
      </div>
    </div>
  )
}

/**
 * MascotExplains: the mascot delivers the question's explanation as a
 * speech bubble — "teacher voice" framing, which aids recall. The
 * explanation itself stays verbatim, selectable, and screen-reader
 * friendly; the mascot only frames it with one short opener line.
 * Never replaces or paraphrases the content. If there's no explanation
 * text, renders nothing.
 */
export function MascotExplains({
  correct,
  explanation,
  steps,
  popKey,
}: {
  correct: boolean
  explanation: string
  /** Optional step-by-step breakdown (maths/science). Rendered instead of `explanation` when provided. */
  steps?: React.ReactNode
  popKey?: number
}) {
  if (!explanation && !steps) return null
  return (
    <div className="flex items-start gap-3">
      <Mascot
        expression={correct ? 'proud' : 'thinking'}
        size="md"
        popKey={popKey}
        className="mt-1 shrink-0"
      />
      <div className="speech-pop relative flex-1 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
        {/* tail pointing at the mascot */}
        <span
          aria-hidden="true"
          className="absolute top-5 -left-[9px] h-4 w-4 rotate-45 border-b border-l border-blue-100 bg-blue-50"
        />
        <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-blue-800">
          {correct ? 'Here is why you got it right' : 'Here is what to notice next time'}
        </p>
        {steps ? (
          <div className="mt-1.5">{steps}</div>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft font-semibold"><MathText text={explanation} /></p>
        )}
      </div>
    </div>
  )
}
