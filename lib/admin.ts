import { NextResponse } from 'next/server'
import { logError } from './error-log'
import { createClient } from './supabase/server'

/** Distinguishes an auth failure from a real operation failure in admin routes. */
export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminAuthError'
  }
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AdminAuthError('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new AdminAuthError('Forbidden')
  return { supabase, user }
}

/**
 * Map a thrown error from an admin route to the right HTTP status.
 * Only AdminAuthError is 401; database or parsing failures are 500 with a
 * generic message and a redacted server-side log.
 */
export function adminErrorResponse(error: unknown): NextResponse {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  logError('admin/route', error)
  return NextResponse.json({ error: 'Could not complete this request' }, { status: 500 })
}
