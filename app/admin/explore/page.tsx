import Link from 'next/link'
import { Briefcase, GraduationCap, School, Upload, ArrowRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Explore Admin | Propeida' }

export default async function AdminExplorePage() {
  const supabase = createAdminClient()
  const [careersRes, coursesRes, schoolsRes] = await Promise.all([
    supabase.from('careers').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('schools').select('id', { count: 'exact', head: true }),
  ])

  const counts = {
    careers: careersRes.count ?? 0,
    courses: coursesRes.count ?? 0,
    universities: schoolsRes.count ?? 0,
  }

  const sections = [
    {
      href: '/admin/explore/careers',
      icon: Briefcase,
      label: 'Careers',
      count: counts.careers,
      description: 'Career guides with categories, skills and linked courses.',
    },
    {
      href: '/admin/explore/courses',
      icon: GraduationCap,
      label: 'Courses',
      count: counts.courses,
      description: 'University courses linked to careers and universities.',
    },
    {
      href: '/admin/explore/universities',
      icon: School,
      label: 'Universities',
      count: counts.universities,
      description: 'Nigerian universities and the courses they offer.',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Explore</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage careers, courses and universities for the public Explore section.
          </p>
        </div>
        <Link
          href="/admin/explore/import"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{section.count}</p>
                <h2 className="text-sm font-bold text-gray-900">{section.label}</h2>
                <p className="mt-1 text-xs text-gray-500">{section.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-extrabold text-gray-900">How content gets added</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-500">
          <li>
            <span className="font-semibold text-gray-700">Manually</span> — create or edit careers,
            courses and universities with the forms on each page. Unpublished items are hidden from
            the public site.
          </li>
          <li>
            <span className="font-semibold text-gray-700">CSV import</span> — bulk-add entities or
            link careers ↔ courses and courses ↔ universities by slug.
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-400">
          Public pages refresh automatically; published changes appear within a few minutes.
        </p>
      </div>
    </div>
  )
}