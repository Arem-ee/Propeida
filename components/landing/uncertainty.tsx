import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingUncertainty() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Not sure yet?</p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          Most students start without a clue. That&apos;s okay.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Propeida is built for the question marks, not just the answers.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              The way most students start
            </p>
            <p className="mt-5 font-serif text-[26px] italic leading-snug text-gray-700 sm:text-[30px]">
              &ldquo;I don&apos;t know what I want to study.&rdquo;
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Where a few days of exploring takes you
            </p>
            <p className="mt-5 font-serif text-[26px] italic leading-snug text-gray-900 sm:text-[30px]">
              &ldquo;I know what interests me, what it can lead to, and what I can start learning.&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/explore"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            See what your future could look like
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}