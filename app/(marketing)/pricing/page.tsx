import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import MarketingPricing from '@/components/marketing-pricing'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Free practice questions and one mock exam per exam. Unlock unlimited UNILORIN Post-UTME and JAMB prep with PUTME Pro (₦1,500 one-time).',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Pricing</h1>
        <p className="mt-6 text-lg text-gray-500 leading-relaxed">
          Propeida offers a free tier and a one-time Pro upgrade at ₦1,500. No recurring subscriptions.
        </p>
        <MarketingPricing />
      </main>
      <MarketingFooter />
    </div>
  )
}
