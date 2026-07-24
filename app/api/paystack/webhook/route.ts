import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, verifyTransaction } from '@/lib/paystack'

const VALID_PRODUCTS = ['putme_pro', 'jamb_pro', 'jamb_premium_ai']

export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK RECEIVED ===')
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  console.log(`  Signature header present: ${signature ? 'yes' : 'no'}`)
  if (!verifyWebhookSignature(body, signature)) {
    console.log('  SIGNATURE VERIFICATION FAILED')
    return new Response('Invalid signature', { status: 401 })
  }
  console.log('  SIGNATURE VERIFICATION PASSED')

  const event = JSON.parse(body)
  console.log(`  Event type: ${event.event}`)

  if (event.event !== 'charge.success') {
    console.log(`  Event not handled (not charge.success)`)
    return new Response('Event not handled', { status: 200 })
  }

  const reference = event.data.reference as string
  const userId = event.data.metadata?.user_id as string | undefined
  const product = event.data.metadata?.product as string | undefined
  console.log(`  Reference: ${reference}`)
  console.log(`  User ID: ${userId}`)
  console.log(`  Product: ${product}`)

  if (!userId) {
    console.log('  MISSING user_id in metadata')
    return new Response('Missing user_id in metadata', { status: 400 })
  }

  if (!product || !VALID_PRODUCTS.includes(product)) {
    console.log(`  INVALID product: ${product}`)
    return new Response('Invalid or missing product in metadata', { status: 400 })
  }

  console.log('  Calling verifyTransaction with Paystack...')
  const verification = await verifyTransaction(reference)
  console.log(`  Paystack verify result: status=${verification.status}, amount=${verification.amount}, paidAt=${verification.paidAt}`)
  if (verification.status !== 'success') {
    console.log(`  TRANSACTION NOT SUCCESSFUL (status=${verification.status})`)
    return new Response('Transaction not successful', { status: 400 })
  }
  console.log('  Paystack verification PASSED')

  const supabase = createAdminClient()

  console.log('  Checking for existing payment...')
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('status')
    .eq('paystack_reference', reference)
    .single()

  if (existingPayment?.status === 'success') {
    console.log('  Payment already processed — skipping')
    return new Response('Already processed', { status: 200 })
  }
  console.log('  No existing payment found — proceeding to upsert')

  console.log('  Upserting payment record...')
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
    console.log(`  PAYMENT UPSERT FAILED: ${paymentError.message}`)
    return new Response('Failed to record payment', { status: 500 })
  }
  console.log('  Payment upserted OK')

  console.log('  Upserting entitlement record...')
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
    console.log(`  ENTITLEMENT UPSERT FAILED: ${entitlementError.message}`)
    return new Response('Failed to grant entitlement', { status: 500 })
  }
  console.log('  Entitlement upserted OK')

  console.log('  Checking referrals...')
  const { data: referralRecord } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referred_id', userId)
    .eq('status', 'pending')
    .maybeSingle()

  if (referralRecord) {
    console.log(`  Found pending referral from ${referralRecord.referrer_id} — granting reward`)
    await supabase.rpc('grant_referral_reward', { p_referrer_id: referralRecord.referrer_id })
    await supabase
      .from('referrals')
      .update({ status: 'verified', reward_granted_at: new Date().toISOString() })
      .eq('id', referralRecord.id)
    console.log('  Referral reward granted')
  } else {
    console.log('  No pending referral found')
  }

  console.log('=== WEBHOOK PROCESSED SUCCESSFULLY ===')
  return new Response('OK', { status: 200 })
}
