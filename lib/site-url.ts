/**
 * Canonical site origin — one resolver so nothing drifts.
 *
 * Failure mode this guards against: .env (and at some point the Vercel
 * project env) had NEXT_PUBLIC_BASE_URL=http://localhost:3000, which
 * baked localhost into production builds — users were handed
 * http://localhost:3000/squad?join=… invite links.
 *
 * Rules:
 *  - In production builds, a loopback/unparseable value always falls back
 *    to the canonical https://propeida.online.
 *  - In development, the env value is honoured as-is (it is correct there).
 */

const CANONICAL = 'https://propeida.online'

function isLoopback(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.localhost')
  )
}

export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? '').trim()
  if (!raw) return CANONICAL
  try {
    const url = new URL(raw)
    if (process.env.NODE_ENV === 'production' && isLoopback(url.hostname)) {
      return CANONICAL
    }
    return url.origin.replace(/\/+$/, '')
  } catch {
    return CANONICAL
  }
}

/** Precomputed at module scope for server-side absolute links (emails, invites). */
export const SITE_URL = siteUrl()
