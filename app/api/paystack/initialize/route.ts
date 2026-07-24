import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  console.log('[INITIALIZE] Payment initialization request received')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('[INITIALIZE] No authenticated user')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  console.log(`[INITIALIZE] User authenticated: ${user.email} (${user.id})`)

  let product = 'putme_pro'
  try {
    const body = await request.json()
    if (body.product) product = body.product
  } catch {}

  try {
    const { authorizationUrl, reference } = await initializeTransaction(user.email!, user.id, product)
    console.log(`[INITIALIZE] Product=${product}, Reference=${reference}, URL=${authorizationUrl}`)
    return NextResponse.json({ authorizationUrl, reference })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment initialization failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
