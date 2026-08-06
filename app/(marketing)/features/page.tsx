import type { Metadata } from 'next'
import Link from 'next/link'
import { Timer, Target, BarChart3, BookOpen, Trophy, Zap, TrendingUp } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Practice JAMB and Post-UTME past questions with CBT mock exam simulators, topic drills, and performance analytics built for Nigerian students.',
}

const featureTiles = [
  {
    icon: Timer,
    title: 'CBT Mock Exam Mode',
    description:
      'A full-length timed mock exam that mirrors the real computer-based test screen. Set the number of questions and time limit per exam. The countdown clock runs on screen and the exam auto-submits when time expires. No paper, no PDF, no browser tabs to cheat with.',
    color: 'bg-blue-100 text-blue-600',
    hero: true,
  },
  {
    icon: Target,
    title: 'Practice Mode',
    description:
      'Pick one subject at a time and go through questions one by one. Every question shows the correct answer and an explanation immediately after you answer. No timer, no pressure. Focus on understanding each topic before moving to the next.',
    color: 'bg-green-100 text-green-600',
    hero: true,
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description:
      'After every session, see your score, accuracy percentage, time taken, and a per-subject breakdown of which topics you got right and wrong. The dashboard highlights your weakest subject so you know where to focus next.',
    color: 'bg-purple-100 text-purple-600',
    hero: false,
  },
  {
    icon: BookOpen,
    title: 'Step-by-Step Explanations',
    description:
      'Every question includes an explanation of the correct answer. In practice mode the explanation appears right after you answer. In mock mode it becomes available when the session ends. Use them to learn from mistakes, not just collect scores.',
    color: 'bg-amber-100 text-amber-600',
    hero: false,
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description:
      'See how you rank against other students on the all-time and weekly leaderboards. Filter by your school to see where you stand among classmates. Rankings use a fair formula that accounts for both accuracy and question volume.',
    color: 'bg-rose-100 text-rose-600',
    hero: false,
  },
  {
    icon: Zap,
    title: 'Streak Tracking',
    description:
      'A daily streak counter rewards consistent practice. Complete a session or answer the daily question every day to keep your streak alive. The dashboard shows your current streak and your longest streak.',
    color: 'bg-cyan-100 text-cyan-600',
    hero: false,
  },
  {
    icon: TrendingUp,
    title: 'Daily Question',
    description:
      'One fresh question every day, the same for every user. Answer it to keep your streak going and see how you compare. The daily question is cached and loads instantly even on slow connections.',
    color: 'bg-indigo-100 text-indigo-600',
    hero: false,
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Features</h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Every feature in Propeida serves one purpose: helping you practice effectively on the device and network you already have.
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
          {featureTiles.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`rounded-xl border border-gray-100 bg-white p-6 ${
                  feature.hero ? 'sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div className={`rounded-xl p-3 w-fit ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mx-auto max-w-3xl mt-16 rounded-xl border border-gray-100 bg-gray-50/30 p-6 text-center">
          <p className="text-sm text-gray-500">
            See the full list of <Link href="/#exams" className="font-bold text-blue-600 hover:text-blue-700">supported exams</Link> or read{' '}
            <Link href="/funding" className="font-bold text-blue-600 hover:text-blue-700">how Propeida is funded</Link> — free for students, always.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
