import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidProduct, verifyTransaction } from '@/lib/paystack'
import { checkRateLimit, rateLimitKey } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ status: 'error', error: 'Missing reference' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ status: 'error', error: 'Not authenticated' }, { status: 401 })
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const { allowed } = checkRateLimit(rateLimitKey(ip, 'paystack-verify'), 10, 60000)
  if (!allowed) {
    return NextResponse.json({ status: 'pending' })
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('status, user_id')
    .eq('paystack_reference', reference)
    .maybeSingle()

  if (payment) {
    if (payment.user_id !== user.id) {
      return NextResponse.json({ status: 'error', error: 'Forbidden' }, { status: 403 })
    }
    if (payment.status === 'success') {
      return NextResponse.json({ status: 'success' })
    }
  }

  let paystackResult
  try {
    paystackResult = await verifyTransaction(reference)
  } catch {
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'success' && paystackResult.userId) {
    if (paystackResult.userId !== user.id) {
      return NextResponse.json({ status: 'error', error: 'Forbidden' }, { status: 403 })
    }

    const product = paystackResult.product
    if (!product || !isValidProduct(product)) {
      return NextResponse.json({ status: 'error', error: 'Invalid payment product' }, { status: 400 })
    }

    // Keep reconciliation and webhook fulfillment on the same atomic, privileged path.
    const { error: processError } = await createAdminClient().rpc('process_payment', {
      p_user_id: user.id,
      p_reference: reference,
      p_amount: Math.round(paystackResult.amount / 100),
      p_product: product,
      p_customer_email: paystackResult.customerEmail ?? null,
    })
    if (processError) {
      return NextResponse.json({ status: 'error', error: 'Payment processing failed' }, { status: 502 })
    }

    return NextResponse.json({ status: 'success' })
  }

  if (paystackResult.status === 'failed' || paystackResult.status === 'abandoned') {
    return NextResponse.json({
      status: 'failed',
      error: paystackResult.gatewayResponse || 'Transaction was not completed',
    })
  }

  return NextResponse.json({ status: 'pending' })
}
