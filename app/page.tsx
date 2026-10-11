import type { Metadata } from 'next'
import { HomeJsonLd, FaqJsonLd } from '@/components/json-ld'
import LandingHeader from '@/components/landing/header'
import LandingHero from '@/components/landing/hero'
import LandingPillars from '@/components/landing/pillars'
import LandingNigeria from '@/components/landing/nigeria'
import LandingJourney from '@/components/landing/journey'
import LandingPractice from '@/components/landing/practice'
import LandingComparisonTable from '@/components/landing/comparison-table'
import LandingUncertainty from '@/components/landing/uncertainty'
import LandingTestimonial from '@/components/landing/testimonial'
import LandingFAQ from '@/components/landing/faq'
import LandingFinalCta from '@/components/landing/final-cta'
import LandingFooter from '@/components/landing/footer'
import WhatsAppFloat from '@/components/whatsapp-float'

export const metadata: Metadata = {
  title: 'Your future is bigger than one exam',
  alternates: { canonical: '/' },
  description:
    'Free JAMB and Post-UTME practice in the real CBT format, with proof of what you have actually learned. Built for Nigerian students.',
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
    title: 'Your future is bigger than one exam | Propeida',
    description:
      'Free JAMB and Post-UTME practice in the real CBT format, with proof of what you have actually learned.',
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online',
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your future is bigger than one exam | Propeida',
    description:
      'Free JAMB and Post-UTME practice in the real CBT format, with proof of what you have actually learned.',
    images: ['/opengraph-image'],
  },
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-white text-gray-900 antialiased selection:bg-blue-50 selection:text-blue-700"
    >
      <HomeJsonLd />
      <FaqJsonLd />
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingPillars />
        <LandingNigeria />
        <LandingJourney />
        <LandingPractice />
        <LandingComparisonTable />
        <LandingUncertainty />
        <LandingTestimonial />
        <LandingFAQ />
        <LandingFinalCta />
      </main>
      <LandingFooter />
      <WhatsAppFloat />
    </div>
  )
}
