import { Zap, Clock, Target, ShieldCheck } from 'lucide-react'

export default function MarketingBenefits() {
  const points = [
    {
      icon: Zap,
      title: 'Active recall beats reading notes',
      description:
        'Passive reading gives you a false sense of progress. Answering actual exam questions forces your brain to retrieve information, which creates strong memory paths that last until your exam day.',
    },
    {
      icon: Clock,
      title: 'Master the exact exam pacing',
      description:
        'Most students fail because they run out of time. Practicing under a strict live countdown timer helps you develop a reliable pace for each subject, ensuring you finish with minutes to spare.',
    },
    {
      icon: Target,
      title: 'Target your exact weak spots',
      description:
        'Re-studying what you already know is a waste of valuable hours. Propeida tracks your wrong answers and flags exactly which topics require your attention so you can focus on what gets you marks.',
    },
    {
      icon: ShieldCheck,
      title: 'Neutralize exam-day anxiety',
      description:
        'Anxiety comes from facing the unknown. Completing full-length mock exams that mirror the actual computer-based test interface makes the official exam feel like just another practice run.',
    },
  ]

  return (
    <section id="benefits" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Why practice beats passive reading
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Reading textbooks over and over will not prepare you for computer-based testing. Success is a practical skill built by answering real questions under exam pressure.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point, index) => {
            const Icon = point.icon
            return (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">{point.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
