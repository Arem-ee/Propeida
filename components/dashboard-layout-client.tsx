'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardShell from '@/components/dashboard-shell'
import SupportOverlay from '@/components/support-overlay'
import { DashboardHubProvider } from '@/components/dashboard-hub-provider'

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [needsUsername, setNeedsUsername] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email ?? null)

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, username')
        .eq('id', user.id)
        .single()

      if (profile && !profile.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      if (profile && /^user_[a-f0-9]{8}$/.test(profile.username)) {
        setNeedsUsername(true)
      }

      setLoading(false)

      try {
        const res = await fetch('/api/auth/check-admin')
        const data = await res.json()
        setIsAdmin(data.isAdmin)
      } catch {}
    }).catch(() => {
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
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