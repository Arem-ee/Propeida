import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { ids } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0 || ids.some((id: unknown) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('questions').delete().in('id', ids)
    if (error) return NextResponse.json({ error: 'Failed to delete questions', detail: error.message }, { status: 500 })

    return NextResponse.json({ deleted: ids.length })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
