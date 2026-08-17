import { getPublicClient } from './supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import { CAREER_CATEGORIES } from './constants'
import type {
  CareerListItem,
  CourseListItem,
  ExploreHomeData,
  UniversityListItem,
} from './types'

const MAX_RESULTS = 50

function clampLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), 100)
}

function validCategory(category: string | undefined | null): string | undefined {
  if (category && CAREER_CATEGORIES.includes(category as (typeof CAREER_CATEGORIES)[number])) {
    return category
  }
  return undefined
}

export async function getExploreHome(): Promise<ExploreHomeData> {
  const supabase = getPublicClient()
  const [careersRes, coursesRes, universitiesRes, careersCount, coursesCount, universitiesCount] =
    await Promise.all([
      supabase
        .from('careers')
        .select('id, slug, name, category, short_description')
        .eq('published', true)
        .order('name')
        .limit(6),
      supabase
        .from('courses')
        .select('id, slug, name, description')
        .eq('published', true)
        .order('name')
        .limit(6),
      supabase
        .from('schools')
        .select('id, slug, name, location, type')
        .eq('published', true)
        .order('name')
        .limit(6),
      supabase
        .from('careers')
        .select('id', { count: 'exact', head: true })
        .eq('published', true),
      supabase
        .from('courses')
        .select('id', { count: 'exact', head: true })
        .eq('published', true),
      supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('published', true),
    ])

  return {
    careers: careersRes.data ?? [],
    courses: coursesRes.data ?? [],
    universities: universitiesRes.data ?? [],
    counts: {
      careers: careersCount.count ?? 0,
      courses: coursesCount.count ?? 0,
      universities: universitiesCount.count ?? 0,
    },
  }
}

export async function getCareerList(
  options: { q?: string; category?: string; limit?: number } = {},
): Promise<{ items: CareerListItem[]; total: number }> {
  const supabase = getPublicClient()
  const q = (options.q ?? '').trim()
  const category = validCategory(options.category)
  const limit = clampLimit(options.limit ?? MAX_RESULTS)

  let query = supabase
    .from('careers')
    .select('id, slug, name, category, short_description', { count: 'exact' })
    .eq('published', true)
  if (category) query = query.eq('category', category)
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

  const { data, count } = await query.order('name').limit(limit)
  return { items: data ?? [], total: count ?? 0 }
}

export async function getCourseList(
  options: { q?: string; limit?: number } = {},
): Promise<{ items: CourseListItem[]; total: number }> {
  const supabase = getPublicClient()
  const q = (options.q ?? '').trim()
  const limit = clampLimit(options.limit ?? MAX_RESULTS)

  let query = supabase
    .from('courses')
    .select('id, slug, name, description', { count: 'exact' })
    .eq('published', true)
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

  const { data, count } = await query.order('name').limit(limit)
  return { items: data ?? [], total: count ?? 0 }
}

export async function getUniversityList(
  options: { q?: string; type?: string; limit?: number } = {},
): Promise<{ items: UniversityListItem[]; total: number }> {
  const supabase = getPublicClient()
  const q = (options.q ?? '').trim()
  const type = (options.type ?? '').trim()
  const limit = clampLimit(options.limit ?? MAX_RESULTS)

  let query = supabase
    .from('schools')
    .select('id, slug, name, location, type', { count: 'exact' })
    .eq('published', true)
  if (type) query = query.eq('type', type)
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

  const { data, count } = await query.order('name').limit(limit)
  return { items: data ?? [], total: count ?? 0 }
}

export async function getPublishedSlugs(table: 'careers' | 'courses' | 'schools'): Promise<string[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from(table)
    .select('slug')
    .eq('published', true)
    .order('name')
  return (data ?? []).map((row) => row.slug)
}