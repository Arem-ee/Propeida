import Link from 'next/link'

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pb-16 sm:pt-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h1 className="text-[40px] font-medium leading-[1.06] tracking-tight text-gray-900 sm:text-[52px]">
              Practice JAMB and Post-UTME the way you&apos;ll take the real{' '}
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/70 px-3.5 pb-[0.08em] pt-[0.04em] align-baseline text-[0.78em] font-medium italic leading-none text-blue-700">
                exam
              </span>
            </h1>

            <p className="mt-8 max-w-md text-[15px] leading-[1.9] text-gray-600">
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

          <div className="relative lg:col-span-7 lg:pl-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-blue-100/50 blur-[100px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-sky-50 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-1/2 h-40 -translate-y-1/2 rounded-full bg-blue-50/60 blur-3xl"
            />

            <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_16px_40px_-16px_rgba(15,23,42,0.10)] sm:p-7">
              <div className="flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Mock exam</p>
                <span className="inline-flex items-center gap-2 text-[12px] tabular-nums text-gray-500">
                  <span className="h-1 w-1 rounded-full bg-blue-600/70" aria-hidden="true" />
                  24:12 left
                </span>
              </div>

              <div className="mt-5 border-t border-gray-100" />

              <div className="mt-5 flex items-baseline justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">
                  Question 7 of 40
                </p>
                <p className="text-[11px] font-medium text-blue-700">12 answered</p>
              </div>

              <p className="mt-3 text-[16px] font-medium leading-snug text-gray-900">
                A candidate scores 65 in Mathematics and 58 in English. What is the average of the two scores?
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  { key: 'A', text: '60.5', selected: false },
                  { key: 'B', text: '62.0', selected: false },
                  { key: 'C', text: '61.5', selected: true },
                  { key: 'D', text: '61.0', selected: false },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      opt.selected ? 'border-blue-200 bg-blue-50/60' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium ${
                        opt.selected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className={`text-sm tabular-nums ${opt.selected ? 'text-blue-800' : 'text-gray-700'}`}>
                      {opt.text}
                    </span>
                    {opt.selected && (
                      <span className="ml-auto text-[11px] font-medium text-blue-700">Selected</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-1/3 rounded-full bg-blue-600" />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                  <span>Progress</span>
                  <span>35%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}