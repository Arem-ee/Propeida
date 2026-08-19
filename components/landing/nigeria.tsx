import Link from 'next/link'
import { BookOpen, Briefcase, Compass, FileText, GraduationCap, School } from 'lucide-react'

const ITEMS = [
  {
    icon: FileText,
    title: 'JAMB',
    body: 'The exam that opens the door.',
    href: '/explore',
  },
  {
    icon: School,
    title: 'Post-UTME',
    body: 'The second hurdle, university by university.',
    href: '/post-utme-past-questions',
  },
  {
    icon: GraduationCap,
    title: 'Universities',
    body: 'See what each one actually offers.',
    href: '/explore/universities',
  },
  {
    icon: BookOpen,
    title: 'Courses',
    body: 'Know what a course really leads to.',
    href: '/explore/courses',
  },
  {
    icon: Briefcase,
    title: 'Job markets',
    body: 'Where the work is, sector by sector.',
    href: '/explore/careers',
  },
  {
    icon: Compass,
    title: 'Skills & careers',
    body: 'What employers actually screen for.',
    href: '/explore/careers',
  },
]

export default function LandingNigeria() {
  return (
    <section className="border-t border-gray-100 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">Made for Nigeria</p>
        <h2 className="mt-4 font-serif text-[30px] font-medium leading-tight text-gray-900 sm:text-[36px]">
          Built around the decisions Nigerian students actually face.
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-[1.9] text-gray-600">
          JAMB. Post-UTME. University. Course. Job market. Career. Propeida connects every step.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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