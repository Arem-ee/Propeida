import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ status: 'error', error: 'Missing reference' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('status')
    .eq('paystack_reference', reference)
    .single()

  if (payment?.status === 'success') {
    return NextResponse.json({ status: 'success' })
  }

  let paystackResult
  try {
    paystackResult = await verifyTransaction(reference)
  } catch {
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'success') {
    return NextResponse.json({ status: 'pending' })
  }

  if (paystackResult.status === 'failed' || paystackResult.status === 'abandoned') {
    return NextResponse.json({
      status: 'failed',
      error: paystackResult.gatewayResponse || 'Transaction was not completed',
    })
  }

  return NextResponse.json({ status: 'pending' })
}
