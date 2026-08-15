'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'Is Propeida free?',
    answer:
      'Yes, to practice. Questions, explanations, streaks, leaderboards and your history cost nothing, and no card is required. An optional Pro upgrade removes limits for students who want more.',
  },
  {
    question: 'Which universities are available?',
    answer:
      'The University of Ilorin Post-UTME is live today, with JAMB practice close behind. Every question bank is checked by hand before it is published.',
  },
  {
    question: 'Are the questions verified?',
    answer:
      'They start as recollections from past candidates, then are checked and reworked by hand. They are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'Can I use it on my phone?',
    answer:
      'Yes. Propeida is text-first and light, so a full mock exam uses very little data. It works on Chrome, Samsung Internet, Opera and Safari on budget Android phones.',
  },
]

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="border-t border-gray-100 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700">FAQ</p>
          <h2 className="mt-6 text-3xl font-medium leading-[1.15] tracking-tight text-gray-900 sm:text-4xl">
            Questions students ask us
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl divide-y divide-gray-100">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left min-h-[48px] cursor-pointer"
                >
                  <span className="text-[15px] font-medium text-gray-900">{faq.question}</span>
                  <span
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-45 text-navy-700' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                {isOpen && (
                  <p className="pb-6 pr-8 text-[14px] leading-[1.9] text-gray-600">{faq.answer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}