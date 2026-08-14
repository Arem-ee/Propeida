import Link from 'next/link'

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto max-w-6xl px-5 pt-16 sm:pt-24 lg:pt-28 pb-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
              Practice JAMB and Post-UTME the way you&apos;ll take the real{' '}
              <span className="inline-block translate-y-1 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-3xl font-bold text-blue-700 sm:text-4xl">
                exam
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-gray-600">
              Timed mock exams, verified questions, revision notes, and performance tracking that shows exactly
              where you need to improve before exam day.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Start Practicing Free
              </Link>
              <Link
                href="/support"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Support Propeida
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-blue-200/40 blur-[110px]" aria-hidden="true" />
            <div className="pointer-events-none absolute -left-16 -bottom-28 h-80 w-80 rounded-full bg-sky-100/70 blur-[90px]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-56 -translate-y-1/2 rounded-full bg-blue-100/40 blur-3xl" aria-hidden="true" />

            <div className="relative rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-blue-900/10 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Mock Exam</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                  24:12 left
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Question 7 of 40</p>
                  <p className="text-xs font-semibold text-blue-600">12 answered</p>
                </div>
                <p className="mt-3 text-base font-bold leading-snug text-gray-900">
                  A candidate scores 65 in Mathematics and 58 in English. What is the average of the two scores?
                </p>
              </div>

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
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        opt.selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className={`text-sm font-semibold ${opt.selected ? 'text-blue-800' : 'text-gray-700'}`}>
                      {opt.text}
                    </span>
                    {opt.selected && <span className="ml-auto text-[11px] font-bold text-blue-600">Selected</span>}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-1/3 rounded-full bg-blue-600" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-gray-400">
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