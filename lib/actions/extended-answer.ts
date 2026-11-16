'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

/**
 * Record a text/derivation answer for a non-MCQ mock/practice item.
 * MCQ answers keep going through submitAnswer (a-e only, as before).
 * This server action is inert until the 20261116000004 migration is
 * applied - the RPC it calls does not exist yet - and exams serve
 * non-MCQ items only when they opt in per configuration.
 */
export async function recordExtendedAnswer(
  sessionId: string,
  questionId: string,
  textAnswer: string,
) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase.rpc('record_session_extended_answer', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_text_answer: textAnswer,
  })
  if (error) throw new Error('Could not save that. Try again in a moment.')

  return { ok: true }
}
