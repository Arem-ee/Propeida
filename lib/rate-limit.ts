const stores = new Map<string, { count: number; resetAt: number }>()

// Best-effort throttling only: this state is per-process and callers must treat
// it as a load-shedding aid, never as an authorization or fraud-control boundary.
// Durable abuse controls require a shared store and trusted proxy-derived client IP.

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = stores.get(key)

  if (!record || now > record.resetAt) {
    stores.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

export function rateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`
}
