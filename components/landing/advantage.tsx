export default function LandingAdvantage() {
  return (
    <section className="bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Advantage</p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.16] tracking-tight text-gray-900 sm:text-4xl">
            Built for the way Nigerian students actually prepare
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] sm:p-12 lg:col-span-8">
            <p className="text-[11px] font-medium italic text-blue-700">01</p>
            <h3 className="mt-6 max-w-sm text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              JAMB and Post-UTME Practice
            </h3>
            <p className="mt-5 max-w-lg text-[14px] leading-[1.9] text-gray-600">
              The two exams that decide admission, in one place. Same timer, same format, same honest score.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] lg:col-span-4">
            <div>
              <p className="text-[11px] font-medium italic text-blue-700">02</p>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">
                University-specific Preparation
              </h3>
              <p className="mt-4 text-[14px] leading-[1.85] text-gray-600">
                UNILORIN Post-UTME today, other universities after. Questions shaped by what past candidates
                actually sat.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                UNILORIN &middot; Live now
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                JAMB &middot; Coming
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-gray-100 pt-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">Works on any phone</h3>
          <p className="max-w-md text-[14px] leading-[1.85] text-gray-600 sm:text-right">
            Text-first and light. A full mock exam uses little data, even on the networks students actually live
            on.
          </p>
        </div>
      </div>
    </section>
  )
}