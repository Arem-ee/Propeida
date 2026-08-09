import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MarketingPricing from '@/components/marketing-pricing'
import ParentShareButton from '@/components/campaign/parent-share-button'

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 min-h-[36px]">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>
      <MarketingPricing variant="dashboard" />

      <div className="mt-8 rounded-xl border border-green-100 bg-green-50/60 p-5">
        <h2 className="text-base font-bold text-gray-900">
          UNILORIN Post-UTME is in a few days — need the full question bank?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          A parent or guardian can unlock Pro in a minute. The WhatsApp message is already written.
        </p>
        <div className="mt-3">
          <ParentShareButton />
        </div>
      </div>
    </div>
  )
}