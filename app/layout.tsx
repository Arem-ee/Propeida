import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import PwaInit from '@/components/pwa-init'
import GoogleAnalytics from '@/components/analytics/google-analytics'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.online'
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Propeida — Free JAMB & Post-UTME Practice with CBT Mock Exams',
    template: '%s | Propeida',
  },
  description:
    'Free exam preparation for every Nigerian candidate. Practice JAMB and UNILORIN Post-UTME questions with a real CBT simulator, explanations, and performance tracking. Free for students.',
  keywords: [
    'free JAMB past questions',
    'Post UTME practice',
    'free CBT exam simulator Nigeria',
    'exam preparation app Nigeria',
    'sponsor a school exam prep',
  ],
  openGraph: {
    title: 'Propeida — Free JAMB & Post-UTME Practice with CBT Mock Exams',
    description:
      'Free exam preparation for every Nigerian candidate. Real CBT mock exams, human-checked questions, and progress tracking. Free for students.',
    url: siteUrl,
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propeida — Free JAMB & Post-UTME Practice with CBT Mock Exams',
    description:
      'Free exam preparation for every Nigerian candidate. Real CBT mock exams, human-checked questions, and progress tracking. Free for students.',
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
    <html lang="en" className={geist.variable}>
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
