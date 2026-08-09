import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const hours = typeof body?.hours === 'number' ? body.hours : 24
    const includeNewUsers = body?.includeNewUsers === true

    if (!slug || !name) {
      return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })
    }

    const { data: campaignId, error } = await supabase.rpc('start_campaign', {
      p_slug: slug,
      p_name: name,
      p_hours: hours,
      p_include_new_users: includeNewUsers,
    })

    if (error) return NextResponse.json({ error: 'Failed to start campaign' }, { status: 500 })

    return NextResponse.json({ success: true, campaignId })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}