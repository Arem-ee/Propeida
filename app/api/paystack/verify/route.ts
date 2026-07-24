import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ status: 'error', error: 'Missing reference' }, { status: 400 })
  }

  console.log(`[VERIFY] Checking reference: ${reference}`)

  const supabase = await createClient()

  console.log(`[VERIFY] Querying payments table...`)
  const { data: payment } = await supabase
    .from('payments')
    .select('status')
    .eq('paystack_reference', reference)
    .single()

  if (payment?.status === 'success') {
    console.log(`[VERIFY] Found in payments table: status=${payment.status} → returning success`)
    return NextResponse.json({ status: 'success' })
  }

  console.log(`[VERIFY] Not in payments table, falling back to Paystack verify...`)
  let paystackResult
  try {
    paystackResult = await verifyTransaction(reference)
    console.log(`[VERIFY] Paystack result: status=${paystackResult.status}`)
  } catch (e) {
    console.log(`[VERIFY] Paystack verify threw: ${e}`)
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'success') {
    console.log(`[VERIFY] Paystack says success → webhook still pending, returning pending`)
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'failed' || paystackResult.status === 'abandoned') {
    console.log(`[VERIFY] Paystack says ${paystackResult.status} → returning failed`)
    return NextResponse.json({
      status: 'failed',
      error: paystackResult.gatewayResponse || 'Transaction was not completed',
    })
  }

  console.log(`[VERIFY] Paystack says ${paystackResult?.status} → returning pending`)
  return NextResponse.json({ status: 'pending' })
}
