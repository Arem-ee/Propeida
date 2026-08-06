import Link from 'next/link'
import { HandHeart, School, GraduationCap, TrendingUp, ArrowRight } from 'lucide-react'

export default function MarketingSponsor() {
  const steps = [
    {
      icon: School,
      title: 'Pick a school or class',
      description: 'Choose a secondary school, tutorial center, or a class of students you want to reach.',
    },
    {
      icon: GraduationCap,
      title: 'We run their preparation',
      description: 'Students get the full platform free — questions, mocks, explanations, and progress tracking.',
    },
    {
      icon: TrendingUp,
      title: 'You see real impact',
      description: 'Monthly reports: practice completed, mock scores, and improvement. No vague donation receipts.',
    },
  ]

  return (
    <section id="sponsor" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
              <HandHeart className="h-4 w-4" />
              Sponsor a school
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Some students can&apos;t afford the preparation that admission demands. You can change that.
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Sponsor a school or a class of students — we run their practice, track their progress, and report
              their results back to you. Every naira is accounted for in questions practiced and scores improved.
            </p>
            <div className="mt-8">
              <Link
                href="/sponsor"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
              >
                Sponsor a School
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}