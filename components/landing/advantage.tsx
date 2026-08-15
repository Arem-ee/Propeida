export default function LandingAdvantage() {
  return (
    <section className="bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-700">
            Why students choose Propeida
          </p>
          <h2 className="mt-6 text-3xl font-medium leading-[1.15] tracking-tight text-gray-900 sm:text-4xl">
            Built for the way Nigerian students actually prepare
          </h2>
        </div>

        <div className="mt-16 grid gap-4 sm:gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-8 sm:p-12 lg:col-span-8">
            <p className="font-serif text-[11.5px] italic text-navy-700">01</p>
            <p className="mt-6 max-w-md font-serif text-[24px] font-medium leading-[1.4] tracking-tight text-gray-900 sm:text-[28px]">
              Two exams. One place to practise them.
            </p>
            <p className="mt-6 max-w-lg text-[14px] leading-[1.9] text-gray-600">
              JAMB and the Post-UTME decide admission. Propeida practises both the same way they are taken&mdash;
              timed, scored, and honest about where you stand.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-gray-200/70 bg-white p-8 lg:col-span-4">
            <div>
              <p className="font-serif text-[11.5px] italic text-navy-700">02</p>
              <h3 className="mt-4 text-xl font-medium tracking-tight text-gray-900">
                University-specific preparation
              </h3>
              <p className="mt-4 text-[14px] leading-[1.85] text-gray-600">
                UNILORIN Post-UTME today, other universities after. Shaped by what past candidates actually sat.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-navy-200 bg-navy-50/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-800">
                UNILORIN &middot; Live
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                More coming
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-gray-100 pt-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
          <h3 className="text-lg font-medium tracking-tight text-gray-900">Works on any phone</h3>
          <p className="max-w-md text-[14px] leading-[1.85] text-gray-600 sm:text-right">
            Text-first and light. A full mock exam uses little data&mdash;even on the networks students actually
            live on.
          </p>
        </div>
      </div>
    </section>
  )
}