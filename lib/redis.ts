import { Redis } from '@upstash/redis'

/**
 * Shared Upstash Redis client. Optional by design: when the env vars are
 * absent the app falls back to per-process memory (rate limits) or simply
 * skips best-effort signals (presence, ghost nudges). Redis must never be
 * required for the product to work.
 */
let client: Redis | null | undefined

export function getRedis(): Redis | null {
  if (client !== undefined) return client
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    client = Redis.fromEnv()
  } else {
    client = null
  }
  return client
}

/**
 * Best-effort SET NX with TTL. Returns true when this caller won the slot.
 * Without Redis it returns true (nothing to coordinate) so callers degrade
 * to "attempt anyway" rather than silently disabling the feature.
 */
export async function claimOnce(key: string, ttlMs: number): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true
  try {
    const result = await redis.set(key, '1', { nx: true, px: ttlMs })
    return result === 'OK'
  } catch {
    return true
  }
}
