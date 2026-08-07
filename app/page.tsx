import type { Metadata } from 'next'
import { HomeJsonLd, FaqJsonLd } from '@/components/json-ld'
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
import SupportOverlay from '@/components/support-overlay'

export const metadata: Metadata = {
  title: 'UNILORIN Post-UTME (PUTME) & JAMB Practice | Propeida',
  alternates: { canonical: '/' },
  description:
    'Practice UNILORIN Post-UTME (PUTME) past questions with a real CBT simulator, timed mock exams, and short revision notes. JAMB preparation is next.',
  keywords: [
    'unilorin putme',
    'unilorin post utme',
    'post utme past questions',
    'putme',
    'JAMB',
    'CBT mock exam Nigeria',
    'exam preparation app Nigeria',
  ],
  openGraph: {
    title: 'UNILORIN Post-UTME (PUTME) & JAMB Practice | Propeida',
    description:
      'Practice UNILORIN Post-UTME (PUTME) past questions with a real CBT simulator, timed mock exams, and progress tracking. JAMB preparation is next.',
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online',
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UNILORIN Post-UTME (PUTME) & JAMB Practice | Propeida',
    description:
      'Practice UNILORIN Post-UTME (PUTME) past questions with a real CBT simulator, timed mock exams, and progress tracking. JAMB preparation is next.',
    images: ['/opengraph-image'],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-blue-50 selection:text-blue-600">
      <HomeJsonLd />
      <FaqJsonLd />
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
      <SupportOverlay />
    </div>
  )
}