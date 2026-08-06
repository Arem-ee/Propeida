import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import InquiryForm from '@/components/inquiry-form'
import { School, GraduationCap, TrendingUp, ShieldCheck, HandHeart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sponsor a school — sponsor student access to Propeida',
  description:
    'Sponsor a school or a class of students on Propeida. We run their JAMB and Post-UTME preparation and report measurable impact back to you.',
}

const programs = [
  {
    icon: School,
    title: 'Sponsor a school',
    description:
      'Fund full preparation for a secondary school or tutorial center of your choice. Students practice free; you receive quarterly impact reports.',
  },
  {
    icon: GraduationCap,
    title: 'Sponsor a class',
    description:
      'Target a specific graduating class preparing for JAMB or Post-UTME in a year — and follow that exact cohort to their admission results.',
  },
  {
    icon: TrendingUp,
    title: 'Measurable impact',
    description:
      'No vague receipts. You see questions practiced, mocks completed, score improvement, and admission stories from the students you funded.',
  },
]

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
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
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Ways to sponsor</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
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

            <div className="mt-12 rounded-xl border border-gray-100 bg-gray-50/30 p-6 sm:p-8">
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
                Sponsor a school or a class
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
            />
          </div>
        </section>
      </main>
      <MarketingFooter />
      <WhatsAppFloat />
    </div>
  )
}