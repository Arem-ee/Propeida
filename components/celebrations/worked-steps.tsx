'use client'

import type { WorkedStep } from '@/lib/lessons'
import StepVisual from '@/components/lessons/step-visual'
import { MathText } from '@/components/lessons/math-text'

/**
 * WorkedSteps: inline step-by-step render of a worked example.
 *
 * Same shape as lessons (operation — reason — result), laid out as a
 * numbered vertical list for answer feedback. The mascot "frames" the
 * list; it never speaks the steps themselves. Each row:
 *   - number (small circled index)
 *   - operation (question's voice, bold)
 *   - reason (study voice, soft)
 *   - result in monospace with a border
 *   - optional visual beneath when provided (StepVisual reuse)
 *
 * Steps must be short: one idea per step. If a step needs two
 * operations, split it; if a reason needs two sentences, trim.
 */
export function WorkedSteps({ steps }: { steps: WorkedStep[] }) {
  if (!steps || steps.length === 0) return null
  return (
    <ol className="mt-2 space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-blue-200 bg-white font-display text-[11px] font-bold text-blue-700"
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[13px] font-semibold leading-snug text-ink">
              <MathText text={step.operation} />
            </span>
            <span className="mt-0.5 block text-[12px] leading-snug font-semibold text-ink-soft">
              <MathText text={step.reason} />
            </span>
            <code className="mt-1.5 block rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-1.5 font-mono text-[13px] leading-snug text-blue-900">
              <MathText text={step.result} />
            </code>
            {step.visual && <StepVisual visual={step.visual} />}
          </span>
        </li>
      ))}
    </ol>
  )
}
