import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import InquiryForm from '@/components/inquiry-form'
import PageTrack from '@/components/page-track'
import { School, GraduationCap, TrendingUp, ShieldCheck, HandHeart, Scale, Wallet, Ruler } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sponsor a school �?" sponsor student access to Propeida',
  alternates: { canonical: '/sponsor' },
  description:
    'Sponsor a school or students on Propeida. We run their JAMB and Post-UTME preparation and report measurable impact back to you.',
  keywords: [
    'sponsor a school in Nigeria',
    'fund student exam preparation',
    'exam sponsorship foundations',
    'measure education impact Nigeria',
    'admission opportunities for students',
  ],
  openGraph: {
    title: 'Sponsor a school — sponsor student access to Propeida',
    description:
      'Sponsor a school or students on Propeida. We run their JAMB and Post-UTME preparation and report measurable impact back to you.',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
}

const inequity = [
  'A secondary-school student in a town with one tutorial center and no reliable electricity cannot compete with a Lagos student surrounded by prep academies.',
  'Past questions and mock rehearsals are a paid market in Nigeria — often ₦5,000 to ₦50,000 per student in a single exam season.',
  'The students who most need practice are the ones with the least access to it. Preparation has become a privilege, and privilege tracks money.',
]

const programs = [
  {
    icon: School,
    title: 'Sponsor a school',
    description:
      'Fund full preparation for a secondary school or tutorial center of your choice. Students practice free; you receive quarterly impact reports.',
  },
  {
    icon: GraduationCap,
    title: 'Sponsor students',
    description:
      'Target a specific graduating class preparing for JAMB or Post-UTME — and follow that exact cohort to their admission results.',
  },
]

const programDetails = [
  { icon: Wallet, title: 'Preparation, not promises', description: 'Every naira funds student practice — question access, mocks, and tracking on the platform. Your exact scope is agreed up front.' },
  { icon: Scale, title: 'Reach', description: 'We match sponsorship to where access hurts most: schools without labs, centers without mock infrastructure, students without data.' },
  { icon: Ruler, title: 'Nothing extra', description: 'Sponsorship covers preparation. It never covers marketing spend or overhead that inflates the cost of helping one student.' },
]

const impactMetrics = [
  { value: 'Questions practiced', detail: 'Every session answer is counted. You see total practice volume for your cohort.' },
  { value: 'Mocks completed', detail: 'Timed, scored mock exams — the exact CBT conditions students will face.' },
  { value: 'Score improvement', detail: 'Before/after accuracy across sessions, question by question.' },
  { value: 'Admission stories', detail: 'Which students earned admission, into which institutions, in which cycle.' },
]

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <PageTrack event="visit-sponsor" />
      <main>
        <section className="bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                <HandHeart className="h-4 w-4" />
                Sponsorship program
              </div>
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Sponsor a school. Change an admission.
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Some students cannot afford the preparation that admission demands. You can change that. Sponsor a
                school or a class of students — we run their practice, track their progress, and report their results
                back to you.
              </p>
              <div className="mt-4 inline-flex items-center rounded-xl bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                Every naira accounted for in questions practiced and scores improved
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Why exam preparation is unequal
              </h2>
              <ul className="mt-8 space-y-4">
                {inequity.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                    <Scale className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-lg text-gray-500 leading-relaxed">
                Sponsorship is the correction: an prepared student, discovered by a funder who believes access areas
                should not follow income. On Propeida, that student practices free — and the change is measurable.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Ways to sponsor</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {programs.map((program, idx) => {
                const Icon = program.icon
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{program.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{program.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">What your sponsorship funds</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {programDetails.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              How impact is measured
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-500 leading-relaxed">
              No vague receipts. Sponsors receive quarterly reports built from live platform data — not projections.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {impactMetrics.map((metric, idx) => (
                <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6">
                  <div className="text-lg font-extrabold text-gray-900">{metric.value}</div>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
              <h3 className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                What we commit to
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  'Students never pay for anything you sponsor.',
                  'Your funds go directly to student access — not marketing.',
                  'Quarterly impact reports with real platform data.',
                  'Named cohorts or anonymous support, your choice.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-gray-700">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 lg:gap-16">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Sponsor a school or students
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                We are currently accepting sponsorship for the 2026/2027 admission cycle. If you represent a
                foundation, alumni association, CSR team, or a family that wants to fund preparation, this is the
                conversation to have.
              </p>
            </div>
            <InquiryForm
              type="sponsor"
              title="Start a sponsorship conversation"
              description="Tell us who you represent and what you want to fund."
              organizationLabel="Organization"
              organizationPlaceholder="e.g. UNILORIN Alumni Association"
              messagePlaceholder="Which school or class would you like to sponsor, and how many students?"
              ctaLabel="Send inquiry"
              full
            />
          </div>
        </section>
      </main>
      <MarketingFooter />
      <WhatsAppFloat />
    </div>
  )
}