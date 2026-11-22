'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitKey } from '@/lib/rate-limit'

export async function claimReferral(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again')

  // Referral codes are short strings; brute-forcing them must be slower
  // than the unique constraint can be probed.
  const headersList = await headers()
  const ip = getClientIp((name) => headersList.get(name))
  const { allowed } = await checkRateLimit(rateLimitKey(ip, 'referral-claim'), 10, 60000)
  if (!allowed) throw new Error('Too many attempts. Please wait a moment')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by, referral_code')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.referred_by) throw new Error('Already referred by someone')

  if (profile.referral_code === code) {
    throw new Error('You cannot use your own referral code')
  }

  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('referral_code', code)
    .single()

  if (!referrer) throw new Error('Invalid referral code')

  // Both writes happen in one transaction. The unique(referred_id) constraint
  // still arbitrates concurrent claims; a partial failure can no longer leave
  // a referral row without the matching profile link.
  const supabaseForClaim = await createClient()
  const { data: username, error } = await supabaseForClaim.rpc('claim_referral', {
    p_referrer_id: referrer.id,
    p_referred_id: user.id,
  })

  if (error) {
    if (/already referred/i.test(error.message)) {
      throw new Error('Already referred by someone')
    }
    if (/23505|unique|already been claimed/i.test(error.message)) {
      throw new Error('This referral has already been claimed')
    }
    throw new Error('Could not apply your referral code')
  }

  revalidatePath('/home')
  return { referrerUsername: username ?? referrer.username }
}

export async function getReferralStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again')

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
