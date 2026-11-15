'use client'

import type { WinKind } from './use-wins'

type AddWin = (win: {
  kind: WinKind
  message: string
  subtext?: string
  mascot?: boolean
  duration?: number
}) => void

/**
 * Fires the streak win toast at most once per day, and only when the
 * streak has actually extended (2+ days). Day 1 of a fresh streak is
 * not celebrated — noise, not delight. Copy is always warm, never
 * loss-framed: streaks are the work adding up, not a thing to protect.
 */
export function celebrateStreakIfNew(
  streak: number | null | undefined,
  add: AddWin,
) {
  if (typeof window === 'undefined') return
  if (!streak || streak < 2) return

  const now = new Date()
  const key = `propeida-streak-toast-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  try {
    if (window.localStorage.getItem(key)) return
    window.localStorage.setItem(key, '1')
  } catch {
    // Storage unavailable — fire anyway; one toast per completion
  }

  const message = `You studied ${streak} ${streak === 1 ? 'day' : 'days'} in a row`
  add({
    kind: 'streak',
    message,
    subtext: 'You keep showing up',
    mascot: true,
    duration: 3500,
  })
}
