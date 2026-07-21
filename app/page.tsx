import MarketingHeader from '@/components/marketing-header'
import MarketingHero from '@/components/marketing-hero'
import MarketingBenefits from '@/components/marketing-benefits'
import MarketingPracticeSimulator from '@/components/marketing-practice-simulator'
import MarketingFeatures from '@/components/marketing-features'
import MarketingHowItWorks from '@/components/marketing-how-it-works'
import MarketingSupportedExams from '@/components/marketing-supported-exams'
import MarketingPricing from '@/components/marketing-pricing'
import MarketingFAQ from '@/components/marketing-faq'
import MarketingFooter from '@/components/marketing-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-blue-50 selection:text-blue-600">
      <MarketingHeader />
      <main>
        <MarketingHero />
        <MarketingBenefits />
        <MarketingPracticeSimulator />
        <MarketingFeatures />
        <MarketingHowItWorks />
        <MarketingSupportedExams />
        <MarketingPricing />
        <MarketingFAQ />
      </main>
      <MarketingFooter />
    </div>
  )
}
