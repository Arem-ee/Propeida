import Link from 'next/link'
import { ArrowRight, ClipboardList, Compass, TrendingUp } from 'lucide-react'
import { SceneArt } from '@/components/explore/visuals/scene-art'

export default function LandingPillars() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
          Two jobs, one app
        </p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          Practise for the exam. Explore what comes after.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Propeida does two things. It gets you ready for the exams that matter, and it shows you what those
          exams can lead to.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">Get ready for the exams that matter</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-gray-600">
              Timed JAMB and Post-UTME mock exams, verified questions, and honest scores that show exactly
              where to improve.
            </p>

            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  JAMB · Mathematics
                </span>
                <span className="text-[10px] tabular-nums text-gray-500">18:44 left</span>
              </div>
              <p className="mt-2.5 text-[12px] font-medium text-gray-900">If x + 2 = 7, what is the value of x?</p>
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-[10px] font-medium text-white">
                  C
                </span>
                <span className="text-[12px] tabular-nums text-blue-800">5</span>
                <span className="ml-auto text-[9px] font-medium uppercase tracking-[0.12em] text-blue-700">
                  Selected
                </span>
              </div>
            </div>

            <Link
              href="/signup"
              className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              Start practicing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">Figure out what comes after</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-gray-600">
              A feed of careers, courses and universities — built around the questions Nigerian students
              actually ask.
            </p>

            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                  Demand check
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2.5 text-[12px] font-extrabold leading-snug text-gray-900">
                Is Software Engineering still worth studying in 2026?
              </p>
              <div className="mt-2 overflow-hidden rounded-lg">
                <SceneArt scene="code" className="h-14 w-full" label="Career preview illustration" />
              </div>
            </div>

            <Link
              href="/explore"
              className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              Explore your possibilities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}