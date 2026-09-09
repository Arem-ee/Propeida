import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import MarketingPricing from '@/components/marketing-pricing'

export const metadata = {
  title: 'Plans & Pricing',
  description: 'Start with free CBT practice, then upgrade to a Propeida subscription for more practice and mock access.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <MarketingPricing />
      <MarketingFooter />
    </div>
  )
}
