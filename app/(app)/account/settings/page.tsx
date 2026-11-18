import SettingsClient from '@/components/account/settings-client'
import { createClient } from '@/lib/supabase/server'
import { getProStatus } from '@/lib/entitlements'
import { getReferralStats } from '@/lib/actions/referral'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notificationsEnabled = true
  let planLabel = 'Free'
  let planHint = 'Free practice and one mock per exam, and Pro opens everything'
  let planCtaLabel = 'See Pro'
  if (user) {
    const [{ data }, pro] = await Promise.all([
      supabase
        .from('profiles')
        .select('notifications_enabled')
        .eq('id', user.id)
        .maybeSingle(),
      getProStatus(user.id),
    ])
    notificationsEnabled = data?.notifications_enabled ?? true
    if (pro.isPro) {
      planLabel = pro.labels.join(' + ')
      const expiry = pro.expiresAt
        ? new Date(pro.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long' })
        : null
      planHint =
        pro.source === 'campaign'
          ? 'Your free promo is active'
          : pro.source === 'referral_trial'
            ? `Your trial ends ${expiry ?? 'soon'}, so pay to keep going`
            : pro.hasJambPro && !pro.hasPutmePro
              ? expiry
                ? `JAMB Pro is active until ${expiry}, and PUTME Pro is a separate plan`
                : 'JAMB Pro is active, and PUTME Pro is a separate plan'
              : pro.hasPutmePro && !pro.hasJambPro
                ? expiry
                  ? `PUTME Pro is active until ${expiry}, and JAMB Pro is a separate plan`
                  : 'PUTME Pro is active, and JAMB Pro is a separate plan'
                : expiry
                  ? `Pro is active until ${expiry}, and you can pay again to renew`
                  : 'Pro is active'
      planCtaLabel =
        pro.hasJambPro && !pro.hasPutmePro
          ? 'Add PUTME Pro'
          : pro.hasPutmePro && !pro.hasJambPro
            ? 'Add JAMB Pro'
            : 'See all plans'
    }
  }

  let referral: { referralCode: string; totalReferrals: number; verifiedReferrals: number } | null = null
  if (user) {
    try {
      referral = await getReferralStats()
    } catch {
      // If stats fail, the card hides rather than blocking the whole page
      referral = null
    }
  }

  return (
    <SettingsClient
      initialNotificationsEnabled={notificationsEnabled}
      planLabel={planLabel}
      planHint={planHint}
      planCtaLabel={planCtaLabel}
      referral={referral}
    />
  )
}
