'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimReferral(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by, referral_code')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.referred_by) throw new Error('Already referred by someone')

  if (profile.referral_code === code) {
    throw new Error('Cannot use your own referral code')
  }

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('referral_code', code)
    .single()

  if (!referrer) throw new Error('Invalid referral code')

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', user.id)

  if (updateError) throw new Error('Failed to apply referral')

  await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      status: 'pending',
    })

  revalidatePath('/dashboard')
  return { referrerUsername: referrer.username }
}

export async function getReferralStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { count: totalReferrals } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)

  const { count: verifiedReferrals } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)
    .eq('status', 'verified')

  return {
    referralCode: profile.referral_code,
    totalReferrals: totalReferrals ?? 0,
    verifiedReferrals: verifiedReferrals ?? 0,
  }
}
