import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction, isValidProduct } from '@/lib/paystack'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'paystack-initialize'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  let product = 'putme_pro'
  try {
    const body = await request.json()
    if (body.product) product = body.product
  } catch {}

  if (!isValidProduct(product)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  if (!user.email) {
    return NextResponse.json({ error: 'Email is required for payment. Please update your profile.' }, { status: 400 })
  }

  const idempotencyKey = request.headers.get('x-idempotency-key') ?? undefined

  try {
    const { authorizationUrl, reference } = await initializeTransaction(user.email, user.id, product, idempotencyKey)
    return NextResponse.json({ authorizationUrl, reference })
  } catch {
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
