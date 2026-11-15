'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, Flame, Gift, Star, Check, Rocket, X } from 'lucide-react'
import { Mascot, type MascotExpression } from '@/components/mascot'

type WinKind = 'correct' | 'streak' | 'milestone' | 'lesson-done' | 'session-done' | 'onboarded'

interface WinToastProps {
  win: {
    id: string
    kind: WinKind
    message: string
    subtext?: string
    mascot?: boolean
    duration?: number
  }
  onRemove: (id: string) => void
}

const ICONS: Record<WinKind, React.ComponentType<{ className?: string }>> = {
  correct: CheckCircle,
  streak: Flame,
  milestone: Gift,
  'lesson-done': Check,
  'session-done': Rocket,
  onboarded: Star,
}

/** Mascot pose per win kind: small wins get a grin, big ones get the party hat. */
const MASCOT_POSE: Record<WinKind, MascotExpression> = {
  correct: 'proud',
  streak: 'streak',
  milestone: 'celebrate',
  'lesson-done': 'celebrate',
  'session-done': 'celebrate',
  onboarded: 'celebrate',
}

const BADGE_COLORS: Record<WinKind, string> = {
  correct: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  streak: 'bg-amber-50 border-amber-200 text-amber-700',
  milestone: 'bg-violet-50 border-violet-200 text-violet-700',
  'lesson-done': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'session-done': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  onboarded: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

export function WinToast({ win, onRemove }: WinToastProps) {
  const timerRef = useRef<number | null>(null)
  const Icon = ICONS[win.kind]

  useEffect(() => {
    if (win.duration && win.duration > 0) {
      timerRef.current = window.setTimeout(() => onRemove(win.id), win.duration)
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [win.duration, win.id, onRemove])

  return (
    <div
      key={win.id}
      className={`win-slide-in flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-lg min-h-[64px] ${BADGE_COLORS[win.kind]}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-extrabold text-black leading-snug">{win.message}</p>
        {win.subtext && (
          <p className="text-[11px] font-bold text-ink-soft leading-tight">{win.subtext}</p>
        )}
      </div>
      {win.mascot && (
        <Mascot expression={MASCOT_POSE[win.kind]} size="sm" className="shrink-0" />
      )}
      <button
        onClick={() => onRemove(win.id)}
        className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  )
}
