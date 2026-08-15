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

        <div className="mt-16 space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-11 lg:col-span-2">
              <p className="text-[11px] font-medium italic text-blue-700">01</p>
              <h3 className="mt-4 max-w-sm text-xl font-semibold text-gray-900 sm:text-2xl">
                JAMB and Post-UTME Practice
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-[1.85] text-gray-600">
                The two exams that decide admission, in one place. Same timer, same format, same honest score.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-10">
              <p className="text-[11px] font-medium italic text-blue-700">02</p>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">University-specific Preparation</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-gray-600">
                UNILORIN Post-UTME today, other universities after. Questions shaped by what past candidates
                actually sat.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
            <h3 className="text-lg font-semibold text-gray-900">Works on Any Phone</h3>
            <p className="max-w-md text-[15px] leading-[1.85] text-gray-600 sm:text-right">
              Text-first and light. A full mock exam uses little data, even on the networks students actually
              live on.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}