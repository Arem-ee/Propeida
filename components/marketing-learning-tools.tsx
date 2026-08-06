import { BookOpen, CalendarClock, Flame, Trophy, History, Users } from 'lucide-react'

export default function MarketingLearningTools() {
  const tools = [
    {
      icon: BookOpen,
      title: 'Explanations',
      description: 'Every question has a clear, human-written explanation — why the right answer is right and how the wrong ones are wrong.',
    },
    {
      icon: CalendarClock,
      title: 'Daily Question',
      description: 'One free exam question every day on WhatsApp, answered in seconds. A small habit that compounds into readiness.',
    },
    {
      icon: Flame,
      title: 'Streaks',
      description: 'Practice daily and watch your streak build. Consistency before exam day becomes confidence on exam day.',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Per-exam leaderboards that keep you honest and sharp. Compete with yourself first, then your peers.',
    },
    {
      icon: History,
      title: 'Progress History',
      description: 'A permanent record of every session, score, and improvement. Watch your accuracy climb as the exam approaches.',
    },
    {
      icon: Users,
      title: 'Students Learning With Propeida',
      description: 'Real students practicing today, tracked on live platform statistics below. The more prepared we all are, the fairer it gets.',
    },
  ]

  return (
    <section id="learning-tools" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Tools that turn practice into preparation
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Honest support for a candidate who is genuinely preparing — not a trick to keep you paying.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, idx) => {
            const Icon = tool.icon
            return (
              <div
                key={idx}
                className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{tool.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}