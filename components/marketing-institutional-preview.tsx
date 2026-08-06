import { BarChart3, FileQuestion, ShieldAlert, Activity, BadgeCheck } from 'lucide-react'

export default function MarketingInstitutionalPreview() {
  const bars = [
    { label: 'Class A', width: '78%', tone: 'bg-blue-600' },
    { label: 'Class B', width: '64%', tone: 'bg-blue-500' },
    { label: 'Class C', width: '51%', tone: 'bg-blue-400' },
    { label: 'Class D', width: '70%', tone: 'bg-blue-500' },
  ]

  return (
    <section id="institutions" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
              <BarChart3 className="h-4 w-4" />
              For institutional partners
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What a partnered school sees
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              A preview of the institutional dashboard our partners receive. Class performance, weak topics,
              practice activity, and mock scores — enough to run preparation like a professional program.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { icon: FileQuestion, text: 'Class performance by subject' },
                { icon: ShieldAlert, text: 'Weak topics flagged per class and student' },
                { icon: Activity, text: 'Practice activity over time' },
                { icon: BadgeCheck, text: 'Mock scores and exam-readiness estimates' },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <div className="text-sm font-bold text-gray-900">Class Performance — Mock 3</div>
                <div className="text-xs text-gray-400">Sample preview · real dashboards coming to partners</div>
              </div>
              <span className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">Preview</span>
            </div>

            <div className="space-y-5">
              {bars.map((bar, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                    <span>{bar.label}</span>
                    <span>{bar.width}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div className={`h-2.5 rounded-full ${bar.tone}`} style={{ width: bar.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="text-xs text-gray-400">Weakest topic</div>
                <div className="mt-1 text-sm font-bold text-gray-900">Properties of Materials</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="text-xs text-gray-400">Improvement, last 4 weeks</div>
                <div className="mt-1 text-sm font-bold text-green-600">+18%</div>
              </div>
            </div>

            <p className="mt-6 rounded-xl bg-white border border-gray-100 p-4 text-xs text-gray-400 leading-relaxed">
              Values shown are placeholders. Real schools, classes, and results appear here once a partner joins.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}