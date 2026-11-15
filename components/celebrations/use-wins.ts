'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type WinKind = 'correct' | 'streak' | 'milestone' | 'lesson-done' | 'session-done' | 'onboarded'

interface Win {
  id: string
  kind: WinKind
  message: string
  subtext?: string
  icon?: React.ReactNode
  mascot?: boolean
  duration?: number
}

interface WinsState {
  wins: Win[]
  add: (win: Omit<Win, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

const WIN_CONFIG: Record<WinKind, { defaultMessage: string; iconColor: string }> = {
  correct: { defaultMessage: 'You got it right', iconColor: '#10b981' },
  streak: { defaultMessage: 'You are on a streak', iconColor: '#f59e0b' },
  milestone: { defaultMessage: 'You reached a milestone', iconColor: '#8b5cf6' },
  'lesson-done': { defaultMessage: 'You finished the lesson', iconColor: '#10b981' },
  'session-done': { defaultMessage: 'You finished this session', iconColor: '#10b981' },
  onboarded: { defaultMessage: 'You are all set', iconColor: '#10b981' },
}

// The toast list and the page that raises a win live in different parts of the
// tree, so the wins have to live outside any single component's state.
let wins: Win[] = []
const listeners = new Set<() => void>()
const EMPTY_WINS: Win[] = []

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function getSnapshot() {
  return wins
}

function getServerSnapshot() {
  return EMPTY_WINS
}

export function useWins(): WinsState {
  const currentWins = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((win: Omit<Win, 'id'>) => {
    const id = `${win.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const duration = win.duration ?? (win.kind === 'onboarded' || win.kind === 'session-done' ? 5000 : 3000)
    wins = [...wins, { ...win, id, duration }]
    emit()
  }, [])

  const remove = useCallback((id: string) => {
    wins = wins.filter((w) => w.id !== id)
    emit()
  }, [])

  const clear = useCallback(() => {
    wins = []
    emit()
  }, [])

  return { wins: currentWins, add, remove, clear }
}

/**
 * Helper: looks up the default message for a win kind when none is provided.
 */
export function winMessage(kind: WinKind, custom?: string): string {
  return custom ?? WIN_CONFIG[kind]?.defaultMessage ?? 'You did that well'
}
