import type { Metadata } from 'next'
import { HomeJsonLd } from '@/components/json-ld'
import MarketingHeader from '@/components/marketing-header'
import MarketingHero from '@/components/marketing-hero'
import MarketingFundingBanner from '@/components/marketing-funding-banner'
import MarketingTrustMetrics from '@/components/marketing-trust-metrics'
import MarketingPracticeCategories from '@/components/marketing-practice-categories'
import MarketingPracticeSimulator from '@/components/marketing-practice-simulator'
import MarketingLearningTools from '@/components/marketing-learning-tools'
import MarketingCommunity from '@/components/marketing-community'
import QuestionsCounter from '@/components/questions-counter'
import MarketingSuccessStories from '@/components/marketing-success-stories'
import MarketingSponsor from '@/components/marketing-sponsor'
import MarketingPartner from '@/components/marketing-partner'
import MarketingInstitutionalPreview from '@/components/marketing-institutional-preview'
import MarketingReadinessStrip, { MarketingWhatsAppCta } from '@/components/marketing-readiness-strip'
import MarketingFAQ from '@/components/marketing-faq'
import MarketingFooter from '@/components/marketing-footer'
import WhatsAppFloat from '@/components/whatsapp-float'

export const metadata: Metadata = {
  title: 'Propeida — Free exam preparation for every Nigerian candidate',
  description:
    'Every Nigerian candidate deserves a real chance. Free, verified JAMB and Post-UTME preparation — a real CBT simulator, human-checked questions, and progress tracking. Free for students.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-blue-50 selection:text-blue-600">
      <HomeJsonLd />
      <MarketingHeader />
      <main>
        <MarketingHero />
        <MarketingFundingBanner />
        <MarketingTrustMetrics />
        <MarketingPracticeCategories />
        <MarketingPracticeSimulator />
        <MarketingLearningTools />
        <MarketingCommunity />
        <QuestionsCounter />
        <MarketingSuccessStories />
        <MarketingSponsor />
        <MarketingPartner />
        <MarketingInstitutionalPreview />
        <MarketingReadinessStrip />
        <MarketingWhatsAppCta />
        <MarketingFAQ />
      </main>
      <MarketingFooter />
      <WhatsAppFloat />
    </div>
  )
}