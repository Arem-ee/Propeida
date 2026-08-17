import Link from 'next/link'
import { Briefcase, GraduationCap, School, ArrowRight } from 'lucide-react'
import ExploreSearch from '@/components/explore/explore-search'
import { CareerCard, CourseCard, UniversityCard } from '@/components/explore/entity-card'
import { CAREER_CATEGORIES } from '@/lib/explore/constants'
import { getExploreHome } from '@/lib/explore/data'

export const metadata = {
  title: 'Explore Careers, Courses & Universities | Propeida',
  description:
    'Discover careers, the university courses that lead to them, and the Nigerian universities that offer them — then start preparing with Propeida practice tests.',
}

export default async function ExplorePage() {
  const data = await getExploreHome()

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
      <section className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Your future starts with a <span className="text-blue-600">decision</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg">
          Explore careers, the university courses that lead to them, and where you can study in
          Nigeria — then get exam-ready with Propeida.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <ExploreSearch />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {CAREER_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/explore/careers?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600 min-h-[32px] flex items-center"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">Careers</h2>
            <p className="mt-1 text-sm text-gray-500">
              {data.counts.careers > 0
                ? `${data.counts.careers} career${data.counts.careers === 1 ? '' : 's'} to explore`
                : 'Careers are being added'}
            </p>
          </div>
          <Link
            href="/explore/careers"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.careers.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.careers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title="Careers are on the way"
            body="The first careers are being written. Check back soon."
          />
        )}
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">Courses</h2>
            <p className="mt-1 text-sm text-gray-500">
              {data.counts.courses > 0
                ? `${data.counts.courses} course${data.counts.courses === 1 ? '' : 's'} to explore`
                : 'Courses are being added'}
            </p>
          </div>
          <Link
            href="/explore/courses"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.courses.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<GraduationCap className="h-6 w-6" />}
            title="Courses are on the way"
            body="University courses are being added. Check back soon."
          />
        )}
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">Universities</h2>
            <p className="mt-1 text-sm text-gray-500">
              {data.counts.universities > 0
                ? `${data.counts.universities} universit${data.counts.universities === 1 ? 'y' : 'ies'} to explore`
                : 'Universities are being added'}
            </p>
          </div>
          <Link
            href="/explore/universities"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 min-h-[44px]"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.universities.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.universities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<School className="h-6 w-6" />}
            title="Universities are on the way"
            body="Nigerian universities are being added. Check back soon."
          />
        )}
      </section>

      <section className="mt-16 rounded-3xl bg-blue-600 px-6 py-10 text-center sm:px-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Found a direction? Start preparing.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
          Whatever you decide to pursue, Propeida practice tests help you get the JAMB score your
          dream course requires.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50"
        >
          Start practicing free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{body}</p>
    </div>
  )
}