import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShellHost from '@/components/app-shell-host'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return (
    <AppShellHost email={user.email ?? null} isAdmin={profile?.is_admin ?? false}>
      {children}
    </AppShellHost>
  )
}
