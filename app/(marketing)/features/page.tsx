import type { Metadata } from 'next'
import Link from 'next/link'
import { Timer, Target, BarChart3, BookOpen, NotebookPen, Zap, TrendingUp } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'

export const metadata: Metadata = {
  title: 'Features',
  alternates: { canonical: '/features' },
  description:
    'Learn a topic. Keep it. Perform under exam conditions. Lessons, timed mocks, and reviews for JAMB and Post-UTME.',
}

const featureTiles = [
  {
    icon: BookOpen,
    title: 'Lessons teach first',
    description:
      'We teach before we test. Each lesson covers one small idea. You see a worked example, answer a quick check, and only then practise.',
    color: 'bg-rose-100 text-rose-600',
    hero: true,
  },
  {
    icon: Timer,
    title: 'Mocks like the real exam',
    description:
      'A full-length timed mock that mirrors the real computer-based test screen. The countdown runs on screen and the exam submits itself when time expires. No paper, no PDF, no second screen.',
    color: 'bg-blue-100 text-blue-600',
    hero: true,
  },
  {
    icon: Target,
    title: 'Practice that explains',
    description:
      'Answer one question. Get the explanation straight away. Learn from the mistake, not just the score.',
    color: 'bg-green-100 text-green-600',
    hero: false,
  },
  {
    icon: Zap,
    title: 'We name your mix-up',
    description:
      'When you miss one, we name the error kindly and show the missing relationship. Then we point to the lesson that repairs it.',
    color: 'bg-amber-100 text-amber-600',
    hero: false,
  },
  {
    icon: BarChart3,
    title: 'It finds your weak subjects',
    description:
      'A short check at the start places you by doing, not by survey. After every practice your progress shows which subjects are secure, which are developing, and what to work on next.',
    color: 'bg-purple-100 text-purple-600',
    hero: false,
  },
  {
    icon: TrendingUp,
    title: 'Review that remembers',
    description:
      'Topics return before you forget them, on a schedule tuned to your exam date. Each review proves it stuck.',
    color: 'bg-indigo-100 text-indigo-600',
    hero: false,
  },
  {
    icon: NotebookPen,
    title: 'Counts learning, never punishes',
    description:
      'Propeida counts days with a finished practice or lesson — never mere logins. Pauses do not erase anything. There are no streak threats, no public ranks, no shame. Only learning.',
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
            Learn a topic. Keep it. Perform under exam conditions. Propeida is not
            a question bank with a chatbot attached. It is the system around the
            questions.
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
            See our <Link href="/pricing" className="font-bold text-blue-600 hover:text-blue-700">plans and access options</Link> — start free, then upgrade when you need more.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
