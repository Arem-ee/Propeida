import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MarketingPricing from '@/components/marketing-pricing'

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 min-h-[36px]">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>
      <MarketingPricing variant="dashboard" />
    </div>
  )
}
