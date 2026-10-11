import { Redis } from '@upstash/redis'

const memoryStore = new Map<string, { count: number; resetAt: number }>()

let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
  } else {
    redis = null
  }
  return redis
}

/**
 * Best-effort throttling only: never an authorization or fraud-control boundary.
 * Uses shared Upstash Redis (fixed window) when UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are set, so limits hold across serverless instances.
 * Falls back to per-process memory otherwise (single-instance dev / preview).
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
      await client.pexpire(key, windowMs)
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
