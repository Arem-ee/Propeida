import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, BookOpenCheck, ShieldCheck, Server, School, FileCheck, ArrowRight, Users, Sparkles } from 'lucide-react'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import ContributionCard from '@/components/support/contribution-card'

export const metadata: Metadata = {
  title: 'Support Propeida',
  alternates: { canonical: '/support' },
  description:
    'Help Propeida keep improving quality exam preparation for Nigerian students. Support covers content, revision notes, hosting, and maintenance.',
}

const FUND_ITEMS = [
  {
    icon: FileCheck,
    title: 'Verified exam questions',
    description: 'Funding the careful, hand-checked work that keeps our question bank trustworthy.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BookOpenCheck,
    title: 'Revision notes',
    description: 'Writing and refining short, exam-focused revision notes for more topics.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Server,
    title: 'Platform hosting',
    description: 'Keeping the platform fast and reliable for students practicing every day.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: ShieldCheck,
    title: 'Security and maintenance',
    description: 'Ongoing security, updates, and behind-the-scenes work that users never see.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: School,
    title: 'New university and exam coverage',
    description: 'Preparing verified material for more institutions and future exam coverage.',
    color: 'bg-indigo-100 text-indigo-600',
  },
]

const TRANSPARENCY_POINTS = [
  {
    title: 'Propeida is still growing',
    description: 'We are a small team building in the open, one improvement at a time.',
  },
  {
    title: 'The platform is actively being improved',
    description: 'New questions, notes, and features ship regularly as we expand coverage.',
  },
  {
    title: 'Support funds content and infrastructure',
    description: 'Contributions go toward verified content creation, hosting, and maintenance.',
  },
  {
    title: 'Support is optional',
    description: 'Contribute or not — you can keep preparing with Propeida either way.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main>
        <section className="bg-gray-900 py-20 sm:py-24 text-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20">
              <Heart className="h-7 w-7 text-blue-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Help improve Propeida</h1>
            <p className="mt-5 text-lg text-gray-300 leading-relaxed">
              We&apos;re building Propeida to make quality exam preparation more accessible for Nigerian
              students. Your support helps us expand our question bank, improve revision notes, maintain
              the platform, and prepare for future exam coverage.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contribute"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
              >
                <Heart className="h-4 w-4" />
                Support Propeida
              </a>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-600 px-6 py-3 text-sm font-bold text-gray-200 hover:border-gray-400 min-h-[44px]"
              >
                Continue practicing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">What support helps fund</h2>
              <p className="mt-3 text-base text-gray-500">
                Simple, transparent breakdown of where contributions go.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FUND_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-700">And the work students never see</p>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  Support also funds the day-to-day work of running a growing platform responsibly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Where we are, honestly</h2>
              <p className="mt-3 text-base text-gray-500">
                No hype. Just a clear picture of the platform we&apos;re building.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TRANSPARENCY_POINTS.map((point) => (
                <div key={point.title} className="rounded-xl border border-gray-100 bg-white p-5">
                  <p className="text-sm font-extrabold text-gray-900">{point.title}</p>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contribute" className="py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Contribute</h2>
              <p className="mt-3 text-base text-gray-500">
                Support the work behind Propeida, at any amount that works for you.
              </p>
            </div>
            <ContributionCard />
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-5">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-900">No contribution? No problem.</span>{' '}
                Whether you support financially or simply tell another student about Propeida, you&apos;re
                helping us build a better exam preparation platform.
              </p>
            </div>
            <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-gray-400">
              <Users className="h-4 w-4" />
              Students can keep preparing with Propeida whether they contribute or not.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
