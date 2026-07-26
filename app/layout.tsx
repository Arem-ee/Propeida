import type { Metadata } from 'next'
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
    'Pass your UNILORIN Post-UTME, JAMB, and WAEC with confidence. Practice real past questions with interactive CBT mock exams, topic drills, and performance analytics built for Nigerian students.',
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
    title: 'Propeida — Practice UNILORIN Post-UTME & JAMB Past Questions',
    description:
      'Pass your UNILORIN Post-UTME, JAMB, and WAEC with confidence. Practice real past questions with interactive CBT mock exams.',
    url: siteUrl,
    siteName: 'Propeida',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propeida — Exam Prep for Nigerian Students',
    description:
      'Practice UNILORIN Post-UTME, JAMB, and WAEC past questions with interactive CBT mock exams.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: { capable: true, title: 'Propeida' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
