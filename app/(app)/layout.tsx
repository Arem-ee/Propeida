import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShellHost from '@/components/app-shell-host'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, onboarding_completed')
    .eq('id', user.id)
    .single()

  // First run belongs to placement by doing. /onboarding lives outside
  // this group, so this redirect cannot loop.
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <AppShellHost email={user.email ?? null} isAdmin={profile?.is_admin ?? false}>
      {children}
    </AppShellHost>
  )
}
