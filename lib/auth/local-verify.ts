import { cookies } from 'next/headers'
import { verifyAccessToken } from './verify'

/**
 * The supabase-js SSR client stores the session in cookies under names like
 * `sb-<project-ref>-auth-token`, possibly chunked (`...auth-token.0`,
 * `.1`, ...). Values are either the raw session JSON or, more commonly,
 * `base64-<base64url(session JSON)>`. The session JSON carries access_token.
 * Parsing lives here; the ES256 signature check lives in ./verify.
 */

const AUTH_TOKEN = /^sb-.+-auth-token(\.\d+)?$/
const DIRECT_TOKEN = /^sb-.+-auth-token$/
const CHUNKED_TOKEN = /^(sb-.+-auth-token)\.(\d+)$/
const BASE64_PREFIX = 'base64-'

export async function readSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const relevant = cookieStore.getAll().filter(({ name }) => AUTH_TOKEN.test(name))
  if (relevant.length === 0) return null

  let raw: string | null = null
  const direct = relevant.find(({ name }) => DIRECT_TOKEN.test(name))
  if (direct) {
    raw = direct.value
  } else {
    const groups = new Map<string, { n: number; value: string }[]>()
    for (const { name, value } of relevant) {
      const m = name.match(CHUNKED_TOKEN)
      if (!m) continue
      const base = m[1] as string
      const chunk = { n: Number(m[2]), value }
      const list = groups.get(base) ?? []
      list.push(chunk)
      groups.set(base, list)
    }
    for (const list of groups.values()) {
      list.sort((a, b) => a.n - b.n)
      raw = list.map((c) => c.value).join('')
      break
    }
  }
  if (!raw) return null

  let jsonText = raw
  if (raw.startsWith(BASE64_PREFIX)) {
    jsonText = Buffer.from(raw.slice(BASE64_PREFIX.length), 'base64url').toString('utf8')
  }
  try {
    const parsed = JSON.parse(jsonText) as { access_token?: unknown } | null
    return typeof parsed?.access_token === 'string' ? parsed.access_token : null
  } catch {
    return null
  }
}

/**
 * Local fast path for identifying the caller without an auth-server round
 * trip. Returns the user id or null. Never throws; callers fall back to
 * the networked check on null.
 */
export async function getLocalAuthUserId(): Promise<string | null> {
  try {
    const token = await readSessionTokenFromCookies()
    if (!token) return null
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}
