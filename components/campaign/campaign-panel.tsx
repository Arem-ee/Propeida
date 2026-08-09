'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Clock3 } from 'lucide-react'
import Link from 'next/link'
import {
  CAMPAIGN_COUNTDOWN_HEADLINE,
  CAMPAIGN_COUNTDOWN_SUB,
} from '@/lib/campaign/messages'
import { formatCountdown } from '@/lib/campaign/countdown'
import ParentShareButton from '@/components/campaign/parent-share-button'

interface CampaignStatus {
  hasAccess: boolean
  expiresAt: string | null
  campaignName: string | null
  recentlyExpired: boolean
}

export default function CampaignPanel({ status }: { status: CampaignStatus }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const expiresMs = status.expiresAt ? new Date(status.expiresAt).getTime() : 0
  const isActive = status.hasAccess && expiresMs > 0
  const expiredClientSide = isActive && expiresMs <= now

  if (isActive && !expiredClientSide) {
    return (
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm font-bold text-blue-900">{CAMPAIGN_COUNTDOWN_HEADLINE}</p>
        </div>
        <p className="mt-1 text-xs text-blue-700">{CAMPAIGN_COUNTDOWN_SUB}</p>
        <p className="mt-2 flex items-center gap-1.5 text-base font-bold text-blue-800 tabular-nums">
          <Clock3 className="h-4 w-4 text-blue-600" />
          Expires in: {formatCountdown(expiresMs - now)}
        </p>
      </div>
    )
  }

  if (!isActive) {
    // Server said access is gone (campaign ended). Show the upgrade screen if
    // the campaign recently ended for this user.
    if (!status.recentlyExpired) return null
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-indigo-100 bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
          {expiredClientSide ? 'Your 24-hour unlock just ended' : 'Your 24-hour unlock has ended'}
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-white">Keep the full question bank with Pro</h2>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-gray-600">
          Pro unlocks the complete question bank for your exams — every past question, full mock
          simulations, detailed answers, and review notes to help you improve.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm font-medium text-gray-700">
          <li>• Complete question bank for your target exams</li>
          <li>• Unlimited mock exams with real exam timing</li>
          <li>• Detailed answer explanations for every question</li>
        </ul>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/account/upgrade"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Upgrade to Pro — ₦1,500
          </Link>
          <ParentShareButton />
        </div>
      </div>
    </div>
  )
}