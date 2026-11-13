import SettingsClient from '@/components/account/settings-client'
import { createClient } from '@/lib/supabase/server'
import { getProStatus } from '@/lib/entitlements'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notificationsEnabled = true
  let planLabel = 'Free'
  let planHint = 'Free practice and one mock per exam. Pro opens everything.'
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
          ? 'Your free promo is active. Thank you.'
          : pro.source === 'referral_trial'
            ? `Trial ends ${expiry ?? 'soon'}. Pay to keep going.`
            : expiry
              ? `Active until ${expiry}. Pay again to renew.`
              : 'Pro is active. Thank you.'
    }
  }

  return (
    <SettingsClient
      initialNotificationsEnabled={notificationsEnabled}
      planLabel={planLabel}
      planHint={planHint}
    />
  )
}
