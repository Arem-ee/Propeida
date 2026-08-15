export default function LandingFeatures() {
  return (
    <section id="features" className="border-t border-gray-100 bg-gray-50/50 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Features</p>
          <h2 className="mt-5 text-3xl font-medium leading-[1.16] tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to prepare properly
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="col-span-2 flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-10">
            <div>
              <p className="text-[11px] font-medium italic text-blue-700">01</p>
              <h3 className="mt-4 text-[17px] font-semibold text-gray-900 sm:text-lg">Mock Exams</h3>
              <p className="mt-3 max-w-md text-[15px] leading-[1.8] text-gray-600">
                Sit the real format with a timer, a question palette, and a score you can trust before the day
                that matters.
              </p>
            </div>
            <div className="mt-12 rounded-xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">
                  Mock session
                </span>
                <span className="text-[12px] font-medium tabular-nums text-blue-700">32:05 left</span>
              </div>
              <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-gray-200/70">
                <div className="h-full w-3/4 rounded-full bg-blue-600" />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                <span>30 of 40 answered</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-[11px] font-medium italic text-blue-700">02</p>
            <h3 className="mt-4 text-[17px] font-semibold text-gray-900">Revision Notes</h3>
            <p className="mt-3 text-[15px] leading-[1.8] text-gray-600">
              Short notes that get you through a topic in minutes, not hours. Written to be read, then applied.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-[11px] font-medium italic text-blue-700">03</p>
            <h3 className="mt-4 text-[17px] font-semibold text-gray-900">Performance Tracking</h3>
            <p className="mt-3 text-[15px] leading-[1.8] text-gray-600">
              Every session is recorded, so weak subjects become obvious long before exam day.
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.02),0_12px_32px_-20px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-[11px] font-medium italic text-blue-700">04</p>
            <h3 className="mt-4 text-[17px] font-semibold text-gray-900">Verified Questions</h3>
            <p className="mt-3 max-w-md text-[15px] leading-[1.8] text-gray-600">
              Recollections from past candidates, checked and reworked by hand before they ever appear. If a
              question is in Propeida, a person has read it.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}