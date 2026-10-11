import { Check, X, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface ComparisonRow {
  feature: string
  detail: string
  free: boolean | string
  pro: boolean | string
  traditional: boolean | string
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Verified Past Questions',
    detail: 'Recollected by actual candidates, hand-checked and reworked for accuracy',
    free: '30 Questions / exam',
    pro: 'Unlimited Full Access',
    traditional: 'Often outdated / unverified',
  },
  {
    feature: 'Timed CBT Mock Simulator',
    detail: 'Authentic examination format with realistic countdown and scoring',
    free: '1 Mock / exam',
    pro: 'Unlimited Timed Mocks',
    traditional: 'Paper only / Clunky apps',
  },
  {
    feature: 'Step-by-Step Solutions',
    detail: 'Clear explanations for every question so you understand the logic',
    free: true,
    pro: true,
    traditional: 'Answer key only (no breakdown)',
  },
  {
    feature: 'University Post-UTME Banks',
    detail: 'School-specific past questions formatted to each institution’s style',
    free: false,
    pro: true,
    traditional: 'Generic non-specific questions',
  },
  {
    feature: 'Speed & Performance Analytics',
    detail: 'Track accuracy by subject, time per question, and improvement trajectory',
    free: false,
    pro: true,
    traditional: false,
  },
  {
    feature: 'Career & Course Discovery',
    detail: 'Explore future job markets, required skills, and university offerings',
    free: true,
    pro: true,
    traditional: false,
  },
  {
    feature: 'Ultra-Light Mobile & Data Saver',
    detail: 'Runs lightning-fast on budget Android phones without heavy data consumption',
    free: true,
    pro: true,
    traditional: 'Heavy PDF / Slow downloads',
  },
]

export default function LandingComparisonTable() {
  return (
    <section id="compare" className="border-t border-gray-100 bg-gray-50/50 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Compare Options
          </p>
          <h2 className="mt-3 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
            Why Nigerian students prepare with Propeida
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-gray-600">
            A clear comparison showing everything included across all tiers with transparent pricing and no surprises.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03),0_20px_40px_-24px_rgba(37,99,235,0.08)]">
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="w-[38%] p-4 text-xs font-bold uppercase tracking-wider text-gray-500 sm:p-6">
                    Feature & Coverage
                  </th>
                  <th className="w-[20%] p-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700 sm:p-6">
                    <span className="block text-sm font-semibold text-gray-900">Free Practice</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-gray-500">₦0 forever</span>
                  </th>
                  <th className="w-[22%] bg-blue-50/60 p-4 text-center text-xs font-bold uppercase tracking-wider text-blue-900 sm:p-6">
                    <div className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      <Sparkles className="h-3 w-3" /> Pro Pass
                    </div>
                    <span className="mt-1 block text-sm font-bold text-blue-700">₦1,500</span>
                  </th>
                  <th className="w-[20%] p-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400 sm:p-6">
                    <span className="block text-sm font-medium text-gray-500">Old Prep Books</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-gray-400">Paper / PDFs</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {COMPARISON_ROWS.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={`transition-colors hover:bg-gray-50/50 ${
                      index % 2 === 1 ? 'bg-gray-50/20' : 'bg-white'
                    }`}
                  >
                    <td className="p-4 sm:p-6">
                      <p className="font-semibold text-gray-900">{row.feature}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{row.detail}</p>
                    </td>

                    {/* Free column */}
                    <td className="p-4 text-center sm:p-6">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                              <X className="h-4 w-4 stroke-[2]" />
                            </span>
                          </div>
                        )
                      ) : (
                        <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {row.free}
                        </span>
                      )}
                    </td>

                    {/* Pro column */}
                    <td className="bg-blue-50/40 p-4 text-center sm:p-6">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                              <X className="h-4 w-4 stroke-[2]" />
                            </span>
                          </div>
                        )
                      ) : (
                        <span className="inline-block rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                          {row.pro}
                        </span>
                      )}
                    </td>

                    {/* Traditional column */}
                    <td className="p-4 text-center sm:p-6">
                      {typeof row.traditional === 'boolean' ? (
                        row.traditional ? (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                              <Check className="h-4 w-4 stroke-[2]" />
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                              <X className="h-4 w-4 stroke-[2]" />
                            </span>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">
                          {row.traditional}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/80 p-6 sm:flex-row sm:px-8">
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Instant activation via Paystack &middot; Verified syllabus alignment</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
