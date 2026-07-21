'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AVATAR_COUNT } from '@/lib/avatars'
import { deterministicAvatarIndex } from '@/lib/avatars'

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

export async function getProfileAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('username, avatar_index')
    .eq('id', user.id)
    .single()

  if (!data) return null

  return {
    username: data.username,
    avatarIndex: data.avatar_index ?? deterministicAvatarIndex(data.username, AVATAR_COUNT),
  }
}
