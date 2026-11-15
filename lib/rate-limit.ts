import { getRedis } from './redis'

const memoryStore = new Map<string, { count: number; resetAt: number }>()
const MEMORY_STORE_MAX = 1000

function sweepMemoryStore(now: number) {
  // The fallback is per-process and attacker-keyed by IP; never let it grow
  // without bound. Drop expired entries first, then the oldest by reset time.
  for (const [k, v] of memoryStore) {
    if (now > v.resetAt) memoryStore.delete(k)
  }
  if (memoryStore.size <= MEMORY_STORE_MAX) return
  const removeCount = memoryStore.size - Math.floor(MEMORY_STORE_MAX / 2)
  const byAge = [...memoryStore.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)
  for (const [k] of byAge.slice(0, removeCount)) memoryStore.delete(k)
}

/**
 * Best-effort throttling only: never an authorization or fraud-control boundary.
 * Uses shared Upstash Redis (fixed window) when configured, so limits hold
 * across serverless instances. Falls back to per-process memory otherwise
 * (single-instance dev / preview).
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis()
  if (!client) return checkMemoryRateLimit(key, maxRequests, windowMs)

  try {
    const count = await client.incr(key)
    if (count === 1) {
      // INCR and PEXPIRE are two round trips; if PEXPIRE fails after INCR
      // lands, the key would live forever and block this IP forever. Roll the
      // key back instead — the next request then starts the window fresh.
      try {
        await client.pexpire(key, windowMs)
      } catch {
        await client.del(key).catch(() => {})
        return checkMemoryRateLimit(key, maxRequests, windowMs)
      }
    }
    if (count > maxRequests) {
      return { allowed: false, remaining: 0 }
    }
    return { allowed: true, remaining: maxRequests - count }
  } catch {
    // Redis outage must not take the product down: fail open to memory store.
    return checkMemoryRateLimit(key, maxRequests, windowMs)
  }
}

function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  if (memoryStore.size >= MEMORY_STORE_MAX) sweepMemoryStore(now)
  const record = memoryStore.get(key)

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

export function rateLimitKey(ip: string, endpoint: string): string {
  return `rl:${endpoint}:${ip}`
}

/**
 * Extract the client IP from request headers.
 * Prefers `x-real-ip` (set/overwritten by Vercel, not client-spoofable),
 * then the leftmost entry of `x-forwarded-for`.
 */
export function getClientIp(
  get: (name: string) => string | null,
): string {
  const realIp = get('x-real-ip')?.trim()
  if (realIp) return realIp
  const forwarded = get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first || 'unknown'
}
