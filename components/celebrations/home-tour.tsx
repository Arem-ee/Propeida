'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

/**
 * HomeTour: a minimal one-screen spotlight tour — the Duolingo-style
 * coach marks that games/software use, minus the coercion.
 *
 * Auto-fires once, right after new-user onboarding lands them on Home
 * (server decides `enabled` by "never completed a session"). Safe to
 * skip, impossible to miss, never blocks learning. Shown at most once
 * per device: localStorage is the flag.
 *
 * Steps point at the real elements (`data-tour` anchors on Home's hero
 * card and the shell's Practice/Mocks/Progress tabs). If an anchor is
 * missing or hidden (e.g. desktop sidebar vs mobile tab bar) that step
 * is skipped automatically — the tour never dies on a missing element.
 */

interface TourStep {
  selector: string
  title: string
  body: string
  placement: 'top' | 'bottom'
}

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="hero"]',
    title: 'This is your next best move',
    body: 'Everything here comes from what you practised',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="practice-tab"]',
    title: 'Practice',
    body: 'The questions you miss come back at the right time',
    placement: 'top',
  },
  {
    selector: '[data-tour="mocks-tab"]',
    title: 'Mocks',
    body: 'Your mock runs like exam day, so the clock and the screen feel familiar',
    placement: 'top',
  },
  {
    selector: '[data-tour="progress-tab"]',
    title: 'Progress',
    body: 'This is your mastery map, and it shows the subject to work on next',
    placement: 'top',
  },
]

const SEEN_KEY = 'propeida-tour-seen-v1'

/** First matching element in DOM order with a real box (visible on this viewport). */
function visibleTarget(selector: string): Element | null {
  const nodes = document.querySelectorAll(selector)
  for (const el of nodes) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return el
  }
  return null
}

export default function HomeTour({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const finish = useCallback(() => {
    setOpen(false)
    try {
      window.localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // storage unavailable — tour ends, no harm
    }
  }, [])

  // Auto-fire once, for enabled (brand-new) learners, if never seen
  useEffect(() => {
    if (!enabled) return
    try {
      if (window.localStorage.getItem(SEEN_KEY)) return
      setOpen(true)
    } catch {
      // private mode — skip the tour rather than risk re-firing every load
    }
  }, [enabled])

  // Escape closes, matching normal dialog behavior
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, finish])

  // Position the spotlight against the live anchor; re-measure on resize/scroll
  const measure = useCallback(() => {
    const step = STEPS[stepIndex]
    if (!step) return
    const target = visibleTarget(step.selector)
    if (!target) {
      // Anchor missing on this viewport — jump to the next step, or finish
      const next = stepIndex + 1
      if (next >= STEPS.length) finish()
      else setStepIndex(next)
      return
    }
    setRect(target.getBoundingClientRect())
  }, [stepIndex, finish])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    nextRef.current?.focus()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, measure])

  if (!open || !rect) return null

  const step = STEPS[stepIndex]
  if (!step) return null

  const isLast = stepIndex === STEPS.length - 1
  const spotlight = {
    top: rect.top - 6,
    left: rect.left - 6,
    width: rect.width + 12,
    height: rect.height + 12,
  }

  // Tooltip placement: above for top-anchored steps, below for hero
  const bubbleWidth = Math.min(320, window.innerWidth - 32)
  const bubbleLeft = Math.max(16, Math.min(window.innerWidth - bubbleWidth - 16, rect.left))
  const bubbleTop =
    step.placement === 'bottom'
      ? spotlight.top + spotlight.height + 14
      : spotlight.top - 190

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="home-tour-title" className="fixed inset-0 z-[70]">
      {/* Dimmed backdrop with a spotlight cutout via enormous box-shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-3xl border-2 border-white/40 bg-white/10"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow: '0 0 0 9999px rgba(9, 14, 28, 0.55)',
        }}
      />
      {/* Skip */}
      <button
        onClick={finish}
        aria-label="Skip the tour"
        className="absolute top-4 right-4 flex h-11 min-w-[44px] items-center gap-1.5 rounded-2xl border border-white/25 bg-black/35 px-3 text-[13px] font-extrabold text-white backdrop-blur min-h-[44px] cursor-pointer"
      >
        <X className="h-4 w-4" /> Skip
      </button>
      {/* Tooltip */}
      <div
        className="absolute rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(9,14,28,0.6)] animate-pop-in max-w-[320px]"
        style={{ top: Math.max(76, bubbleTop), left: bubbleLeft, width: bubbleWidth }}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
          {stepIndex + 1} of {STEPS.length}
        </p>
        <h3 id="home-tour-title" className="mt-1 font-display text-lg font-medium text-black">
          {step.title}
        </h3>
        <p className="mt-1 text-[13px] font-semibold leading-relaxed text-ink-soft">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <span aria-hidden="true" className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 w-4 rounded-full ${i === stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </span>
          <button
            ref={nextRef}
            onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-extrabold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer pressable"
          >
            {isLast ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
