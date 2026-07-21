'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteQuestion(questionId: string) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (error) throw new Error('Failed to delete question')

  revalidatePath('/admin/questions')
}

export async function deleteQuestions(questionIds: string[]) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('questions').delete().in('id', questionIds)
  if (error) throw new Error('Failed to delete questions')

  revalidatePath('/admin/questions')
}
