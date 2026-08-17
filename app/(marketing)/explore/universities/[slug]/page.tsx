import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { School, ArrowRight, ChevronRight, ExternalLink, MapPin } from 'lucide-react'
import { getUniversityBySlug } from '@/lib/explore/details'
import { getPublishedSlugs } from '@/lib/explore/data'

export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs('schools')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const university = await getUniversityBySlug(slug)
  if (!university) return { title: 'University | Propeida' }
  return {
    title: `${university.name} | Propeida`,
    description: university.description ?? `${university.name} — ${[university.type, university.location].filter(Boolean).join(', ')}. See the courses it offers.`,
  }
}

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const university = await getUniversityBySlug(slug)
  if (!university) notFound()

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
        <Link href="/explore" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Explore</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/explore/universities" className="hover:text-blue-600 min-h-[32px] inline-flex items-center">Universities</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600">{university.name}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <School className="h-5 w-5" />
          </span>
          {university.type && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {university.type}
            </span>
          )}
          {university.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              <MapPin className="h-3 w-3" />
              {university.location}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{university.name}</h1>
        {university.description && (
          <p className="max-w-2xl text-base text-gray-500 sm:text-lg">{university.description}</p>
        )}
        {university.website && (
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit min-h-[44px] items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Visit official website <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-gray-900">Courses offered here</h2>
        {university.courses.length > 0 ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {university.courses.map((course) => (
              <Link
                key={course.id}
                href={`/explore/courses/${course.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{course.name}</h3>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </div>
                {course.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                )}
                {course.careers.length > 0 && (
                  <div className="mt-3 border-t border-gray-50 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Leads to careers like
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {course.careers.slice(0, 3).map((career) => (
                        <Link
                          key={career.id}
                          href={`/explore/careers/${career.slug}`}
                          className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {career.name}
                        </Link>
                      ))}
                      {course.careers.length > 3 && (
                        <span className="px-1 py-1 text-xs font-semibold text-gray-400">
                          +{course.careers.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
            Courses offered at this university are being added.
          </p>
        )}
      </section>

      <section className="mt-12 rounded-3xl bg-blue-600 px-6 py-8 text-center">
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Aiming for {university.name}?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
          Get the score that gets you in — practice the exact subjects your target course demands.
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