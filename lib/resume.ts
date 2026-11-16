/**
 * Client-side resume state for in-progress practice and mock sessions.
 * The database already persists answers per tap (reload restores them);
 * this carries the small client-only bits a reload would otherwise lose:
 * the question position and the mock flag marks. Keyed by session id, so
 * a new session never inherits another session's position.
 *
 * Kept in localStorage rather than the server because it is disposable
 * UI state, not learner data — a lost flag or index is an inconvenience,
 * never a correctness issue.
 */
const PREFIX = 'propeida:resume'

export interface ResumeState {
  index?: number
  flagged?: string[]
}

export function loadResume(sessionId: string): ResumeState {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${sessionId}`)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ResumeState | null
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

export function saveResume(sessionId: string, state: ResumeState): void {
  try {
    window.localStorage.setItem(`${PREFIX}:${sessionId}`, JSON.stringify(state))
  } catch {
    // Storage full or private mode — resume simply will not persist.
  }
}

export function clearResume(sessionId: string): void {
  try {
    window.localStorage.removeItem(`${PREFIX}:${sessionId}`)
  } catch {
    // Best effort only.
  }
}

/** Clamp a persisted index into the range the session actually has. */
export function clampIndex(index: number | undefined, total: number): number {
  if (!Number.isFinite(index)) return 0
  const t = Math.max(0, total - 1)
  return Math.min(Math.max(0, Math.trunc(index as number)), t)
}
