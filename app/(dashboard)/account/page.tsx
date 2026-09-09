'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gift, School, ArrowRight, X, CreditCard, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/avatar'
import { AvatarPicker } from '@/components/avatar-picker'
import { updateAvatarIndex } from '@/lib/actions/profile'
import { getReferralStats } from '@/lib/actions/referral'

export default function AccountPage() {
  const [profile, setProfile] = useState<{ username: string; email: string; avatarIndex: number | null } | null>(null)
  const [activeProducts, setActiveProducts] = useState<string[]>([])
  const [verifiedReferrals, setVerifiedReferrals] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [hasGoogleIdentity, setHasGoogleIdentity] = useState(false)
  const [linkingGoogle, setLinkingGoogle] = useState(false)

  const load = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setHasGoogleIdentity(user.identities?.some((identity) => identity.provider === 'google') ?? false)

      const { data: prof } = await supabase
        .from('profiles')
        .select('username, avatar_index')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile({
          username: prof.username,
          email: user.email ?? '',
          avatarIndex: prof.avatar_index,
        })
      }

      const { data: entitlements } = await supabase
        .from('entitlements')
        .select('product, status, expires_at')
        .eq('user_id', user.id)
      const products = (entitlements ?? [])
        .filter((e: { product: string; status: string; expires_at: string | null }) =>
          e.status === 'active' && (!e.expires_at || new Date(e.expires_at) > new Date())
        )
        .map((e: { product: string }) => e.product)
      setActiveProducts(products)

      const stats = await getReferralStats()
      setVerifiedReferrals(stats.verifiedReferrals)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAvatarChange = async (index: number) => {
    setProfile((prev) => prev ? { ...prev, avatarIndex: index } : prev)
    try {
      await updateAvatarIndex(index)
      setMessage('Avatar updated')
    } catch { setMessage('Failed to update avatar') }
  }

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage(error.message)
      setLinkingGoogle(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const hasPutmePro = activeProducts.includes('putme_pro')
  const hasJambPro = activeProducts.includes('jamb_pro') || activeProducts.includes('jamb_premium_ai')

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Account</h1>

      {message && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 mb-6 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="mb-8">
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar username={profile?.username ?? ''} avatarIndex={profile?.avatarIndex ?? null} size={48} />
            <div>
              <p className="text-sm font-bold text-gray-900">{profile?.username ?? 'User'}</p>
              <p className="text-xs text-gray-400">{profile?.email ?? ''}</p>
            </div>
          </div>
          <AvatarPicker currentIndex={profile?.avatarIndex ?? 0} onSelect={handleAvatarChange} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Sign-in methods</h2>
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Google</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {hasGoogleIdentity
                  ? 'Connected to this Propeida account'
                  : 'Connect Google so email and Google sign-in open this same account.'}
              </p>
            </div>
            {hasGoogleIdentity ? (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">Connected</span>
            ) : (
              <button
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Link2 className="h-3.5 w-3.5" />
                {linkingGoogle ? 'Connecting...' : 'Connect Google'}
              </button>
            )}
          </div>
          {!hasGoogleIdentity && (
            <p className="mt-3 border-t border-gray-50 pt-3 text-xs leading-relaxed text-gray-400">
              Connect Google while signed in to the account you want to keep. If you already created a separate Google account, contact support before linking so we can help preserve your progress and access.
            </p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Subscriptions</h2>
        <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-bold text-gray-900">JAMB Access</p>
              <p className="text-xs text-gray-400">Practice, mocks, and leaderboard</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${hasJambPro ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
              {hasJambPro ? 'Active' : 'Free'}
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-bold text-gray-900">PUTME Pro</p>
              <p className="text-xs text-gray-400">School-specific Post-UTME banks</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${hasPutmePro ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
              {hasPutmePro ? 'Active' : 'Free'}
            </span>
          </div>
        </div>
        {!hasPutmePro && (
          <Link
            href="/account/upgrade"
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[36px]"
          >
            Upgrade to PUTME Pro
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Manage</h2>
        <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
          <Link href="/account/institutions" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[44px]">
            <div className="rounded-xl bg-blue-100 p-2">
              <School className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Institutions</p>
              <p className="text-xs text-gray-400">Manage your target universities</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
          </Link>
          <Link href="/account/referrals" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[44px]">
            <div className="rounded-xl bg-rose-100 p-2">
              <Gift className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Refer & Earn</p>
              <p className="text-xs text-gray-400">{verifiedReferrals} verified referral{verifiedReferrals !== 1 ? 's' : ''}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
          </Link>
          <Link href="/account/upgrade" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors min-h-[44px]">
            <div className="rounded-xl bg-blue-100 p-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Upgrade</p>
              <p className="text-xs text-gray-400">Unlock PUTME Pro and unlimited mock access</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
          </Link>
        </div>
      </section>
    </div>
  )
}
