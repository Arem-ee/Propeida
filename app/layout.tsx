import type { Metadata, Viewport } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'
import PwaInit from '@/components/pwa-init'
import GoogleAnalytics from '@/components/analytics/google-analytics'

// Same voice as the landing page: Fredoka display + Nunito body,
// self-hosted (works offline, no render-blocking Google Fonts request).
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online'
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
    'Prepare smarter for JAMB and Post-UTME with realistic CBT practice, clear explanations, and progress tracking. Start free, then upgrade when you need more.',
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
      'Real CBT mock exams, human-checked questions, and progress tracking for Nigerian students. Start free and upgrade for more practice.',
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
      'Real CBT mock exams, human-checked questions, and progress tracking for Nigerian students. Start free and upgrade for more practice.',
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
        {children}
        <PwaInit />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
