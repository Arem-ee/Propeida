import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

/** Topics for a subject, for question tagging. */
export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin()
    const subjectId = new URL(request.url).searchParams.get('subject_id')
    if (!subjectId) return NextResponse.json({ topics: [] })

    const { data, error } = await supabase
      .from('topics')
      .select('id, name, slug')
      .eq('subject_id', subjectId)
      .eq('published', true)
      .order('sort_order')
    if (error) throw error
    return NextResponse.json({ topics: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
