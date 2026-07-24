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
      question: 'How is this different from reading past questions on paper or PDF?',
      answer:
        'Paper booklets and PDFs do not enforce strict computer-based test (CBT) timing, nor do they track your topic accuracy. Propeida simulates the actual digital exam screen, clock pressure, and multi-subject navigation. This helps you build the actual muscle memory of completing your paper before the official countdown hit zero.',
    },
    {
      question: 'Is this really a one-time payment of ₦1,500? Are there monthly fees?',
      answer:
        'Yes, it is strictly a one-time payment. Once you upgrade to Pro, you unlock unlimited access to all mock simulators and exam banks forever. There are absolutely no recurring monthly subscriptions or hidden upgrade fees.',
    },
    {
      question: 'Does the app work on slow network or budget data connections?',
      answer:
        'Yes. Propeida is optimized specifically for Nigerian mobile network constraints. The platform is lightweight, with text-only data serialization. This means pages load instantly on basic 3G connections, and completing a full-length, 180-question mock exam consumes less than 2MB of mobile data.',
    },
    {
      question: 'Can I practice for multiple exams or do I pay separately?',
      answer:
        'PUTME Pro is a one-time purchase that covers every school we add — start with Unilorin today, and any school added later is included at no extra cost. JAMB tiers are sold separately and are not yet available.',
    },
    {
      question: 'What happens if I pay and my account does not activate immediately?',
      answer:
        'Our Paystack gateway integration triggers instant automated activation. However, if there is a network delay, our support team is available via a direct WhatsApp link. We resolve payment issues and manually activate accounts in under five minutes.',
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
            Everything you need to know about how the simulator operates, payments, and data usage.
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
