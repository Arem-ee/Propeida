import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Account deletion. Removes the auth user; every user-owned row cascades
 * (profiles, sessions, answers, attempts, mastery, queue, streaks).
 * Payment rows cascade too — the privacy policy states exactly this.
 */
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete account' }, { status: 500 })
  }
}
