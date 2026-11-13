/**
 * Guards against open redirects on internal `redirect` query parameters.
 *
 * The naive check `startsWith('/') && !startsWith('//')` is bypassable:
 * WHATWG URL parsing treats a backslash as a path separator, so
 * `/\evil.com` resolves to `//evil.com` cross-origin. Control characters are
 * rejected for the same reason. The only safe value is a path that stays on
 * this origin: leading slash, no second slash/backslash at the start, no
 * backslashes or control characters anywhere.
 */
export function safeInternalPath(
  target: string | null | undefined,
  fallback = '/home',
): string {
  if (!target) return fallback
  if (!target.startsWith('/')) return fallback
  if (target.startsWith('//') || target.startsWith('/\\')) return fallback
  if (/[\\\x00-\x1f\x7f]/.test(target)) return fallback
  return target
}
