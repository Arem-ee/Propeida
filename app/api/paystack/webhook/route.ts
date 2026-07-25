import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction, isValidProduct } from '@/lib/paystack'

const DEBUG = process.env.DEBUG === 'true'

function log(...args: unknown[]) {
  if (DEBUG) console.log('[WEBHOOK]', ...args)
}

export async function POST(request: NextRequest) {
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

  const supabase = createAdminClient()

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
