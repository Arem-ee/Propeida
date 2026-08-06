import { BookOpenCheck, Layers, Users, School } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

export default function MarketingTrustMetrics() {
  const m = siteConfig.trustMetrics

  const metrics = [
    { icon: BookOpenCheck, value: m.verifiedQuestions, note: m.verifiedQuestionsNote },
    { icon: Layers, value: m.unilorinQuestions, note: m.unilorinNote },
    { icon: Users, value: m.activeStudents, note: m.activeStudentsNote },
    { icon: School, value: m.universitiesSupported, note: m.universitiesSupportedNote },
  ]

  return (
    <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {metrics.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-gray-900">{item.value}</div>
                  <div className="mt-0.5 text-sm text-gray-500">{item.note}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}