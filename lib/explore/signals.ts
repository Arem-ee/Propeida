import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { ExploreInteraction, FeedEntityType } from './feed-types'

export interface ExploreSignals {
  interests: string[]
  interactions: ExploreInteraction[]
  savedIds: string[]
  followedIds: string[]
}

export const EMPTY_SIGNALS: ExploreSignals = {
  interests: [],
  interactions: [],
  savedIds: [],
  followedIds: [],
}

interface InteractionRow {
  entity_type: FeedEntityType
  entity_id: string
  action: ExploreInteraction['action']
  created_at: string
}

export async function getExploreSignals(
  supabase: SupabaseClient,
  user: User | null
): Promise<ExploreSignals> {
  if (!user) return EMPTY_SIGNALS

  const [profileRes, interactionsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('explore_interests')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('explore_interactions')
      .select('entity_type, entity_id, action, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  const interactions: ExploreInteraction[] = ((interactionsRes.data ?? []) as InteractionRow[]).map(
    (row) => ({
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      createdAt: row.created_at,
    })
  )

  const savedIds = interactions
    .filter((i) => i.action === 'save')
    .map((i) => i.entityId)
  const followedIds = interactions
    .filter((i) => i.action === 'follow')
    .map((i) => i.entityId)

  const profile = profileRes.data as { explore_interests?: string[] } | null
  const interests = Array.isArray(profile?.explore_interests) ? profile.explore_interests : []

  return { interests, interactions, savedIds, followedIds }
}