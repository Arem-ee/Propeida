import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, CheckCircle2, ArrowRight, ChevronRight, ExternalLink,
} from 'lucide-react'
import { getCareerBySlug } from '@/lib/explore/details'
import { getPublishedSlugs } from '@/lib/explore/data'

export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs('careers')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const career = await getCareerBySlug(slug)
  if (!career) return { title: 'Career | Propeida' }
  return {
    title: `${career.name} Career Guide | Propeida`,
    description: career.short_description ?? `Explore the ${career.name} career path — what it involves, where it happens, and the courses that lead there.`,
  }
}

function ListBlock({
  title,
  items,
  icon,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
}) {
  if (items.length === 0) return null
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2">
        <span className="text-blue-600">{icon}</span>
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const career = await getCareerBySlug(slug)
  if (!career) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
        <Link href="/explore" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Explore</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/explore/careers" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Careers</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600">{career.name}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            {career.category}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{career.name}</h1>
        {career.short_description && (
          <p className="max-w-2xl text-base text-gray-500 sm:text-lg">{career.short_description}</p>
        )}
      </div>

      {career.description && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">{career.description}</p>
        </div>
      )}

      <ListBlock
        title="What you would do"
        items={career.what_you_do}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <ListBlock
        title="Where you would work"
        items={career.work_environments}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <ListBlock
        title="Industries you could work in"
        items={career.industries}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <ListBlock
        title="Common job titles"
        items={career.common_job_titles}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <ListBlock
        title="Skills that help"
        items={career.skills}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />

      {career.misconceptions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-900">Common misconceptions</h2>
          <ul className="mt-3 space-y-2">
            {career.misconceptions.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {career.career_progression && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-900">Career progression</h2>
          <p className="mt-3 whitespace-pre-line rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-7 text-gray-600">
            {career.career_progression}
          </p>
        </section>
      )}

      {career.relatedCareerItems.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-900">Related careers</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {career.relatedCareerItems.map((item) => (
              <Link
                key={item.id}
                href={`/explore/careers/${item.slug}`}
                className="inline-flex min-h-[40px] items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Courses that lead here</h2>
            <p className="mt-1 text-sm text-gray-500">
              {career.courses.length > 0
                ? 'Start with one of these university courses.'
                : 'Courses for this career are being added.'}
            </p>
          </div>
          <Link
            href="/explore/courses"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
          >
            All courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {career.courses.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {career.courses.map((course) => (
              <div key={course.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5">
                <Link
                  href={`/explore/courses/${course.slug}`}
                  className="group flex items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{course.name}</h3>
                    {course.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </Link>
                {course.universities.length > 0 && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Offered at
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {course.universities.map((university) => (
                        <Link
                          key={university.id}
                          href={`/explore/universities/${university.slug}`}
                          className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {university.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
            No courses linked yet — we are mapping this career to its courses.
          </p>
        )}
      </section>

      <section className="mt-12 rounded-3xl bg-blue-600 px-6 py-8 text-center">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Ready to aim for {career.name}?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
          Practice the exact subjects your dream course demands, and walk into the exam hall confident.
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