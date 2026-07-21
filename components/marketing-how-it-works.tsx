import { UserCheck, Activity, GraduationCap, Flame } from 'lucide-react'

export default function MarketingHowItWorks() {
  const steps = [
    {
      num: '01',
      icon: UserCheck,
      title: 'Select your target exam',
      description:
        'Sign up and select your upcoming exam (JAMB, WAEC, Post-UTME). Configure your preferred combination of subjects in under 30 seconds.',
    },
    {
      num: '02',
      icon: Activity,
      title: 'Take a diagnostic mock',
      description:
        'Complete a timed baseline test. The scoring engine calculates your starting score and breaks down exactly where you lost marks.',
    },
    {
      num: '03',
      icon: Flame,
      title: 'Drill weak areas daily',
      description:
        'Answer filtered topic questions, review the high-yield explanations, and practice until your topic accuracy exceeds 80%.',
    },
    {
      num: '04',
      icon: GraduationCap,
      title: 'Pass with complete confidence',
      description:
        'Walk into your official CBT center knowing exactly how to allocate your minutes. The actual exam will feel like another simple practice run.',
    },
  ]

  return (
    <section id="how-it-works" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A straightforward path to your cut-off score
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Exam success is not about luck or memorizing entire textbooks. It is a structured process of finding what you do not know and practicing until you do.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="relative flex flex-col items-start bg-white rounded-xl border border-gray-100 p-6 shadow-3xs">
                <div className="flex w-full justify-between items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-blue-100">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
