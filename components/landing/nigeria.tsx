import Link from 'next/link'
import Image from 'next/image'
import { FileText, School } from 'lucide-react'

const ITEMS = [
  {
    icon: FileText,
    title: 'JAMB',
    body: 'The exam that opens the door.',
    href: '/practice',
  },
  {
    icon: School,
    title: 'Post-UTME',
    body: 'The second hurdle, university by university.',
    href: '/post-utme-past-questions',
  },
]

export default function LandingNigeria() {
  return (
    <section className="border-t border-gray-100 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Made for Nigeria</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[38px]">
            Built around the decisions Nigerian students actually face.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
            JAMB. Post-UTME. University. Course. Job market. Career. Propeida connects every step of the journey,
            lifting Nigeria’s next generation of thinkers, creators, and leaders.
          </p>
        </div>

        {/* Grand Nigeria Map Illustration */}
        <div className="mt-12 sm:mt-16">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b from-blue-50/20 via-white to-gray-50/30 p-4 sm:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.02),0_20px_44px_-28px_rgba(37,99,235,0.14)]">
            <Image
              src="/images/landing/nigeria-map-students.jpg"
              alt="Grand colorful political map of Nigeria held up high by Nigerian students with hands pressed flat against the underside"
              width={1920}
              height={1080}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_12px_32px_-24px_rgba(15,23,42,0.10)] transition-colors hover:border-gray-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-blue-700">{item.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-gray-600">{item.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}