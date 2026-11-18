'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/app-shell'
import SettingsApplier from '@/components/settings-applier'

export default function AppShellHost({
  children,
  email,
  isAdmin,
  subjectCombinations,
}: {
  children: React.ReactNode
  email: string | null
  isAdmin: boolean
  subjectCombinations: string[]
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <AppShell email={email} isAdmin={isAdmin} subjectCombinations={subjectCombinations} onLogout={handleLogout}>
      <SettingsApplier />
      {children}
    </AppShell>
  )
}
