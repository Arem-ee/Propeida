import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import InquiryForm from '@/components/inquiry-form'
import PageTrack from '@/components/page-track'
import { Landmark, Building2, HandHeart, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How Propeida is funded',
  alternates: { canonical: '/funding' },
  description:
    'Students never pay for learning on Propeida. Schools, tutorial centers, foundations, alumni associations, and sponsors fund student access.',
  keywords: [
    'how Propeida is funded',
    'free exam prep for Nigerian students',
    'education funding Nigeria',
    'school partnership program',
    'funding exam access for students',
  ],
  openGraph: {
    title: 'How Propeida is funded',
    description:
      'Students never pay for learning on Propeida. Schools, tutorial centers, foundations, alumni associations, and sponsors fund student access.',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
}

const funders = [
  {
    icon: Building2,
    title: 'Schools & tutorial centers',
    description:
      'Pay an annual plan to run their students’ preparation — mock administration, progress reports, and institutional dashboards.',
  },
  {
    icon: Landmark,
    title: 'Foundations & NGOs',
    description:
      'Fund preparation for specific populations or regions, with measurable impact reports on every cohort.',
  },
  {
    icon: HandHeart,
    title: 'Sponsors & alumni',
    description:
      'Sponsor a school or class of students and follow their progress to admission.',
  },
  {
    icon: ShieldCheck,
    title: 'Institutional exam administration',
    description:
      'Schools and exam bodies run their own timed CBT exams on the platform — a paid service, never a student charge.',
  },
]

export default function FundingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <PageTrack event="visit-funding" />
      <main>
        <section className="bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                How Propeida is funded
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                We say it plainly: <strong className="text-gray-900">students never pay for learning on Propeida.</strong>{' '}
                Institutions and sponsors fund access — because every prepared student benefits the whole country.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-blue-600 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The goal: every Nigerian student can prepare, free.
              </h2>
              <p className="mt-6 text-lg text-blue-100 leading-relaxed">
                Not every student who deserves admission can afford a single past-question pack, let alone a mock
                season. Our aim is a day when preparation on Propeida is as normal as carrying a phone — free
                regardless of income, school, or where you live. We start with UNILORIN Post-UTME today. JAMB is
                next. Then your university. Funding widens reach; it never narrows it.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {funders.map((funder, idx) => {
                const Icon = funder.icon
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{funder.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{funder.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">The promise</h2>
              <ul className="mt-8 space-y-4">
                {[
                  'No student is ever charged for learning on Propeida.',
                  'We do not sell student data. Partners fund access — they do not buy students.',
                  'Every question is checked by a person before it is published.',
                  'Sponsorship is measured: schools reached, questions practiced, scores improved, admissions gained.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-xl border border-gray-100 bg-white p-6">
                <h3 className="font-bold text-gray-900">Where the money goes</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Infrastructure that keeps the platform fast on Nigerian networks. Compensation for the people who
                  check every question. And the work of building the next exam banks — JAMB is next, and your
                  university could follow. Funding widens reach; it never narrows it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 lg:gap-16">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Fund access, or fund it forward
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Whether you are a school running preparation, a foundation funding cohorts, or a sponsor following a
                class to admission, the model is the same: students learn free, and the people who believe in
                prepared students make it possible.
              </p>
            </div>
            <InquiryForm
              type="funding"
              title="Talk to the team"
              description="Partnership, sponsorship, or funding conversations start here."
              organizationLabel="Organization (optional)"
              organizationPlaceholder="e.g. ABC Foundation"
              messagePlaceholder="How would you like to be part of Propeida?"
              ctaLabel="Send message"
            />
          </div>
        </section>
      </main>
      <MarketingFooter />
      <WhatsAppFloat />
    </div>
  )
}