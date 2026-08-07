'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

export default function MarketingFAQ() {
  const faqs: FAQItem[] = [
    {
      question: 'Is it really free?',
      answer:
        'Practicing is free — questions, explanations, streaks, leaderboards, and your performance history — no card required. An optional Pro upgrade unlocks unlimited mock exams and extra features for students who want more, and we\'re working to expand free access as the platform grows.',
    },
    {
      question: 'How do you make money?',
      answer:
        'Propeida is funded by schools, tutorial centers, foundations, alumni associations, and sponsors, who pay to widen access and track real impact. We also offer an optional Pro upgrade for students who want more — that choice always stays theirs.',
    },
    {
      question: 'Who owns my data?',
      answer:
        'You do. We never sell student data. Institutional partners see progress and results needed to run preparation — with consent — never personal information beyond that. Your progress history belongs to you permanently.',
    },
    {
      question: 'Is the JAMB bank ready?',
      answer:
        "Not yet. Just like our Post-UTME material, we're taking the time to check every single question so you can actually trust them. Almost ready — when it arrives, students will be able to start with it the same way: free to practise, with optional upgrades.",
    },
    {
      question: 'What are Post-UTME questions? Are these official past questions?',
      answer:
        'The question bank is built from the recollections of past candidates who sat the University of Ilorin Post-UTME, then checked and reworked by hand. These are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
    },
    {
      question: 'Does it work on budget phones and slow networks?',
      answer:
        'Yes. Propeida is built for the network conditions and devices Nigerian students actually use. The platform is text-first, so a full mock exam uses little data, and it works on Chrome, Samsung Internet, Opera, and Safari on budget Android phones.',
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Straight answers, because trust matters as much as preparation.
          </p>
        </div>

        <div className="space-y-4">
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
      </div>
    </section>
  )
}