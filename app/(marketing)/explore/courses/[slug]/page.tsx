import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, ArrowRight, ChevronRight, ExternalLink } from 'lucide-react'
import { CourseCard } from '@/components/explore/entity-card'
import { getCourseBySlug } from '@/lib/explore/details'
import { getPublishedSlugs } from '@/lib/explore/data'

export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs('courses')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return { title: 'Course | Propeida' }
  return {
    title: `${course.name} | Propeida`,
    description: course.description ?? `Explore the ${course.name} course — the careers it leads to and where to study it in Nigeria.`,
  }
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
        <Link href="/explore" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Explore</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/explore/courses" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Courses</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600">{course.name}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-5 w-5" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{course.name}</h1>
        {course.description && (
          <p className="max-w-2xl text-base text-gray-500 sm:text-lg">{course.description}</p>
        )}
      </div>

      {course.careers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-900">Careers this course leads to</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {course.careers.map((career) => (
              <Link
                key={career.id}
                href={`/explore/careers/${career.slug}`}
                className="inline-flex min-h-[40px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
              >
                {career.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-gray-900">Where you can study it</h2>
        {course.universities.length > 0 ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {course.universities.map((university) => (
              <Link
                key={university.id}
                href={`/explore/universities/${university.slug}`}
                className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                      {university.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[university.type, university.location].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
            Universities offering this course are being added.
          </p>
        )}
      </section>

      {course.relatedCourses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-extrabold text-gray-900">Similar courses</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {course.relatedCourses.map((item) => (
              <CourseCard key={item.id} course={item} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-3xl bg-blue-600 px-6 py-8 text-center">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Studying {course.name}? Get ahead.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
          Practice the subjects you need for this course and lock in the score that gets you admitted.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Start practicing free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/practice"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Go to practice <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}