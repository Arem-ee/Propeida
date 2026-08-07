import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTransaction, SUPPORT_PRODUCT } from '@/lib/paystack'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ status: 'error', error: 'Missing reference' }, { status: 400 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'paystack-support-verify'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ status: 'pending' })
  }

  const supabase = createAdminClient()

  const { data: contribution } = await supabase
    .from('support_contributions')
    .select('status')
    .eq('reference', reference)
    .maybeSingle()

  if (contribution && contribution.status === 'success') {
    return NextResponse.json({ status: 'success' })
  }

  let paystackResult
  try {
    paystackResult = await verifyTransaction(reference)
  } catch {
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'success') {
    if (paystackResult.product && paystackResult.product !== SUPPORT_PRODUCT) {
      return NextResponse.json({ status: 'error', error: 'Invalid payment reference' }, { status: 400 })
    }

    const { error } = await supabase.from('support_contributions').upsert(
      {
        reference,
        user_id: paystackResult.userId ?? null,
        email: paystackResult.customerEmail ?? '',
        amount: Math.floor(paystackResult.amount / 100),
        status: 'success',
      },
      { onConflict: 'reference' }
    )
    if (error) {
      return NextResponse.json({ status: 'error', error: 'Failed to record contribution' }, { status: 502 })
    }

    return NextResponse.json({ status: 'success' })
  }

  if (paystackResult.status === 'failed' || paystackResult.status === 'abandoned') {
    await supabase.from('support_contributions').upsert(
      {
        reference,
        email: paystackResult.customerEmail ?? '',
        amount: Math.floor(paystackResult.amount / 100),
        status: paystackResult.status,
      },
      { onConflict: 'reference' }
    )
    return NextResponse.json({ status: 'failed', error: 'Contribution was not completed' })
  }

  return NextResponse.json({ status: 'pending' })
}