import { GraduationCap } from 'lucide-react'
import ExploreFilterInput from '@/components/explore/filter-input'
import { CourseCard } from '@/components/explore/entity-card'
import { getCourseList } from '@/lib/explore/data'

export const metadata = {
  title: 'Explore Courses | Propeida',
  description: 'Browse university courses — what they lead to and which Nigerian universities offer them.',
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { items, total } = await getCourseList({ q })

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Courses</h1>
        <p className="max-w-xl text-sm text-gray-500 sm:text-base">
          The university courses behind every career — see what each course can lead to and which
          Nigerian universities offer it.
        </p>
      </div>

      <div className="mt-8 max-w-md">
        <ExploreFilterInput placeholder="Search courses…" />
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-gray-400">
        {total} course{total === 1 ? '' : 's'}
        {q ? ` matching “${q}”` : ''}
      </p>

      {items.length > 0 ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-sm font-bold text-gray-900">No courses found</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {q ? `Nothing matched “${q}”. Try a different keyword.` : 'Courses are being added. Check back soon.'}
          </p>
        </div>
      )}
    </div>
  )
}