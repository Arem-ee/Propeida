'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function claimReferral(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by, referral_code')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.referred_by) throw new Error('Already referred by someone')

  if (profile.referral_code === code) {
    throw new Error('You cannot use your own referral code.')
  }

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('referral_code', code)
    .single()

  if (!referrer) throw new Error('Invalid referral code')

  // Insert the referrals row FIRST so the unique constraint on referred_id
  // is the arbiter of concurrent claims; only then stamp referred_by. If the
  // profile update fails, roll back the referrals row to keep the two in
  // step. (Previously the order was reversed: two racing claims could both
  // update the profile and one then 500 on the insert.)
  const admin = createAdminClient()
  const { error: referralError } = await admin
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      status: 'pending',
    })

  if (referralError) {
    if (referralError.code === '23505') {
      throw new Error('This referral has already been claimed.')
    }
    throw new Error('Could not record your referral.')
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', user.id)

  if (updateError) {
    await admin
      .from('referrals')
      .delete()
      .eq('referrer_id', referrer.id)
      .eq('referred_id', user.id)
    throw new Error('Could not apply your referral code.')
  }

  revalidatePath('/home')
  return { referrerUsername: referrer.username }
}

export async function getReferralStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again.')

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
