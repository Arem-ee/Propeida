export interface PlatformStats {
  questionsAnswered: number
  practiceSessions: number
  mockSessions: number
  activeStudents30d: number
  studentsTotal: number
  baselineQuestions: number
  baselineStudents: number
}

const TTL_MS = 5 * 60 * 1000

let cached: PlatformStats | null = null
let cachedAt = 0
let inFlight: Promise<PlatformStats | null> | null = null

export function getPlatformStats(): Promise<PlatformStats | null> {
  const now = Date.now()

  if (cached && now - cachedAt < TTL_MS) {
    return Promise.resolve(cached)
  }

  if (!inFlight) {
    inFlight = fetch('/api/stats')
      .then((r) => (r.ok ? (r.json() as Promise<PlatformStats | null>) : null))
      .then((data) => {
        cached = data
        cachedAt = Date.now()
        return data
      })
      .catch(() => null)
      .finally(() => {
        inFlight = null
      })
  }

  return inFlight
}
