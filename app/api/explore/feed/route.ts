import { NextResponse } from 'next/server'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { buildExploreFeed } from '@/lib/explore/feed'
import { getExploreSignals } from '@/lib/explore/signals'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { interests?: unknown; seenIds?: unknown; limit?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    // default to empty body
  }

  const interests = Array.isArray(body.interests)
    ? body.interests.filter((x): x is string => typeof x === 'string').slice(0, 10)
    : []
  const seenIds = Array.isArray(body.seenIds)
    ? body.seenIds.filter((x): x is string => typeof x === 'string').slice(0, 500)
    : []
  const limit =
    typeof body.limit === 'number'
      ? Math.min(Math.max(Math.floor(body.limit), 3), 20)
      : 6

  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  let interactions: Awaited<ReturnType<typeof getExploreSignals>>['interactions'] = []
  let storedInterests: string[] = []
  if (user) {
    const signals = await getExploreSignals(supabase, user)
    interactions = signals.interactions
    storedInterests = signals.interests
  }

  const mergedInterests = [...new Set([...storedInterests, ...interests])]

  const { items, seenIds: nextSeenIds } = await buildExploreFeed({
    interests: mergedInterests,
    interactions,
    seenIds,
    limit,
  })

  return NextResponse.json({ items, seenIds: nextSeenIds })
}