/**
 * Server-side error logging without leaking upstream payloads.
 *
 * Third-party errors can carry endpoint URLs, push keys, user ids and query
 * details in their message or nested fields. Log only a whitelist of stable
 * identifiers and a short, sanitised message. Never interpolate a raw error
 * object into a log line.
 */

const SAFE_KEYS = ['code', 'name', 'statusCode', 'status'] as const

function safeMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null
  // Upstream messages may quote an email address, endpoint or id. Keep the
  // first short clause only, with anything after a colon dropped.
  return (value.split(':')[0] ?? '').trim().slice(0, 120) || null
}

export function safeErrorFields(error: unknown): Record<string, string | number> {
  if (!error || typeof error !== 'object') {
    return { message: safeMessage(String(error)) ?? 'unknown error' }
  }

  const e = error as Record<string, unknown>
  const out: Record<string, string | number> = {}
  for (const key of SAFE_KEYS) {
    const value = e[key]
    if (typeof value === 'string' || typeof value === 'number') out[key] = value
  }
  const message = safeMessage(typeof e.message === 'string' ? e.message : null)
  if (message && !Object.values(out).some((v) => String(v) === message)) {
    out.message = message
  }
  return Object.keys(out).length > 0 ? out : { message: 'unknown error' }
}

/** Log a redacted error. `context` must be a literal tag, never user input. */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, safeErrorFields(error))
}
