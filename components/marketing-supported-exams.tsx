import { Compass, Sparkles } from 'lucide-react'

export default function MarketingSupportedExams() {
  const exams = [
    {
      icon: Compass,
      title: 'JAMB (UTME) Simulator',
      description:
        "We're building it the same way we built Post-UTME — real, verified questions, not just filler. Check back soon.",
      badge: 'Coming Soon',
    },
  ]

  return (
    <section id="exams" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Supported examinations
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Whether you are writing a standard national exam or a competitive school-specific entrance test, Propeida covers the actual past question models you will face.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-gray-100 bg-gray-50/20 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-100 transition-all">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 mb-6">
                <Sparkles className="h-4 w-4" />
                Featured Entrance Prep
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
                University Post-UTME Formats
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Post-UTME tests are fast-paced and differ completely by school. Propeida organizes past questions according to specific university patterns. The highly competitive <strong>Unilorin Post-UTME</strong> exam is featured with its strict time constraints and exact subject weightings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-100">Unilorin (Featured)</span>
            </div>
          </div>

          {exams.map((exam, idx) => {
            const Icon = exam.icon
            return (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col justify-between hover:border-blue-100 transition-all"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{exam.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-6">{exam.description}</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">Standard Exam</span>
                  <span className="rounded-xl bg-blue-50/50 px-2.5 py-1 text-xs font-bold text-blue-600">{exam.badge}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
