import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedCron } from '@/lib/cron'
import { logError } from '@/lib/error-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily repair for business states that can be left half-written by a failed
 * partial failure or a retried third-party callback. The RPC is idempotent;
 * non-zero counts are logged so monitoring can alert on recurring breakage.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('reconcile_business_state')
  if (error) {
    logError('cron/reconcile', error)
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 })
  }

  const counts = (data ?? {}) as Record<string, number>
  const repaired = Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0)
  if (repaired > 0) {
    // A tagged, structured log line; no email, id or token is included.
    console.warn('[cron/reconcile] repaired', counts)
  }

  return NextResponse.json({ ok: true, counts })
}
