import { NextResponse } from 'next/server'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EXPLORE_INTEREST_LABELS } from '@/lib/explore/feed-types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { interests?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const allowed = new Set<string>(EXPLORE_INTEREST_LABELS)
  const interests = Array.isArray(body.interests)
    ? [...new Set(body.interests.filter((x): x is string => typeof x === 'string' && allowed.has(x)))].slice(
        0,
        EXPLORE_INTEREST_LABELS.length
      )
    : []

  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ ok: false, requiresAuth: true }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ explore_interests: interests })
    .eq('id', user.id)

  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true, interests })
}