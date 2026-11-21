import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Tells the signup form whether an account already exists for an address.
 * Supabase deliberately returns a success-shaped response for duplicate
 * signups without sending a confirmation email, so the form cannot detect
 * this on its own. Throttled per IP to keep account enumeration impractical.
 */
export async function POST(request: NextRequest) {
  let email = ''
  try {
    const body = await request.json()
    if (typeof body?.email === 'string') email = body.email.trim().toLowerCase()
  } catch {}

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ exists: false })
  }

  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'check-email'), 12, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    // GoTrue's `filter` searches by email; `email` is not a supported query
    // param and silently returns an unrelated user, so use `filter` and verify
    // the match ourselves.
    const res = await fetch(
      `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return NextResponse.json({ exists: false })

    const body = await res.json()
    const users = Array.isArray(body.users) ? body.users : []
    const exists = users.some(
      (u: { email?: string }) => (u.email ?? '').toLowerCase() === email
    )
    return NextResponse.json({ exists })
  } catch {
    // A lookup failure must never block signup; Supabase still enforces
    // uniqueness server side.
    return NextResponse.json({ exists: false })
  }
}
