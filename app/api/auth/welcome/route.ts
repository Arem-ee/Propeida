import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { maybeSendWelcomeEmail } from '@/lib/emails/send'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'welcome'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  let userId: string | undefined
  try {
    const body = await request.json()
    if (typeof body.userId === 'string' && body.userId.length > 0) {
      userId = body.userId
    }
  } catch {}

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    const result = await maybeSendWelcomeEmail(userId)
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