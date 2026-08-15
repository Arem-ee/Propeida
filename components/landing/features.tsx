import { Check } from 'lucide-react'

const TRACKED_SUBJECTS = [
  { label: 'English', pct: 78 },
  { label: 'Mathematics', pct: 64 },
  { label: 'Physics', pct: 52 },
]

const VERIFICATION_STEPS = [
  'Recollected from candidates who actually sat the paper',
  'Checked, corrected, and reworked by hand',
  'Reviewed again before it is allowed into a mock',
]

export default function LandingFeatures() {
  return (
    <section id="features" className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Features</p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.16] tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to prepare properly
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-12 lg:col-span-7">
            <p className="text-[11px] font-medium italic text-blue-700">01</p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900 sm:text-[22px]">
              Mock Exams
            </h3>
            <p className="mt-4 max-w-md text-[14px] leading-[1.85] text-gray-600">
              Sit the real format with a timer, a question palette, and a score you can trust before the day that
              matters.
            </p>

            <div className="mt-12 rounded-xl border border-gray-200/70 bg-white p-5 sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Use of English · Mock
                </p>
                <span className="text-[11px] tabular-nums text-gray-500">
                  26:05 <span className="text-gray-300">left</span>
                </span>
              </div>
              <div className="mt-4 border-t border-gray-100" />
              <p className="mt-4 text-[13.5px] leading-relaxed text-gray-800">
                The word <span className="italic">candid</span>, as used in the passage, is nearest in meaning
                to&hellip;
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-50 text-[10px] font-medium text-gray-500">
                    A
                  </span>
                  <span className="text-[12.5px] text-gray-700">honest</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-medium text-white">
                    B
                  </span>
                  <span className="text-[12.5px] text-blue-800">brief</span>
                  <span className="ml-auto text-[9px] font-medium uppercase tracking-[0.14em] text-blue-700">
                    Selected
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-gray-400">
                  30 answered
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-gray-400">
                  10 flagged
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] lg:col-span-5">
            <p className="text-[11px] font-medium italic text-blue-700">02</p>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">Revision Notes</h3>
            <p className="mt-4 text-[14px] leading-[1.85] text-gray-600">
              Short notes that get you through a topic in minutes, not hours. Written to be read, then applied.
            </p>

            <div className="mt-12 rounded-xl border border-gray-200/70 bg-gray-50/50 p-5 sm:p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Biology · Summary
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-gray-700">
                &ldquo;Meiosis produces four genetically different daughter cells, each with half the chromosome
                number of the parent.&rdquo;
              </p>
              <p className="mt-3 text-[10.5px] italic text-gray-400">Read in about four minutes</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] lg:col-span-4">
            <p className="text-[11px] font-medium italic text-blue-700">03</p>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">Performance Tracking</h3>
            <p className="mt-4 text-[14px] leading-[1.85] text-gray-600">
              Every session is recorded, so weak subjects become obvious long before exam day.
            </p>

            <div className="mt-12 space-y-5">
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

          <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-10 lg:col-span-8">
            <div>
              <p className="text-[11px] font-medium italic text-blue-700">04</p>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">Verified Questions</h3>
              <p className="mt-4 max-w-md text-[14px] leading-[1.85] text-gray-600">
                Recollections from past candidates, checked and reworked by hand before they ever appear. If a
                question is in Propeida, a person has read it.
              </p>
            </div>

            <ul className="mt-12 space-y-3.5">
              {VERIFICATION_STEPS.map((step) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-3 w-3 text-blue-700" strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] leading-relaxed text-gray-600">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}