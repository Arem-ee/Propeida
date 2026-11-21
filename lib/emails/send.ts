import { Resend } from 'resend'
import { getWelcomeEmail } from './welcome'
import { createAdminClient } from '../supabase/admin'
import { withTimeout } from '@/lib/timeout'
import { logError } from '@/lib/error-log'

// Resend exposes no per-request signal, so bound sends at the caller.
const SEND_TIMEOUT_MS = 10000

export const WELCOME_SENT_META = 'welcome_email_sent_at'

export function getWelcomeSentMetaKey() {
  return WELCOME_SENT_META
}

export function hasWelcomeEmailBeenSent(metadata: Record<string, unknown> | null | undefined): boolean {
  return !!metadata?.[WELCOME_SENT_META]
}

function parseMailFrom(from: string): string | undefined {
  const match = /<([^>]+)>/.exec(from)
  if (match) return match[1]
  return /^[^\s@]+@[^\s@]+$/.test(from) ? from : undefined
}

export async function sendWelcomeEmail(email: string, _name?: string): Promise<{ ok: boolean; message?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const mailFrom = process.env.EMAIL_FROM

  if (!apiKey) {
    return { ok: false, message: 'RESEND_API_KEY is not configured' }
  }
  if (!mailFrom || !parseMailFrom(mailFrom)) {
    return { ok: false, message: `EMAIL_FROM is not a valid sender: "${mailFrom}"` }
  }

  const message = getWelcomeEmail()
  const resend = new Resend(apiKey)

  try {
    const res = await withTimeout(
      resend.emails.send({
        from: mailFrom,
        to: email.toLowerCase(),
        replyTo: 'propeida.help@gmail.com',
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
      SEND_TIMEOUT_MS,
      'Resend send',
    )

    if (res.error) {
      logError('email/resend', res.error)
      return { ok: false, message: `Resend error ${res.error.statusCode ?? ''} ${res.error.name ?? ''}` }
    }

    return { ok: true, message: res.data?.id ?? 'sent' }
  } catch (err) {
    logError('email/welcome', err)
    return { ok: false, message: 'Exception while sending email' }
  }
}

/**
 * Generic transactional sender for cron/report mail. Kept separate from the
 * welcome flow so the one-time guard and copy stay untouched.
 */
export async function sendEmail(input: {
  to: string
  subject: string
  text: string
  html: string
}): Promise<{ ok: boolean; message?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const mailFrom = process.env.EMAIL_FROM

  if (!apiKey) return { ok: false, message: 'RESEND_API_KEY is not configured' }
  if (!mailFrom || !parseMailFrom(mailFrom)) {
    return { ok: false, message: `EMAIL_FROM is not a valid sender: "${mailFrom}"` }
  }

  const resend = new Resend(apiKey)
  try {
    const res = await withTimeout(
      resend.emails.send({
        from: mailFrom,
        to: input.to.toLowerCase(),
        replyTo: 'propeida.help@gmail.com',
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
      SEND_TIMEOUT_MS,
      'Resend send',
    )
    if (res.error) {
      logError('email/resend', res.error)
      return { ok: false, message: `Resend error ${res.error.statusCode ?? ''} ${res.error.name ?? ''}` }
    }
    return { ok: true, message: res.data?.id ?? 'sent' }
  } catch (err) {
    logError('email/send', err)
    return { ok: false, message: 'Exception while sending email' }
  }
}

export type WelcomeEmailResult =
  | { status: 'sent'; message: string }
  | { status: 'already_sent' }
  | { status: 'invalid_user' | 'no_email' | 'skipped_config' }
  | { status: 'send_failed'; message: string }

/**
 * Sends (or skips) the welcome email for a given user id exactly once.
 * Safe to call from any trigger point — login, OAuth callback, and signup —
 * because it is guarded by a per-user marker stored in auth user metadata.
 */
export async function maybeSendWelcomeEmail(userId: string): Promise<WelcomeEmailResult> {
  const supabase = createAdminClient()

  const { data: au, error } = await supabase.auth.admin.getUserById(userId)
  if (error || !au?.user) {
    // Never log the id or email — they are PII. The error code is enough.
    logError('welcome/user-lookup', error ?? 'not found')
    return { status: 'invalid_user' }
  }

  const user = au.user
  const email = user.email
  if (!email) {
    console.warn('[welcome] target user has no email')
    return { status: 'no_email' }
  }

  if (hasWelcomeEmailBeenSent(user.user_metadata)) {
    return { status: 'already_sent' }
  }

  const result = await sendWelcomeEmail(email)
  if (!result.ok) {
    console.error('[welcome] send failed:', result.message)
    return { status: 'send_failed', message: result.message ?? 'send failed' }
  }

  const mark = {
    ...(user.user_metadata ?? {}),
    [WELCOME_SENT_META]: new Date().toISOString(),
  }
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { user_metadata: mark })
  if (updateError) {
    logError('welcome/mark-sent', updateError)
  }

  return { status: 'sent', message: result.message ?? 'sent' }
}