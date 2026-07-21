'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gift, ArrowLeft, Check, Copy } from 'lucide-react'
import { getReferralStats } from '@/lib/actions/referral'

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalReferrals: number; verifiedReferrals: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getReferralStats()
      .then((data) => {
        setReferralCode(data.referralCode)
        setStats({ totalReferrals: data.totalReferrals, verifiedReferrals: data.verifiedReferrals })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 min-h-[36px]">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Refer & Earn</h1>
      <p className="text-sm text-gray-500 mb-8">
        Share your referral code with friends. When they make a purchase, you earn 7 days of free Pro access.
      </p>

      <div className="rounded-xl border border-gray-100 bg-white p-6 mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Referral Code</p>
        {referralCode ? (
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-lg font-bold text-gray-900 tracking-wider select-all">
              {referralCode}
            </code>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 min-h-[44px] cursor-pointer"
            >
              {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading...</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{stats?.totalReferrals ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Referrals</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 text-center">
          <p className="text-3xl font-extrabold text-gray-900">{stats?.verifiedReferrals ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Verified</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-rose-50 p-5">
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-900">How it works</p>
            <ul className="mt-2 text-xs text-rose-700 space-y-1.5">
              <li>Share your unique referral code with friends</li>
              <li>They sign up and purchase PUTME Pro</li>
              <li>You get 7 days of free Pro access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
