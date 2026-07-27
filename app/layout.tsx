import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://propeida.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Propeida — Practice UNILORIN Post-UTME & JAMB Past Questions',
    template: '%s | Propeida',
  },
  description:
    'Practice UNILORIN Post-UTME past questions with interactive CBT mock exams. Real exam simulations, topic drills, and performance tracking. ₦1,500 one-time — no subscription.',
  keywords: [
    'UNILORIN Post UTME past questions',
    'Unilorin PUTME past question',
    'practice past questions',
    'JAMB past questions',
    'Post UTME practice',
    'CBT exam simulator Nigeria',
    'WAEC past questions',
    'Nigerian exam preparation',
    'university entrance exam practice',
  ],
  openGraph: {
    title: 'Propeida — Practice UNILORIN Post-UTME Past Questions Online',
    description:
      'Ace your UNILORIN Post-UTME with real past questions, CBT mock exams, and performance analytics. ₦1,500 one-time — no subscription.',
    url: siteUrl,
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propeida — Practice UNILORIN Post-UTME Past Questions',
    description:
      'Ace your UNILORIN Post-UTME with real past questions and CBT mock exams. ₦1,500 one-time payment.',
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
