import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/dashboard-layout-client'
import { createClient, getAuthUser } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  if (!user) redirect('/login')

  let profile: { username: string | null; onboarding_completed: boolean; is_admin: boolean } | null = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('username, onboarding_completed, is_admin')
      .eq('id', user.id)
      .single()
    profile = data
  } catch {}

  if (profile && !profile.onboarding_completed) redirect('/onboarding')

  return (
    <DashboardLayoutClient
      email={user.email ?? null}
      isAdmin={profile?.is_admin ?? false}
      needsUsername={profile ? /^user_[a-f0-9]{8}$/.test(profile.username ?? '') : false}
    >
      {children}
    </DashboardLayoutClient>
  )
}