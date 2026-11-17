'use client'

import type { WinKind } from './use-wins'

type AddWin = (win: {
  kind: WinKind
  message: string
  subtext?: string
  mascot?: boolean
  duration?: number
}) => void

const STREAK_MILESTONES = new Set([7, 14, 30, 60, 100, 180, 365])

/**
 * Fires the streak win at most once per day, and only when the streak
 * has actually extended (2+ days). Day 1 of a fresh streak is not
 * celebrated — noise, not delight. Milestone days get their own louder
 * voice; every other day keeps the warm, loss-free framing.
 */
export function celebrateStreakIfNew(
  streak: number | null | undefined,
  add: AddWin,
) {
  if (typeof window === 'undefined') return
  if (!streak || streak < 2) return

  const now = new Date()
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

  if (STREAK_MILESTONES.has(streak)) {
    // Milestones fire once, ever — the number is the achievement.
    const milestoneKey = `propeida-streak-milestone-${streak}`
    try {
      if (window.localStorage.getItem(milestoneKey)) return
      window.localStorage.setItem(milestoneKey, '1')
    } catch {
      // Storage unavailable — fire anyway; one win beats silence
    }
    add({
      kind: 'milestone',
      message: `${streak} days in a row`,
      subtext: streak >= 30 ? 'This is a habit now, not a streak' : 'You keep showing up and it shows',
      mascot: true,
      duration: 4000,
    })
    return
  }

  const key = `propeida-streak-toast-${dayKey}`
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
