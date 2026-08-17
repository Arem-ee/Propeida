import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import ExploreFilterInput from '@/components/explore/filter-input'
import { CareerCard } from '@/components/explore/entity-card'
import { CAREER_CATEGORIES } from '@/lib/explore/constants'
import { getCareerList } from '@/lib/explore/data'

export const metadata = {
  title: 'Explore Careers | Propeida',
  description: 'Browse careers by category — what they involve, where they happen, and the courses that lead to them.',
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const { items, total } = await getCareerList({ q, category })

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Careers</h1>
        <p className="max-w-xl text-sm text-gray-500 sm:text-base">
          Find a career that fits you — what the work is really like, where it happens, and the
          university courses that lead there.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="max-w-md">
          <ExploreFilterInput placeholder="Search careers…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/explore/careers"
            className={`inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !category
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            All
          </Link>
          {CAREER_CATEGORIES.map((item) => {
            const active = category === item
            return (
              <Link
                key={item}
                href={`/explore/careers?category=${encodeURIComponent(item)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {item}
              </Link>
            )
          })}
        </div>
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-gray-400">
        {total} career{total === 1 ? '' : 's'}
        {q ? ` matching “${q}”` : ''}
        {category ? ` in ${category}` : ''}
      </p>

      {items.length > 0 ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Briefcase className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-sm font-bold text-gray-900">No careers found</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {q
              ? `Nothing matched “${q}”. Try a different keyword.`
              : 'No careers in this category yet. Check back soon.'}
          </p>
        </div>
      )}
    </div>
  )
}