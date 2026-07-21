import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction } from '@/lib/paystack'

const VALID_PRODUCTS = ['putme_pro', 'jamb_pro', 'jamb_premium_ai']

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  if (!verifyWebhookSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event !== 'charge.success') {
    return new Response('Event not handled', { status: 200 })
  }

  const reference = event.data.reference as string
  const userId = event.data.metadata?.user_id as string | undefined
  const product = event.data.metadata?.product as string | undefined

  if (!userId) {
    return new Response('Missing user_id in metadata', { status: 400 })
  }

  if (!product || !VALID_PRODUCTS.includes(product)) {
    return new Response('Invalid or missing product in metadata', { status: 400 })
  }

  const verification = await verifyTransaction(reference)
  if (verification.status !== 'success') {
    return new Response('Transaction not successful', { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: existingPayment } = await supabase
    .from('payments')
    .select('status')
    .eq('paystack_reference', reference)
    .single()

  if (existingPayment?.status === 'success') {
    return new Response('Already processed', { status: 200 })
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .upsert({
      user_id: userId,
      paystack_reference: reference,
      amount: verification.amount / 100,
      status: 'success',
      product,
      verified_at: new Date().toISOString(),
    }, { onConflict: 'paystack_reference' })

  if (paymentError) {
    return new Response('Failed to record payment', { status: 500 })
  }

  const { error: entitlementError } = await supabase
    .from('entitlements')
    .upsert({
      user_id: userId,
      product,
      status: 'active',
      granted_at: new Date().toISOString(),
      expires_at: null,
      source: 'payment',
    }, { onConflict: 'user_id, product' })

  if (entitlementError) {
    return new Response('Failed to grant entitlement', { status: 500 })
  }

  const { data: referralRecord } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referred_id', userId)
    .eq('status', 'pending')
    .maybeSingle()

  if (referralRecord) {
    await supabase.rpc('grant_referral_reward', { p_referrer_id: referralRecord.referrer_id })
    await supabase
      .from('referrals')
      .update({ status: 'verified', reward_granted_at: new Date().toISOString() })
      .eq('id', referralRecord.id)
  }

  return new Response('OK', { status: 200 })
}
