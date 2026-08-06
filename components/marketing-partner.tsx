import Link from 'next/link'
import { Building2, FileCheck, ClipboardList, Eye, ArrowRight } from 'lucide-react'

export default function MarketingPartner() {
  const features = [
    { icon: FileCheck, title: 'Mock exam administration', description: 'Run timed, scored mock exams for your students without buying computers, software, or question papers.' },
    { icon: ClipboardList, title: 'Student progress tracking', description: 'See who practiced, who improved, and who is exam-ready — student by student, class by class.' },
    { icon: Building2, title: 'Class reports', description: 'Weekly and monthly reports you can share with parents, principals, and proprietors.' },
    { icon: Eye, title: 'Institutional dashboards', description: 'A full operating picture of your students’ preparation, available to you and your teachers.' },
  ]

  return (
    <section id="partner" className="border-t border-gray-100 bg-gray-50/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Run your students&apos; preparation on Propeida
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            For secondary schools and tutorial centers. Your students get the full platform for free — you get
            the tools to turn preparation into admission.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-2xs hover:border-blue-100 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white hover:bg-blue-700 active:bg-blue-800 min-h-[44px]"
          >
            Talk to Us
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}