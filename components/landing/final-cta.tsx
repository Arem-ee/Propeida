import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingFinalCta() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-[32px] bg-blue-600 px-6 py-16 text-center sm:px-16 sm:py-20">
          <h2 className="font-serif text-[30px] font-medium leading-tight text-white sm:text-[38px]">
            Start with Propeida.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-[1.9] text-blue-100">
            It&apos;s free. It works on your phone. And it shows you what comes after the exam.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl bg-white px-6 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
            >
              Start with Propeida
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-blue-300/70 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Explore careers
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}