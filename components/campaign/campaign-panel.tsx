'use client'

import { ShieldCheck, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { buildParentShareLink } from '@/lib/campaign/messages'

interface CampaignStatus {
  hasAccess: boolean
  expiresAt: string | null
  campaignName: string | null
  recentlyExpired: boolean
}

function formatExpiry(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CampaignPanel({ status }: { status: CampaignStatus }) {
  if (status.hasAccess) {
    return (
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-bold text-blue-900">
            Full question bank unlocked — 24-hour access
          </p>
        </div>
        {status.expiresAt && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-blue-700">
            <Clock3 className="h-3.5 w-3.5" />
            Access expires {formatExpiry(status.expiresAt)} and your free plan resumes automatically.
          </p>
        )}
      </div>
    )
  }

  if (!status.recentlyExpired) return null

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-indigo-100 bg-white">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">Your 24-hour unlock has ended</p>
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
          <a
            href={buildParentShareLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100"
          >
            Ask a parent on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}