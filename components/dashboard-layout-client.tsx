'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard-shell'
import SupportOverlay from '@/components/support-overlay'
import { DashboardHubProvider } from '@/components/dashboard-hub-provider'

export default function DashboardLayoutClient({
  children,
  email,
  isAdmin,
  needsUsername,
}: {
  children: React.ReactNode
  email: string | null
  isAdmin: boolean
  needsUsername: boolean
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DashboardHubProvider>
      <DashboardShell email={email} isAdmin={isAdmin} onLogout={handleLogout}>
        {needsUsername && (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-blue-100 bg-blue-50 px-4 py-2 text-center text-xs font-medium text-blue-800">
            <span>Your username is temporary — pick one for the leaderboard.</span>
            <Link href="/auth/set-username" className="font-bold text-blue-700 underline hover:text-blue-900">
              Choose a username
            </Link>
          </div>
        )}
        {children}
      </DashboardShell>
      <SupportOverlay />
    </DashboardHubProvider>
  )
}