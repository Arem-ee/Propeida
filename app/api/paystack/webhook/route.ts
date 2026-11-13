import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction, isValidProduct } from '@/lib/paystack'

const DEBUG = process.env.DEBUG === 'true'

function log(...args: unknown[]) {
  if (DEBUG) console.log('[WEBHOOK]', ...args)
}

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Refund handling: expire the paid entitlement and mark the payment.
 * The learner's account, profile, and history are untouched -- they
 * fall back to Free and can pay again.
 */
async function handleRefund(
  event: { data?: { reference?: unknown } },
  supabase: AdminClient,
): Promise<Response> {
  const rawReference = event.data?.reference
  const reference = typeof rawReference === 'string' && rawReference.length > 0 ? rawReference : null
  if (!reference) {
    return new Response('Missing or invalid reference', { status: 400 })
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('user_id, product, status')
    .eq('paystack_reference', reference)
    .maybeSingle()

  if (!payment) {
    return new Response('No matching payment', { status: 200 })
  }
  if (payment.status === 'refunded') {
    return new Response('Already refunded', { status: 200 })
  }

  // Confirm with Paystack before taking access away.
  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err) {
    log('verifyTransaction failed on refund', err)
    return new Response('Transaction verification failed', { status: 502 })
  }

  if (!verification.refunded && verification.status !== 'refunded') {
    log('refund event not confirmed by Paystack', reference)
    return new Response('Not refunded', { status: 400 })
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('paystack_reference', reference)

  if (paymentError) {
    log('payments refund update failed', paymentError.message)
    return new Response('Failed to record refund', { status: 500 })
  }

  const { error: entError } = await supabase
    .from('entitlements')
    .update({ status: 'expired', expires_at: new Date().toISOString() })
    .eq('user_id', payment.user_id)
    .eq('product', payment.product)
    .eq('status', 'active')

  if (entError) {
    log('entitlement expiry failed', entError.message)
    return new Response('Failed to expire entitlement', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}

export async function POST(request: NextRequest) {
  // Reject oversized payloads before reading the body into memory. Paystack
  // charge payloads are a few KB; 64 KB is generous head-room.
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > 64 * 1024) {
    return new Response('Payload too large', { status: 413 })
  }

  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 })
  }

  let event
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.event === 'charge.refunded' || event.event === 'charge.reversed') {
    return handleRefund(event, supabase)
  }

  if (event.event !== 'charge.success') {
    return new Response('Event not handled', { status: 200 })
  }

  const rawReference = event.data.reference
  const reference = typeof rawReference === 'string' && rawReference.length > 0 ? rawReference : null
  const userId = event.data.metadata?.user_id as string | undefined
  const product = event.data.metadata?.product as string | undefined

  if (!reference) {
    return new Response('Missing or invalid reference', { status: 400 })
  }

  if (!userId) {
    return new Response('Missing user_id in metadata', { status: 400 })
  }

  if (!product || !isValidProduct(product)) {
    return new Response('Invalid or missing product in metadata', { status: 400 })
  }

  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err) {
    log('verifyTransaction failed', err)
    return new Response('Transaction verification failed', { status: 502 })
  }

  if (verification.status !== 'success') {
    return new Response('Transaction not successful', { status: 400 })
  }

  const { error: processError } = await supabase.rpc('process_payment', {
    p_user_id: userId,
    p_reference: reference,
    p_amount: Math.round(verification.amount / 100),
    p_product: product,
    p_customer_email: verification.customerEmail ?? null,
  })

  if (processError) {
    log('process_payment RPC failed', processError.message)
    return new Response('Failed to process payment', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
