import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const { data: endedAt, error } = await supabase.rpc('end_campaign', { p_slug: slug })

    if (error) return NextResponse.json({ error: 'Failed to end campaign' }, { status: 500 })

    return NextResponse.json({ success: true, endedAt })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}