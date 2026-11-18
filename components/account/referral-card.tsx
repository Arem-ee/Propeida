'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { siteUrl } from '@/lib/site-url'

export default function ReferralCard({
  referralCode,
  totalReferrals,
  verifiedReferrals,
}: {
  referralCode: string
  totalReferrals: number
  verifiedReferrals: number
}) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${siteUrl()}/signup?ref=${referralCode}`
  const shareMessage = `I practise for JAMB on Propeida. Sign up with my link: ${inviteUrl}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Delivery is best-effort; the link stays visible for manual copy
    }
  }

  return (
    <div>
      <input
        readOnly
        value={inviteUrl}
        aria-label="Your referral link"
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-2xl border border-blue-100/70 bg-blue-50/40 px-4 py-3 text-xs font-semibold text-ink-soft outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 min-h-[48px] cursor-pointer pressable"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 min-h-[48px] pressable"
        >
          <ExternalLink className="h-4 w-4" />
          Share on WhatsApp
        </a>
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-soft">
        {totalReferrals} signed up with your link{' · '}
        {verifiedReferrals} went Pro
      </p>
    </div>
  )
}
