import type { SceneKey } from '@/lib/explore/visual-scenes'

export type FeedEntityType = 'career' | 'course' | 'university'

export type FeedItemType =
  | 'fact'
  | 'discovery'
  | 'myth'
  | 'pathway'
  | 'comparison'
  | 'interactive'
  | 'adjacent'
  | 'course'
  | 'university'
  | 'trending'
  | 'personalized'
  | 'sectors'
  | 'demand'
  | 'reality'

export interface FeedItem {
  id: string
  type: FeedItemType
  label: string
  headline: string
  body: string
  ctaLabel: string
  href: string
  entityType: FeedEntityType | null
  entityId: string | null
  category: string | null
  scene?: SceneKey
  score: number
}

export interface ExploreInteraction {
  entityType: FeedEntityType
  entityId: string
  action: 'view' | 'click' | 'save' | 'follow' | 'dismiss' | 'share'
  createdAt: string
}

export const EXPLORE_INTEREST_LABELS = [
  'Building things',
  'Technology',
  'Medicine',
  'Business',
  'Science',
  'Creativity',
  'Helping people',
  'Solving problems',
  'Working with numbers',
  'Working outdoors',
] as const

export const INTEREST_CATEGORIES: Record<string, string[]> = {
  'Building things': ['Engineering', 'Technology'],
  'Technology': ['Technology'],
  'Medicine': ['Medicine & Health'],
  'Business': ['Business & Finance'],
  'Science': ['Science & Research'],
  'Creativity': ['Arts & Design', 'Media & Communication'],
  'Helping people': ['Medicine & Health', 'Education', 'Public Service'],
  'Solving problems': ['Technology', 'Engineering', 'Science & Research'],
  'Working with numbers': ['Business & Finance', 'Science & Research'],
  'Working outdoors': ['Agriculture', 'Engineering'],
}

export const LOCAL_INTERESTS_KEY = 'propeida.explore.interests.v1'
export const LOCAL_SAVED_KEY = 'propeida.explore.saved.v1'
export const LOCAL_FOLLOWED_KEY = 'propeida.explore.followed.v1'
export const LOCAL_PICKER_SEEN_KEY = 'propeida.explore.picker-seen.v1'