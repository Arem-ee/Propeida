import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SearchResults } from '@/lib/explore/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  if (q.length < 1) {
    return NextResponse.json({ careers: [], courses: [], universities: [] } satisfies SearchResults)
  }

  const supabase = await createClient()
  const [careersRes, coursesRes, universitiesRes] = await Promise.all([
    supabase
      .from('careers')
      .select('id, slug, name, category, short_description')
      .eq('published', true)
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(6),
    supabase
      .from('courses')
      .select('id, slug, name, description')
      .eq('published', true)
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(6),
    supabase
      .from('schools')
      .select('id, slug, name, location, type')
      .eq('published', true)
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(6),
  ])

  const results: SearchResults = {
    careers: careersRes.data ?? [],
    courses: coursesRes.data ?? [],
    universities: universitiesRes.data ?? [],
  }
  return NextResponse.json(results)
}