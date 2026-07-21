'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Is the Pro upgrade really a one-time payment of ₦1,500?',
    answer:
      'Yes. You pay once and unlock unlimited access to all mock simulators, exam banks, and analytics forever. There are no monthly subscriptions, no renewal fees, and no hidden charges. The landing page FAQ has more detail on this.',
  },
  {
    question: 'Does PrepIQ work on slow networks and budget Android phones?',
    answer:
      'Yes. PrepIQ is built for the network conditions and devices Nigerian students actually use. The platform uses text-only serialization, so a full mock exam uses under 2 MB of data. It works on Chrome, Samsung Internet, Opera, and Safari, including budget Android phones. There are no heavy animations, video content, or large assets that lag on 3G connections.',
  },
  {
    question: 'What happens after the free 30 questions run out?',
    answer:
      'You can still access the platform, view your results, and use the dashboard. To continue practicing past the free limits, upgrade to Pro with a single payment of ₦1,500. The free tier exists to let you confirm the platform works on your device and network before you pay.',
  },
  {
    question: 'Where do the practice questions come from?',
    answer:
      'The question bank is built from the recollections of past candidates who previously sat the University of Ilorin Post-UTME. These are not official past questions, and PrepIQ is not affiliated with the University of Ilorin, JAMB, WAEC, or any examination body. The full terms cover this in more detail.',
  },
  {
    question: 'Can I practice for multiple exams with one account?',
    answer:
      'Yes. A single account lets you practice JAMB, Post-UTME, WAEC, scholarship, aptitude, and postgraduate papers. You do not pay separately per exam.',
  },
  {
    question: 'How is PrepIQ different from practicing with past question PDFs?',
    answer:
      'PDFs do not enforce CBT timing, track your accuracy by subject, or simulate the actual exam screen. PrepIQ gives you the real countdown clock, multi-subject navigation, and a report of which topics you need to improve. The landing page FAQ also covers this.',
  },
  {
    question: 'What if I pay and my account is not activated?',
    answer:
      'Paystack triggers instant activation. If there is a network delay, use the contact form on this site to report the issue. Payments are resolved and accounts are activated manually if needed.',
  },
  {
    question: 'Does PrepIQ track my performance over time?',
    answer:
      'Yes. The dashboard shows your session history, accuracy by subject, current streak, and leaderboard ranking. Pro users get unlimited access to all analytics.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Answers to common questions about PrepIQ, payments, and platform features.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Also see the <Link href="/#faq" className="font-bold text-blue-600 hover:text-blue-700">FAQ section on the homepage</Link> for additional questions.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="rounded-xl border border-gray-100 bg-white transition-all hover:border-gray-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold text-gray-900 min-h-[44px] cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.question}</span>
                  <span className="shrink-0 text-gray-400">
                    {isOpen ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 rounded-b-xl">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 rounded-xl border border-gray-100 bg-gray-50/30 p-6 text-center">
          <p className="text-sm text-gray-500">
            Still have questions? <Link href="/contact" className="font-bold text-blue-600 hover:text-blue-700">Send a message</Link> and the team will respond.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
