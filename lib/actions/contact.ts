'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactForm(data: { email: string; message: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      user_id: user?.id ?? null,
      email: data.email,
      message: data.message,
    })

  if (error) {
    throw new Error('Failed to send message. Please try again.')
  }

  return { success: true }
}
