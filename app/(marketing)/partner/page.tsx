import type { Metadata } from 'next'
import MarketingHeader from '@/components/marketing-header'
import MarketingFooter from '@/components/marketing-footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import InquiryForm from '@/components/inquiry-form'
import PageTrack from '@/components/page-track'
import { FileCheck, ClipboardList, Building2, Eye, Users, CalendarClock, ReceiptText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partner with Propeida — for schools and tutorial centers',
  description:
    'Run your students’ JAMB and Post-UTME preparation on Propeida. Mock exam administration, progress tracking, class reports, and institutional dashboards. Students pay nothing.',
  keywords: [
    'school exam prep platform Nigeria',
    'tutorial center mock exam software',
    'CBT mock exam for schools',
    'institutional exam preparation',
    'free exam prep for students',
  ],
  openGraph: {
    title: 'Partner with Propeida — for schools and tutorial centers',
    description:
      'Run your students’ JAMB and Post-UTME preparation on Propeida. Mock exam administration, class reports, and institutional dashboards. Students pay nothing.',
    type: 'website',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
}

const benefits = [
  {
    icon: Users,
    title: 'Your students, fully prepared',
    description:
      'Every student in your school or center gets the complete question bank, CBT simulator, explanations, and progress tracking — free for them, managed by you.',
  },
  {
    icon: FileCheck,
    title: 'Mock exam administration',
    description:
      'Run timed, scored mock exams the way the real CBT works — without buying computers, software, or question papers.',
  },
  {
    icon: ClipboardList,
    title: 'Class reports',
    description:
      'Weekly and monthly reports on practice activity, mock scores, and improvement — easy to share with parents, principals, and proprietors.',
  },
  {
    icon: Eye,
    title: 'Institutional dashboards',
    description:
      'A full operating picture of your students’ preparation: class performance, weak topics, and exam readiness, class by class.',
  },
  {
    icon: CalendarClock,
    title: 'Readiness campaigns',
    description:
      'Schedule mock days around JAMB and Post-UTME timelines, and track readiness as the exam season approaches.',
  },
  {
    icon: ReceiptText,
    title: 'Simple, honest pricing',
    description:
      'A flat annual plan per school or center. No per-student charges, no hidden costs — students never pay, and you know exactly what you are paying for.',
  },
]

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <MarketingHeader />
      <PageTrack event="visit-partner" />
      <main>
        <section className="bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Run your students&apos; preparation on Propeida.
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                For secondary schools and tutorial centers. Your students get the full platform free. You get the
                tools to run preparation like a professional program — and the results to show for it.
              </p>
              <div className="mt-4 inline-flex items-center rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                Students pay nothing. Ever.
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">What your school or center gets</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50/30 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 lg:gap-16">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Talk to us
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Tell us about your school or center and how many students you want to prepare. We&apos;ll walk you
                through the dashboard, set up your classes, and schedule your first mock day.
              </p>
              <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6">
                <h3 className="font-bold text-gray-900">Who this is for</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                    <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    Secondary schools preparing students for JAMB and Post-UTME
                  </li>
                  <li className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                    <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    Tutorial centers and lesson classes
                  </li>
                  <li className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                    <ReceiptText className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    State or local mock-exam programs
                  </li>
                </ul>
              </div>
            </div>
            <InquiryForm
              type="school"
              title="Request a school plan"
              description="We reply to every inquiry personally."
              organizationLabel="School or center name"
              organizationPlaceholder="e.g. ABC Model College"
              messagePlaceholder="Which exams are your students targeting, and when?"
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