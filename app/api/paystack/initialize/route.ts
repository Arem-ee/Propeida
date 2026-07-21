import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let product = 'putme_pro'
  try {
    const body = await request.json()
    if (body.product) product = body.product
  } catch {}

  try {
    const { authorizationUrl, reference } = await initializeTransaction(user.email!, user.id, product)
    return NextResponse.json({ authorizationUrl, reference })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment initialization failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
