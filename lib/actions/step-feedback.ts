'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

export type StepFeedbackRating = 'helped' | 'didnt_help'

export async function recordStepFeedback(questionId: string, rating: StepFeedbackRating) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase.rpc('record_question_step_feedback', {
    p_question_id: questionId,
    p_rating: rating,
  })
  if (error) throw new Error('Could not save that. Try again in a moment.')

  return { ok: true }
}
