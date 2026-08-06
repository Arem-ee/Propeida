import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Propeida helps Nigerian students pass JAMB and Post-UTME with interactive CBT mock exams and real past questions.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">About Propeida</h1>

        <div className="mt-8 space-y-6 text-base text-gray-500 leading-relaxed">
          <p>
            Propeida is a Computer-Based Test (CBT) exam preparation platform built for Nigerian students preparing for JAMB and Post-UTME. It replaces paper booklets and PDFs with a timed digital exam environment that works on the phones and networks students actually use.
          </p>
          <p>
            Our position is simple: <strong className="text-gray-900">every Nigerian candidate deserves a real chance.</strong> Preparation for the exam that decides a future should not depend on what a family can afford. So Propeida is free for students — the question bank, the simulator, the explanations, and the progress tracking. It is funded by schools, tutorial centers, foundations, alumni associations, and sponsors, who pay to widen access and measure real impact.
          </p>
          <p>
            The question bank draws from the recollections of past candidates who have taken the University of Ilorin Post-UTME, with every question checked and reworked by hand. These are not official questions and Propeida has no affiliation with the University of Ilorin, JAMB, or any examination body. The platform provides practice and preparation material. It does not guarantee any specific exam score or admission outcome.
          </p>
          <p>
            Propeida was started to give every student a realistic practice environment — not just the ones whose parents can pay for lesson centers and practice apps. We are starting small on purpose, so every question we publish is one we can stand behind, and every student we count is a real student.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/30 p-6">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Still have questions?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Visit the <Link href="/faq" className="font-bold text-blue-600 hover:text-blue-700">FAQ page</Link> for common answers, or use the <Link href="/contact" className="font-bold text-blue-600 hover:text-blue-700">contact form</Link> to reach the team.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
