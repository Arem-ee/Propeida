'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/app-shell'

export default function AppShellHost({
  children,
  email,
  isAdmin,
}: {
  children: React.ReactNode
  email: string | null
  isAdmin: boolean
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <AppShell email={email} isAdmin={isAdmin} onLogout={handleLogout}>
      {children}
    </AppShell>
  )
}
