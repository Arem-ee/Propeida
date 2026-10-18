import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import MarketingPricing from '@/components/marketing-pricing'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Plans & Pricing',
  description: 'Start with free CBT practice, then upgrade to a Propeida subscription for more practice and mock access.',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <MarketingPricing authEmail={user?.email ?? null} />
      <MarketingFooter />
    </div>
  )
}
