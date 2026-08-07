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
    question: 'Is Propeida really free for students?',
    answer:
      'Practicing is free — questions, explanations, streaks, leaderboards, and your performance history — no card required. An optional Pro upgrade unlocks unlimited mock exams and extra features for students who want more, and we\'re working to expand free access as the platform grows.',
  },
  {
    question: 'How can Propeida make money?',
    answer:
      'Propeida is funded by schools, tutorial centers, foundations, alumni associations, and sponsors, who pay to widen access and track real impact. We also offer an optional Pro upgrade for students who want more — that choice always stays theirs.',
  },
  {
    question: 'Does Propeida work on slow networks and budget Android phones?',
    answer:
      'Yes. Propeida is built for the network conditions and devices Nigerian students actually use. The platform uses text-first serialization, so a full mock exam uses little data, and it works on Chrome, Samsung Internet, Opera, and Safari, including budget Android phones.',
  },
  {
    question: 'Where do the practice questions come from?',
    answer:
      'The question bank is built from the recollections of past candidates who previously sat the University of Ilorin Post-UTME, then checked and reworked by hand. These are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'Can I practice for multiple exams with one account?',
    answer:
      'Yes. A single account lets you practice Post-UTME now, JAMB when it launches, and any university we add next. You never pay separately per exam.',
  },
  {
    question: 'How is Propeida different from practicing with past question PDFs?',
    answer:
      'PDFs do not enforce CBT timing, track your accuracy by subject, or simulate the actual exam screen. Propeida gives you the real countdown clock, multi-subject navigation, explanations, and a report of which topics you need to improve.',
  },
  {
    question: 'Does Propeida track my performance over time?',
    answer:
      'Yes. Your dashboard shows session history, accuracy by subject, current streak, and leaderboard ranking. Your performance history is permanent and belongs to you.',
  },
  {
    question: 'Who owns my data?',
    answer:
      'You do. We never sell student data. Institutional partners see progress and results needed to run preparation — with consent — never personal information beyond that. We explain this fully on the funding page.',
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
            Straight answers about Propeida, how it is funded, and how it works.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Also see the <Link href="/#faq" className="font-bold text-blue-600 hover:text-blue-700">FAQ section on the homepage</Link> and{' '}
            <Link href="/funding" className="font-bold text-blue-600 hover:text-blue-700">how Propeida is funded</Link>.
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