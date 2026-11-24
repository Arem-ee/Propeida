import 'server-only'
import { logError, safeErrorFields } from '@/lib/error-log'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/emails/send'

const ALERT_TO = process.env.ERROR_ALERT_EMAIL ?? 'propeida.help@gmail.com'
const ALERT_WINDOW_MS = 5 * 60 * 1000

/**
 * Report a caught failure without a new SDK or a paid monitoring service.
 *
 * Every failure is logged in redacted form. One alert email per scope per five
 * minutes reaches the operator through the existing Resend account. The
 * throttle is deliberately per scope, not per error, so a failing job cannot
 * flood the inbox. Nothing here includes the raw error object in the email.
 */
export async function reportError(
  scope: string,
  error: unknown,
  detail?: string,
): Promise<void> {
  const fields = safeErrorFields(error)
  logError(scope, error)

  if (!process.env.RESEND_API_KEY) return

  const safeScope = scope.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 50) || 'unknown'
  const { allowed } = await checkRateLimit(rateLimitKey(safeScope, 'error-alert'), 1, ALERT_WINDOW_MS)
  if (!allowed) return

  const lines = [
    `Scope: ${safeScope}`,
    `When: ${new Date().toISOString()}`,
    ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`),
  ]
  if (detail) lines.push(`Context: ${detail.replace(/[\r\n]+/g, ' ').slice(0, 160)}`)

  try {
    await sendEmail({
      to: ALERT_TO,
      subject: `[Propeida] Error in ${safeScope}`,
      text: lines.join('\n'),
      html: `<pre style="font-family:monospace;font-size:13px">${lines
        .map((line) => line.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] ?? c))
        .join('\n')}</pre>`,
    })
  } catch {
    // Alerting is best-effort; the redacted log above is the durable record.
  }
}
