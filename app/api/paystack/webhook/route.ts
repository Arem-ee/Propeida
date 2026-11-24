import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction, isValidProduct, isPlausiblePayment } from '@/lib/paystack'
import { reportError } from '@/lib/error-report'

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
    // The RPC repairs a partial refund if the entitlement was not expired.
    const { error: repairError } = await supabase.rpc('process_refund', { p_reference: reference })
    if (repairError) {
      await reportError('paystack/refund-repair', repairError, reference)
      return new Response('Failed to record refund', { status: 500 })
    }
    return new Response('Already refunded', { status: 200 })
  }

  // Confirm with Paystack before taking access away.
  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err) {
    await reportError('paystack/verify-refund', err, reference)
    return new Response('Transaction verification failed', { status: 502 })
  }

  if (!verification.refunded && verification.status !== 'refunded') {
    log('refund event not confirmed by Paystack', reference)
    return new Response('Not refunded', { status: 400 })
  }

  // Both writes happen in one transaction inside the RPC, so a failure
  // cannot leave a refunded payment with a still-active entitlement.
  const { error: refundError } = await supabase.rpc('process_refund', { p_reference: reference })
  if (refundError) {
    await reportError('paystack/process-refund', refundError, reference)
    return new Response('Failed to record refund', { status: 500 })
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
    await reportError('paystack/verify', err, reference)
    return new Response('Transaction verification failed', { status: 502 })
  }

  if (verification.status !== 'success') {
    return new Response('Transaction not successful', { status: 400 })
  }

  if (!isPlausiblePayment(product, verification.amount, verification.currency)) {
    log('amount/currency mismatch for product', product)
    return new Response('Payment amount does not match this product', { status: 400 })
  }

  // Paystack retries webhooks and signed requests can be replayed. A payment
  // already recorded as successful must not re-arm a fresh subscription term.
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('status')
    .eq('paystack_reference', reference)
    .maybeSingle()

  if (existingPayment?.status === 'success') {
    log('duplicate charge.success for', reference)
    return new Response('OK', { status: 200 })
  }

  const { error: processError } = await supabase.rpc('process_payment', {
    p_user_id: userId,
    p_reference: reference,
    p_amount: Math.round(verification.amount / 100),
    p_product: product,
    p_customer_email: verification.customerEmail ?? null,
  })

  if (processError) {
    await reportError('paystack/process-payment', processError, reference)
    return new Response('Failed to process payment', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
