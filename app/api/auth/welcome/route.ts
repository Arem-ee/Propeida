import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { maybeSendWelcomeEmail } from '@/lib/emails/send'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'

export async function POST() {
  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'welcome'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  // Only the caller's own account may trigger its welcome email. The user id
  // comes from the session, never from the request body, so this route can
  // no longer be used to probe whether an arbitrary user id exists.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await maybeSendWelcomeEmail(user.id)
    switch (result.status) {
      case 'sent':
        return NextResponse.json({ ok: true, status: 'sent' })
      case 'already_sent':
        return NextResponse.json({ ok: true, status: 'already_sent' })
      case 'invalid_user':
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      case 'no_email':
        return NextResponse.json({ error: 'User has no email' }, { status: 400 })
      default:
        return NextResponse.json({ error: 'Welcome email could not be delivered' }, { status: 502 })
    }
  } catch (err) {
    console.error('[welcome] unexpected error:', err)
    return NextResponse.json({ error: 'Welcome email could not be delivered' }, { status: 500 })
  }
}
