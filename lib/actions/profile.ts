'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AVATAR_COUNT } from '@/lib/avatars'

export async function updateAvatarIndex(avatarIndex: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const idx = Math.max(0, Math.min(avatarIndex, AVATAR_COUNT - 1))

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_index: idx })
    .eq('id', user.id)

  if (error) throw new Error('Failed to update avatar')

  revalidatePath('/account')
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  revalidatePath('/leaderboard')
}


