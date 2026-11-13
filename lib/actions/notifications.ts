'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getAuthUser } from '@/lib/supabase/server'

/**
 * Cohort updates cover both the anonymous ghost nudge and the weekly email.
 * One switch, off by default only when the learner chooses it — presence is
 * never a requirement to use the product.
 */
export async function setCohortUpdatesEnabled(enabled: boolean) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Please sign in again.')

  const { error } = await supabase
    .from('profiles')
    .update({ notifications_enabled: enabled })
    .eq('id', user.id)

  if (error) throw new Error('Could not save that change.')

  revalidatePath('/account/settings')
}
