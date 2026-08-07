import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { initializeSupportTransaction, SUPPORT_MIN_AMOUNT, SUPPORT_MAX_AMOUNT } from '@/lib/paystack'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'paystack-support-initialize'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  let amountKobo: number | null = null
  let email = user?.email ?? ''
  try {
    const body = await request.json()
    if (typeof body.amount === 'number') amountKobo = Math.round(body.amount)
    if (typeof body.email === 'string' && body.email.trim()) email = body.email.trim().toLowerCase()
  } catch {}

  if (!amountKobo || amountKobo < SUPPORT_MIN_AMOUNT || amountKobo > SUPPORT_MAX_AMOUNT) {
    return NextResponse.json(
      { error: `Contribution must be between ₦${SUPPORT_MIN_AMOUNT} and ₦${Math.floor(SUPPORT_MAX_AMOUNT / 100)}` },
      { status: 400 }
    )
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required to contribute.' }, { status: 400 })
  }

  const idempotencyKey = request.headers.get('x-idempotency-key') ?? undefined

  try {
    const { authorizationUrl, reference } = await initializeSupportTransaction(
      email,
      amountKobo,
      user?.id ?? null,
      idempotencyKey
    )
    return NextResponse.json({ authorizationUrl, reference, amountInNaira: Math.floor(amountKobo / 100) })
  } catch {
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}