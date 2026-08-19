import Link from 'next/link'
import { ArrowRight, Check, Smartphone } from 'lucide-react'

const OPTIONS = [
  { key: 'A', text: '60.5', selected: false },
  { key: 'B', text: '62.0', selected: false },
  { key: 'C', text: '61.5', selected: true },
  { key: 'D', text: '61.0', selected: false },
]

const VERIFICATION_STEPS = [
  'Recollected from candidates who actually sat the paper',
  'Checked, corrected, and reworked by hand',
  'Reviewed again before it is allowed into a mock',
]

const TRACKED_SUBJECTS = [
  { label: 'English', pct: 78 },
  { label: 'Mathematics', pct: 64 },
  { label: 'Physics', pct: 52 },
]

export default function LandingPractice() {
  return (
    <section id="features" className="border-t border-gray-100 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Practice</p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          Practice like the real thing.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          Timed. Scored. Honest about what you know.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_20px_44px_-36px_rgba(37,99,235,0.18)] sm:p-9 lg:col-span-7">
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

          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-8 lg:col-span-5">
            <h3 className="text-lg font-semibold text-gray-900">Questions you can trust</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-gray-600">
              If a question is in Propeida, a person has read it.
            </p>

            <ul className="mt-7 space-y-3.5">
              {VERIFICATION_STEPS.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-3 w-3 text-blue-700" strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] leading-relaxed text-gray-600">{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Performance tracking
              </p>
              <div className="mt-3 space-y-4">
                {TRACKED_SUBJECTS.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                        {row.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-gray-500">{row.pct}%</span>
                    </div>
                    <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-gray-200/60">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                UNILORIN &middot; Live now
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                JAMB &middot; Coming
              </span>
            </div>

            <div className="mt-8 flex items-start gap-3 border-t border-gray-100 pt-7">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <p className="text-[13px] leading-relaxed text-gray-600">
                Works on any phone. Text-first and light, so a full mock exam uses little data.
              </p>
            </div>

            <Link
              href="/signup"
              className="mt-8 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Start practicing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}