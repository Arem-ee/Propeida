import Link from 'next/link'

const OPTIONS = [
  { key: 'A', text: '60.5', selected: false },
  { key: 'B', text: '62.0', selected: false },
  { key: 'C', text: '61.5', selected: true },
  { key: 'D', text: '61.0', selected: false },
]

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-24 lg:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h1 className="text-[40px] font-medium leading-[1.06] tracking-tight text-gray-900 sm:text-[52px]">
              Practice JAMB and Post-UTME the way you&apos;ll take the real{' '}
              <span className="font-serif italic text-blue-700 underline decoration-blue-200 decoration-[1.5px] underline-offset-[8px]">
                exam
              </span>
            </h1>

            <p className="mt-8 max-w-md text-[14.5px] leading-[1.9] text-gray-600">
              Timed mock exams, verified questions, revision notes, and performance tracking that shows exactly
              where you need to improve before exam day.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Start Practicing Free
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Support Propeida
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border border-gray-100 bg-gray-50/70 sm:translate-x-3.5 sm:translate-y-3.5"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl border border-gray-100 bg-white/60 sm:translate-x-2 sm:translate-y-2"
            />

            <div className="relative rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_20px_44px_-36px_rgba(37,99,235,0.18)] sm:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Mock examination
                </p>
                <span className="text-[11.5px] tabular-nums text-gray-500">
                  24:12 <span className="text-gray-300">left</span>
                </span>
              </div>

              <div className="mt-5 border-t border-gray-100" />

              <div className="mt-5 flex items-baseline justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-400">
                  Question 7 of 40
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-700">
                  Use of English
                </p>
              </div>

              <p className="mt-4 text-[15px] font-medium leading-snug text-gray-900">
                A candidate scores 65 in Mathematics and 58 in English. What is the average of the two scores?
              </p>

              <div className="mt-6 space-y-2.5">
                {OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 ${
                      opt.selected ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-medium ${
                        opt.selected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span
                      className={`text-[13.5px] tabular-nums ${
                        opt.selected ? 'text-blue-800' : 'text-gray-700'
                      }`}
                    >
                      {opt.text}
                    </span>
                    {opt.selected && (
                      <span className="ml-auto text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700">
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-400">
                    Progress
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-700">
                    35% complete
                  </span>
                </div>
                <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-gray-200/60">
                  <div className="h-full w-[35%] rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}