export default function LandingFeatures() {
  return (
    <section id="features" className="bg-gray-50/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Features</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-tight text-gray-900 sm:text-[44px]">
            Everything you need to prepare properly
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="col-span-2 flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-7 sm:p-8">
            <div>
              <p className="text-xs font-bold text-blue-600">01</p>
              <h3 className="mt-3 text-lg font-bold text-gray-900">Mock Exams</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
                Sit the real format with a timer, a question palette, and a score you can trust before the day
                that matters.
              </p>
            </div>
            <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50/50 p-5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>Mock session</span>
                <span className="text-blue-600">32:05 left</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-3/4 rounded-full bg-blue-600" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-gray-400">
                <span>30 of 40 answered</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold text-blue-600">02</p>
            <h3 className="mt-3 text-lg font-bold text-gray-900">Revision Notes</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
              Short notes that get you through a topic in minutes, not hours. Written to be read, then applied.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold text-blue-600">03</p>
            <h3 className="mt-3 text-lg font-bold text-gray-900">Performance Tracking</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
              Every session is recorded, so weak subjects become obvious long before exam day.
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold text-blue-600">04</p>
            <h3 className="mt-3 text-lg font-bold text-gray-900">Verified Questions</h3>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
              Recollections from past candidates, checked and reworked by hand before they ever appear. If a
              question is in Propeida, a person has read it.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}