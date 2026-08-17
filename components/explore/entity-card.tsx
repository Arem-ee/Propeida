import Link from 'next/link'
import { ArrowRight, Briefcase, GraduationCap, School } from 'lucide-react'
import type { CareerListItem, CourseListItem, UniversityListItem } from '@/lib/explore/types'

export function CareerCard({ career }: { career: CareerListItem }) {
  return (
    <Link
      href={`/explore/careers/${career.slug}`}
      className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Briefcase className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{career.name}</h3>
        {career.category && (
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-blue-600">{career.category}</p>
        )}
      </div>
      {career.short_description && (
        <p className="text-sm text-gray-500 line-clamp-2">{career.short_description}</p>
      )}
    </Link>
  )
}

export function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      href={`/explore/courses/${course.slug}`}
      className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{course.name}</h3>
      </div>
      {course.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
      )}
    </Link>
  )
}

export function UniversityCard({ university }: { university: UniversityListItem }) {
  return (
    <Link
      href={`/explore/universities/${university.slug}`}
      className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <School className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{university.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">
          {[university.type, university.location].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}