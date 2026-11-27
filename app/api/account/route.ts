import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'
import { originAllowed, originDenied } from '@/lib/origin-check'

/**
 * Account deletion. Removes the auth user; every user-owned row cascades
 * (profiles, sessions, answers, attempts, mastery, queue, streaks).
 * Payment rows cascade too — the privacy policy states exactly this.
 */
export async function DELETE() {
  if (!(await originAllowed())) return originDenied()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Destructive and unrecoverable: throttle it like any other mutation.
  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'account-delete'), 5, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a moment' }, { status: 429 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
    // The account no longer exists, so the session cookie points at a
    // deleted user. Middleware will bounce every subsequent request to
    // /login; no client-side sign-out call is needed here, and calling it
    // would ask Next to mutate cookies in a context that does not allow it.
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete account' }, { status: 500 })
  }
}
