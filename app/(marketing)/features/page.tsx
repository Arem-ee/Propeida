import type { Metadata } from 'next'
import Link from 'next/link'
import { Timer, Target, BarChart3, BookOpen, NotebookPen, Zap, TrendingUp } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export const metadata: Metadata = {
  title: 'Features',
  alternates: { canonical: '/features' },
  description:
    'You learn a topic, keep it, and perform under exam conditions, with lessons, timed mocks, and reviews for JAMB and Post-UTME',
}

const featureTiles = [
  {
    icon: BookOpen,
    title: 'Lessons teach first',
    description:
      'We teach before we test, and each lesson covers one small idea, so you see a worked example, answer a quick check, and only then practise',
    color: 'bg-rose-100 text-rose-600',
    hero: true,
  },
  {
    icon: Timer,
    title: 'You sit mocks that feel like the real exam',
    description:
      'You sit a full-length timed mock on a screen that mirrors the real computer-based test, the countdown runs on screen, and the exam submits itself when time expires, with no paper, no PDF, and no second screen',
    color: 'bg-blue-100 text-blue-600',
    hero: true,
  },
  {
    icon: Target,
    title: 'Practice explains every answer',
    description:
      'You answer one question and get the explanation straight away, so you learn from the mistake and not just the score',
    color: 'bg-green-100 text-green-600',
    hero: false,
  },
  {
    icon: Zap,
    title: 'We name your mix-up',
    description:
      'When you miss one, we name the error kindly, show the missing relationship, and then point to the lesson that repairs it',
    color: 'bg-amber-100 text-amber-600',
    hero: false,
  },
  {
    icon: BarChart3,
    title: 'It finds your weak subjects',
    description:
      'A short check at the start places you by doing instead of asking, and after every practice your progress shows which subjects are secure, which are developing, and what to work on next',
    color: 'bg-purple-100 text-purple-600',
    hero: false,
  },
  {
    icon: TrendingUp,
    title: 'Review brings topics back before you forget',
    description:
      'Topics return before you forget them on an expanding-interval schedule, and each review proves it stuck',
    color: 'bg-indigo-100 text-indigo-600',
    hero: false,
  },
  {
    icon: NotebookPen,
    title: 'It counts learning and never punishes you',
    description:
      'Propeida counts days with a finished practice or lesson and never mere logins, pauses do not erase anything, and there are no streak threats, no public ranks, no shame, just learning',
    color: 'bg-cyan-100 text-cyan-600',
    hero: false,
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <main className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">What Propeida does</h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            You learn a topic, you keep it, then you perform under exam conditions, and Propeida is not a question bank with a chatbot attached because it is the whole system around the questions
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
            You can see the full list of <Link href="/#exams" className="font-bold text-blue-600 hover:text-blue-700">supported exams</Link> or read our{' '}
            <Link href="/pricing" className="font-bold text-blue-600 hover:text-blue-700">plans and access options</Link>, and you start free before you upgrade when you need more
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
