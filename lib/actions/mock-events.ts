'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMockDefaults } from '@/lib/practice'
import { createSession } from '@/lib/actions/practice'
import { hasExamAccess } from '@/lib/entitlements'

export interface StartMockEventResult {
  ok: boolean
  sessionId?: string
  error?: string
  errorCode?: 'unauthenticated' | 'not_pro' | 'closed' | 'not_started' | 'already_done' | 'error'
}

/**
 * Start a mock event session. Pro-only. The event seeds the paper so every
 * participant sees the same questions; the window constraint is the whole
 * contract. Preparation: Pro users get a session with mode 'mock', an empty
 * subject set (createSession derives the exam's full shape), and the event id
 * on the session row.
 */
export async function startMockEventSession(eventId: string): Promise<StartMockEventResult> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return { ok: false, error: 'Please sign in again.', errorCode: 'unauthenticated' }

  const admin = createAdminClient()
  const { data: event, error: evError } = await admin
    .from('mock_events')
    .select('id, name, slug, exam_id, starts_at, ends_at, topic_ids, question_count')
    .eq('id', eventId)
    .single()
  if (evError || !event) return { ok: false, error: 'That mock event is not available.', errorCode: 'error' }

  const now = Date.now()
  if (now < new Date(event.starts_at).getTime()) {
    return { ok: false, error: 'This mock event has not started yet.', errorCode: 'not_started' }
  }
  if (now >= new Date(event.ends_at).getTime()) {
    return { ok: false, error: 'This mock event has ended.', errorCode: 'closed' }
  }

  const { data: exam } = await admin
    .from('exams')
    .select('slug')
    .eq('id', event.exam_id)
    .maybeSingle()
  const examSlug = exam?.slug ?? 'jamb'

  const hasAccess = await hasExamAccess(user.id, event.exam_id)
  if (!hasAccess) {
    return { ok: false, error: 'Pro is required to sit this mock event.', errorCode: 'not_pro' }
  }

  const { data: done } = await admin
    .from('exam_sessions')
    .select('id')
    .eq('mock_event_id', eventId)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .limit(1)
  if (done && done.length > 0) {
    return { ok: false, error: 'You have already sat this mock event.', errorCode: 'already_done' }
  }

  const defaults = await getMockDefaults(examSlug)
  const questionCount = defaults?.question_count ?? 180
  const eventQuestionCount = event.question_count ?? questionCount
  const focusTopics = Array.isArray(event.topic_ids) && event.topic_ids.length > 0 ? (event.topic_ids as string[]) : undefined

  try {
    const result = await createSession({
      examId: event.exam_id,
      examSlug,
      subjectIds: [],
      questionCount: eventQuestionCount,
      difficulty: null,
      mode: 'mock',
      mockEventId: event.id,
      topicIds: focusTopics,
      questionCountOverride: eventQuestionCount,
    })
    return { ok: true, sessionId: result.sessionId }
  } catch (err) {
    // The unique (mock_event_id, user_id) index is the real arbiter when two
    // starts race past the app-level check above.
    const code = (err as { code?: string } | null)?.code
    if (code === '23505') {
      return { ok: false, error: 'You have already sat this mock event.', errorCode: 'already_done' }
    }
    const message = err instanceof Error ? err.message : 'Could not start the mock event'
    return { ok: false, error: message, errorCode: 'error' }
  }
}
