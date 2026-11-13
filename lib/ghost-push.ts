import { createAdminClient } from './supabase/admin'
import { sendPushNotification } from './web-push'
import { claimOnce } from './redis'
import { getExamScope } from './exam-scope'

const MAX_CANDIDATES = 5
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ACTIVE_WINDOW_DAYS = 7

/**
 * Ghost nudge: when a learner secures a subject, one recently-active peer in
 * the same exam path gets a single push. Deliberately anonymous — "someone
 * in your cohort" — because §13 forbids publishing an individual's activity
 * without explicit consent, and naming a classmate turns a nudge into a rank.
 *
 * Path-matching goes through the shared exam scope, not the raw
 * `exam_target` column, so learners whose profile predates that field still
 * land in the right cohort instead of silently falling out of every cohort.
 *
 * Best-effort and capped: one nudge per recipient per day, at most five
 * candidate lookups, and failures never touch the write that triggered it.
 */
export async function sendCohortGhostPush(actorId: string, subjectId: string): Promise<void> {
  try {
    const admin = createAdminClient()

    const scope = await getExamScope(admin, actorId)
    if (!scope.primaryExamId || !scope.examIds || scope.examIds.length === 0) return

    const since = new Date(Date.now() - ACTIVE_WINDOW_DAYS * ONE_DAY_MS).toISOString()
    const { data: active } = await admin
      .from('exam_sessions')
      .select('user_id')
      .gte('started_at', since)
      .in('exam_id', scope.examIds)
      .neq('user_id', actorId)
      .limit(200)

    const activeIds = [...new Set((active ?? []).map((row) => row.user_id as string))]
    if (activeIds.length === 0) return

    const { data: peers } = await admin
      .from('profiles')
      .select('id')
      .in('id', activeIds)
      .eq('notifications_enabled', true)
      .limit(MAX_CANDIDATES)
    if (!peers || peers.length === 0) return

    const { data: subject } = await admin
      .from('subjects')
      .select('name')
      .eq('id', subjectId)
      .maybeSingle()
    const subjectName = subject?.name ?? 'a subject'

    const day = new Date().toISOString().slice(0, 10)

    for (const peer of peers) {
      const peerId = peer.id as string

      const { data: subscriptions } = await admin
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', peerId)
        .limit(1)
      const subscription = subscriptions?.[0]
      if (!subscription) continue

      // Claim the day only once a deliverable subscription exists, so an
      // unreachable peer does not burn the slot.
      if (!(await claimOnce(`ghost:${peerId}:${day}`, ONE_DAY_MS))) continue

      const result = await sendPushNotification(
        {
          endpoint: subscription.endpoint as string,
          keys: { p256dh: subscription.p256dh as string, auth: subscription.auth as string },
        },
        {
          title: 'Your cohort is moving',
          body: `Someone in your cohort just secured ${subjectName}. Ten minutes keeps you level.`,
          url: '/home',
        },
      )

      if (typeof result === 'object' && 'expired' in result) {
        await admin
          .from('push_subscriptions')
          .delete()
          .eq('user_id', peerId)
          .eq('endpoint', subscription.endpoint as string)
      }

      return
    }
  } catch (err) {
    console.error('[ghost-push] failed:', err)
  }
}
