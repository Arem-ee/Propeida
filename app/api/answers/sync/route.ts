import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLocalAuthUserId } from '@/lib/auth/local-verify'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'

/**
 * Batch answer sync for in-memory selections (mock exams). The player marks
 * taps dirty; this route flushes them at navigation boundaries, pagehide and
 * before submit. record_session_answer re-enforces ownership in plpgsql, so
 * no caller can write to a session they do not own; invalid questions are
 * reported per item, not as a batch failure.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const OPTION_RE = /^[a-e]$/
const MAX_ANSWERS = 50

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'answers-sync'), 30, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = body as {
    sessionId?: unknown
    answers?: unknown
  } | null
  const sessionId = typeof parsed?.sessionId === 'string' ? parsed.sessionId : null
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 })
  }
  const rawAnswers = Array.isArray(parsed?.answers) ? parsed.answers : []
  if (rawAnswers.length === 0 || rawAnswers.length > MAX_ANSWERS) {
    return NextResponse.json({ error: `Expected 1-${MAX_ANSWERS} answers` }, { status: 400 })
  }

  const answers: { questionId: string; selectedAnswer: string }[] = []
  for (const raw of rawAnswers) {
    const a = raw as { questionId?: unknown; selectedAnswer?: unknown } | null
    if (typeof a?.questionId !== 'string' || !UUID_RE.test(a.questionId)) {
      return NextResponse.json({ error: 'Invalid questionId in answers' }, { status: 400 })
    }
    if (typeof a?.selectedAnswer !== 'string' || !OPTION_RE.test(a.selectedAnswer)) {
      return NextResponse.json({ error: 'Invalid selectedAnswer in answers' }, { status: 400 })
    }
    answers.push({ questionId: a.questionId, selectedAnswer: a.selectedAnswer })
  }

  const authed = await getLocalAuthUserId()
  if (!authed) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = await createClient()
  const results: { questionId: string; ok: boolean }[] = []
  for (const answer of answers) {
    const { error } = await supabase.rpc('record_session_answer', {
      p_session_id: sessionId,
      p_question_id: answer.questionId,
      p_selected_answer: answer.selectedAnswer,
    })
    results.push({ questionId: answer.questionId, ok: !error })
  }

  return NextResponse.json({ ok: true, results })
}
