import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import FaqJsonLd from '@/components/seo/faq-json-ld'

export const metadata: Metadata = {
  title: 'Post-UTME Past Questions & Online Practice',
  alternates: { canonical: '/post-utme-past-questions' },
  description:
    'Practise post-UTME past questions online with a real CBT simulator, timed mock exams, and short revision notes, and start with the verified UNILORIN Post-UTME question bank',
}

const FAQ_ITEMS = [
  {
    question: 'Are these the official post-UTME past questions?',
    answer:
      'No. The question bank is built from the recollections of past candidates who sat the University of Ilorin Post-UTME, then checked and reworked by hand. These are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'What is PUTME?',
    answer:
      'PUTME is short for Post-UTME, the computer-based aptitude test many Nigerian universities run after JAMB for candidates seeking admission. Propeida currently covers the UNILORIN Post-UTME (PUTME), with more universities being prepared.',
  },
  {
    question: 'Does Propeida cover JAMB past questions?',
    answer:
      'Yes. Propeida has more than 500 JAMB questions published across English, Mathematics, Government, and Economics, and you practise them in the same CBT screen. We add more subjects as we verify them.',
  },
  {
    question: 'Do I need to pay to practise post-UTME questions?',
    answer:
      'Practising is free, with questions, explanations, learning days, and your performance history, and no card is required. An optional Pro upgrade unlocks unlimited mock exams and extra features when you want more.',
  },
]

export default function PostUtmePastQuestionsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <FaqJsonLd items={FAQ_ITEMS} />
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Post-UTME Past Questions, Online Practice &amp; Mock Exams
        </h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          Most post-UTME exams today run on computers, so practising past questions in a real CBT environment with a countdown clock and timed mocks is the closest way to prepare
        </p>

        <div className="mt-10 space-y-6 text-base text-gray-500 leading-relaxed">
          <p>
            Propeida is a CBT practice platform for JAMB and post-UTME with verified questions, timed mock exams,
            and short revision notes. You can start with more than 500 published JAMB questions across English,
            Mathematics, Government, and Economics. We also cover the{' '}
            <Link href="/unilorin-putme" className="font-bold text-blue-600 hover:text-blue-700">
              UNILORIN Post-UTME (PUTME)
            </Link>{' '}
            and are preparing material for more universities.
          </p>
          <p>
            Every question is built from the recollections of past candidates who sat the exam, then checked and
            reworked by hand before it is published. Practising on the actual CBT screen instead of paper PDFs
            gets you used to the timing, the navigation, and the pressure of the real test.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h2 className="text-lg font-extrabold text-gray-900">Why practice post-UTME past questions on Propeida</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
            <li><strong className="text-gray-900">Real CBT simulation</strong> lets you practise on the real CBT screen with a countdown clock, not on paper PDFs</li>
            <li><strong className="text-gray-900">Timed mock exams</strong> let you sit full mock exams under real exam conditions</li>
            <li><strong className="text-gray-900">Explanations</strong> give you an explanation for every answer, so you understand it and not just the option letter</li>
            <li><strong className="text-gray-900">Revision notes</strong> give you short notes for each topic when you need a quick review</li>
            <li><strong className="text-gray-900">Progress tracking</strong> shows your accuracy by subject and how your performance changes over time</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
          >
            Start practising
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/unilorin-putme"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px] px-4 py-3"
          >
            About the UNILORIN Post-UTME (PUTME)
          </Link>
        </div>

        <section className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-extrabold text-gray-900">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-gray-100 bg-white p-5">
                <p className="text-sm font-bold text-gray-900">{faq.question}</p>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
