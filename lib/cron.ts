import { timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

/**
 * Cron routes are public URLs; they must prove they were invoked by the
 * scheduler. Vercel sends `Authorization: Bearer <CRON_SECRET>` when the
 * env var is configured. Without a configured secret every cron request is
 * rejected (fail closed) — dev runs can call the same logic directly.
 * Comparison is constant-time so the secret cannot be recovered by timing.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(header, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
