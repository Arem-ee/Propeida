import { Resend } from 'resend'
import { getWelcomeEmail } from './welcome'
import { createAdminClient } from '../supabase/admin'

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
    const res = await resend.emails.send({
      from: mailFrom,
      to: email.toLowerCase(),
      replyTo: 'propeida.help@gmail.com',
      subject: message.subject,
      text: message.text,
      html: message.html,
    })

    if (res.error) {
      return {
        ok: false,
        message: `Resend error ${res.error.statusCode ?? ''} ${res.error.name ?? ''}: ${res.error.message}`,
      }
    }

    return { ok: true, message: res.data?.id ?? 'sent' }
  } catch (err) {
    return {
      ok: false,
      message: `Exception while sending welcome email: ${err instanceof Error ? err.message : String(err)}`,
    }
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
    console.error(`[welcome] user lookup failed for ${userId}:`, error?.message ?? 'not found')
    return { status: 'invalid_user' }
  }

  const user = au.user
  const email = user.email
  if (!email) {
    console.warn(`[welcome] user ${userId} has no email`)
    return { status: 'no_email' }
  }

  if (hasWelcomeEmailBeenSent(user.user_metadata)) {
    return { status: 'already_sent' }
  }

  const result = await sendWelcomeEmail(email)
  if (!result.ok) {
    console.error(`[welcome] send failed for ${email}:`, result.message)
    return { status: 'send_failed', message: result.message ?? 'send failed' }
  }

  const mark = {
    ...(user.user_metadata ?? {}),
    [WELCOME_SENT_META]: new Date().toISOString(),
  }
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { user_metadata: mark })
  if (updateError) {
    console.error(`[welcome] failed to mark sent for ${email}:`, updateError.message)
  }

  return { status: 'sent', message: result.message ?? 'sent' }
}