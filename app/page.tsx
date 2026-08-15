import type { Metadata } from 'next'
import { HomeJsonLd, FaqJsonLd } from '@/components/json-ld'
import { spectral } from '@/components/landing/fonts'
import LandingHeader from '@/components/landing/header'
import LandingHero from '@/components/landing/hero'
import LandingWhy from '@/components/landing/why'
import LandingFeatures from '@/components/landing/features'
import LandingAdvantage from '@/components/landing/advantage'
import LandingTestimonial from '@/components/landing/testimonial'
import LandingFAQ from '@/components/landing/faq'
import LandingFooter from '@/components/landing/footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import SupportOverlay from '@/components/support-overlay'

export const metadata: Metadata = {
  title: 'Practice JAMB and Post-UTME the way you will take the real exam | Propeida',
  alternates: { canonical: '/' },
  description:
    'Timed mock exams, verified questions, revision notes, and performance tracking that show exactly where to improve before exam day. Trusted by 250+ Nigerian students.',
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
    title: 'Practice JAMB and Post-UTME the way you will take the real exam | Propeida',
    description:
      'Timed mock exams, verified questions, revision notes, and performance tracking that show exactly where to improve before exam day.',
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online',
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Practice JAMB and Post-UTME the way you will take the real exam | Propeida',
    description:
      'Timed mock exams, verified questions, revision notes, and performance tracking that show exactly where to improve before exam day.',
    images: ['/opengraph-image'],
  },
}

export default function HomePage() {
  return (
    <div
      className={`${spectral.variable} min-h-screen bg-white text-gray-900 antialiased selection:bg-navy-100 selection:text-navy-900`}
    >
      <HomeJsonLd />
      <FaqJsonLd />
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingWhy />
        <LandingFeatures />
        <LandingAdvantage />
        <LandingTestimonial />
        <LandingFAQ />
      </main>
      <LandingFooter />
      <WhatsAppFloat />
      <SupportOverlay />
    </div>
  )
}