import { createClient } from '@/lib/supabase/server'

export interface PeriodicTableEligibility {
  isAdmin: boolean
  hasChemistry: boolean
  /** Admins everywhere; learners who chose Chemistry everywhere this tool is offered. */
  canSee: boolean
}

/**
 * Who may reach the periodic table: admins everywhere, and learners whose
 * chosen-subject combination (profiles.subject_combinations) includes Chemistry.
 */
export async function getPeriodicTableEligibility(): Promise<PeriodicTableEligibility> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false, hasChemistry: false, canSee: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, subject_combinations')
    .eq('id', user.id)
    .single()

  const isAdmin = Boolean(profile?.is_admin)
  const chosen = Array.isArray(profile?.subject_combinations)
    ? (profile.subject_combinations as string[])
    : []
  const hasChemistry = chosen.includes('chemistry')

  return { isAdmin, hasChemistry, canSee: isAdmin || hasChemistry }
}
