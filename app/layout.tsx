import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PwaInit from '@/components/pwa-init'
import GoogleAnalytics from '@/components/analytics/google-analytics'

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
    default: 'Propeida | Free JAMB & Post-UTME Practice with CBT Mock Exams',
    template: '%s | Propeida',
  },
  description:
    'Prepare smarter for JAMB and Post-UTME with realistic CBT practice, clear explanations, and progress tracking, and start free before you upgrade when you need more',
  keywords: [
    'free JAMB past questions',
    'Post UTME practice',
    'free CBT exam simulator Nigeria',
    'exam preparation app Nigeria',
    'sponsor a school exam prep',
  ],
  openGraph: {
    title: 'Propeida | Free JAMB & Post-UTME Practice with CBT Mock Exams',
    description:
      'Real CBT mock exams, human-checked questions, and progress tracking for your JAMB and Post-UTME preparation, with a free start and an upgrade when you want more practice',
    url: siteUrl,
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propeida | Free JAMB & Post-UTME Practice with CBT Mock Exams',
    description:
      'Real CBT mock exams, human-checked questions, and progress tracking for your JAMB and Post-UTME preparation, with a free start and an upgrade when you want more practice',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
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
        {children}
        <PwaInit />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
