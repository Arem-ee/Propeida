import Link from 'next/link'
import { School } from 'lucide-react'
import ExploreFilterInput from '@/components/explore/filter-input'
import { UniversityCard } from '@/components/explore/entity-card'
import { UNIVERSITY_TYPES } from '@/lib/explore/constants'
import { getUniversityList } from '@/lib/explore/data'

export const metadata = {
  title: 'Explore Universities | Propeida',
  description: 'Browse Nigerian universities — where they are, what type they are, and the courses they offer.',
}

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type } = await searchParams
  const { items, total } = await getUniversityList({ q, type })

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Universities</h1>
        <p className="max-w-xl text-sm text-gray-500 sm:text-base">
          Nigerian universities, their locations, and the courses they offer — so you know exactly
          where to aim.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div className="max-w-md">
          <ExploreFilterInput placeholder="Search universities…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/explore/universities"
            className={`inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !type
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            All
          </Link>
          {UNIVERSITY_TYPES.map((item) => {
            const active = type === item
            return (
              <Link
                key={item}
                href={`/explore/universities?type=${encodeURIComponent(item)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
        {total} universit{total === 1 ? 'y' : 'ies'}
        {q ? ` matching “${q}”` : ''}
        {type ? ` · ${type}` : ''}
      </p>

      {items.length > 0 ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <School className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-sm font-bold text-gray-900">No universities found</h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {q ? `Nothing matched “${q}”. Try a different keyword.` : 'Universities are being added. Check back soon.'}
          </p>
        </div>
      )}
    </div>
  )
}