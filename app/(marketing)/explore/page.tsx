import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ExploreSearch from '@/components/explore/explore-search'
import DiscoveryFeed from '@/components/explore/feed/discovery-feed'
import { CAREER_CATEGORIES } from '@/lib/explore/constants'
import { buildExploreFeed } from '@/lib/explore/feed'
import { getExploreSignals } from '@/lib/explore/signals'
import { createClient, getAuthUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Explore Careers & Courses | Propeida',
  description:
    'A discovery feed of careers, university courses and paths you did not know existed — then get exam-ready with Propeida practice tests.',
}

export default async function ExplorePage() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  const signals = await getExploreSignals(supabase, user)
  const { items, seenIds } = await buildExploreFeed({
    interests: signals.interests,
    interactions: signals.interactions,
    limit: 10,
  })

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          See what&apos;s <span className="text-blue-600">interesting</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-500 sm:text-base">
          A feed of careers, courses and paths you didn&apos;t know existed. Tap anything that
          catches your eye.
        </p>
        <div className="mt-6">
          <ExploreSearch />
        </div>
      </header>

      <main className="mt-8">
        <DiscoveryFeed
          initialItems={items}
          initialSeenIds={seenIds}
          initialSavedIds={signals.savedIds}
          initialFollowedIds={signals.followedIds}
          initialInterests={signals.interests}
          hasUser={Boolean(user)}
        />
      </main>

      <section className="mt-14 rounded-3xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-extrabold text-gray-900">Prefer browsing?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CAREER_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/explore/careers?category=${encodeURIComponent(category)}`}
              className="flex min-h-[32px] items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              {category}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-50 pt-4 text-sm">
          <Link href="/explore/careers" className="font-bold text-blue-600 hover:underline">
            All careers
          </Link>
          <Link href="/explore/courses" className="font-bold text-blue-600 hover:underline">
            All courses
          </Link>
          <Link href="/explore/universities" className="font-bold text-blue-600 hover:underline">
            All universities
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-blue-600 px-6 py-10 text-center sm:px-12">
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