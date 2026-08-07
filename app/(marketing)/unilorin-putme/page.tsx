import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import FaqJsonLd from '@/components/seo/faq-json-ld'

export const metadata: Metadata = {
  title: 'UNILORIN Post-UTME (PUTME) Practice & Past Questions',
  alternates: { canonical: '/unilorin-putme' },
  description:
    'Practice verified UNILORIN Post-UTME (PUTME) questions with a real CBT simulator, timed mock exams, and short revision notes. Every question is checked by hand.',
}

const FAQ_ITEMS = [
  {
    question: 'Are these the official UNILORIN Post-UTME past questions?',
    answer:
      'No. The question bank is built from the recollections of past candidates who sat the University of Ilorin Post-UTME, then checked and reworked by hand. These are not official past questions, and Propeida is not affiliated with the University of Ilorin, JAMB, or any examination body.',
  },
  {
    question: 'What is the UNILORIN Post-UTME (PUTME)?',
    answer:
      'The UNILORIN Post-UTME, often called PUTME, is the University of Ilorin\u2019s computer-based aptitude test taken by candidates seeking admission. Propeida simulates that CBT experience — timed practice, mock exams, and progress tracking — on the phones and networks students actually use.',
  },
  {
    question: 'How do I practice UNILORIN Post-UTME questions on Propeida?',
    answer:
      'Create a free account, open the Universities hub, and pick UNILORIN. Practice mode lets you learn at your own pace, while mock mode runs the full timed CBT exam experience with explanations after each session.',
  },
  {
    question: 'Is practicing free?',
    answer:
      'Practicing is free — questions, explanations, streaks, leaderboards, and your performance history — no card required. An optional Pro upgrade unlocks unlimited mock exams and extra features for students who want more, and we\u2019re working to expand free access as the platform grows.',
  },
  {
    question: 'Does Propeida cover JAMB too?',
    answer:
      'Not yet. Just like our Post-UTME material, we\u2019re taking the time to check every single JAMB question so you can trust them. You can start with UNILORIN Post-UTME practice today, and JAMB material follows the same model when it ships.',
  },
]

export default function UnilorinPutmePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <FaqJsonLd items={FAQ_ITEMS} />
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          UNILORIN Post-UTME (PUTME) Practice &amp; Past Questions
        </h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">
          Prepare for the University of Ilorin Post-UTME (PUTME) with verified practice questions, a real CBT
          simulator, timed mock exams, and short revision notes.
        </p>

        <div className="mt-10 space-y-6 text-base text-gray-500 leading-relaxed">
          <p>
            The UNILORIN Post-UTME is a computer-based test, and the fastest way to prepare for a CBT exam is to
            practice in a CBT environment. Propeida replicates the real exam screen — the countdown clock,
            multi-subject navigation, and instant feedback — so the real test feels familiar.
          </p>
          <p>
            Our UNILORIN question bank follows the real pattern: <strong className="text-gray-900">English, Mathematics, and Current Affairs</strong>.
            Every question is built from the recollections of past candidates who sat the exam, then checked and
            reworked by hand before it is published.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h2 className="text-lg font-extrabold text-gray-900">What you get with UNILORIN Post-UTME practice</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-relaxed">
            <li><strong className="text-gray-900">Practice mode</strong> — learn question by question, with explanations for every answer.</li>
            <li><strong className="text-gray-900">Timed mock exams</strong> — full CBT sessions under real exam conditions.</li>
            <li><strong className="text-gray-900">Revision notes</strong> — short, topic-by-topic notes for quick review.</li>
            <li><strong className="text-gray-900">Progress tracking</strong> — accuracy by subject, streaks, and session history.</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
          >
            Start practicing
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/post-utme-past-questions"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px] px-4 py-3"
          >
            Post-UTME past questions, explained
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
