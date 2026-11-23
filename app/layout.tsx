import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PwaInit from '@/components/pwa-init'
import GoogleAnalytics from '@/components/analytics/google-analytics'
import SiteJsonLd from '@/components/seo/site-json-ld'

// Same voice as the landing page: Fredoka display + Nunito body.
// Self-hosted (works offline, no network round-trip at build time).
// Paths are relative to this file (app/layout.tsx).
const fredoka = localFont({
  src: '../public/fonts/fredoka_latin.woff2',
  variable: '--font-display',
  weight: '500 700',
  display: 'swap',
})

const nunito = localFont({
  src: '../public/fonts/nunito_latin.woff2',
  variable: '--font-sans',
  weight: '400 800',
  display: 'swap',
})

import { siteUrl as getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Free JAMB Past Questions & Post-UTME Mock Exams | Propeida',
    template: '%s | Propeida',
  },
  description:
    'Free JAMB past questions and Post-UTME past questions with a real CBT simulator, timed mock exams, step-by-step explanations, and progress tracking',
  keywords: [
    'free JAMB past questions',
    'JAMB past questions',
    'Post UTME past questions',
    'UNILORIN Post UTME past questions',
    'JAMB mock exam',
    'JAMB CBT',
    'CBT exam simulator Nigeria',
    'exam preparation app Nigeria',
  ],
  openGraph: {
    title: 'Free JAMB Past Questions & Post-UTME Mock Exams | Propeida',
    description:
      'Free JAMB past questions and Post-UTME past questions with a real CBT simulator, timed mock exams, step-by-step explanations, and progress tracking',
    url: siteUrl,
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JAMB Past Questions & Post-UTME Mock Exams | Propeida',
    description:
      'Free JAMB past questions and Post-UTME past questions with a real CBT simulator, timed mock exams, step-by-step explanations, and progress tracking',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Propeida' },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <head>
        {supabaseOrigin ? <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" /> : null}
      </head>
      <body className="font-sans antialiased">
        <SiteJsonLd siteUrl={siteUrl} />
        {children}
        <PwaInit />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
