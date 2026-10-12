import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, slug')
      .order('name')
    if (error) throw error
    return NextResponse.json({ schools: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    if (!slug) return NextResponse.json({ error: 'Name must contain letters or numbers' }, { status: 400 })

    const { data, error } = await supabase
      .from('schools')
      .insert({ name, slug })
      .select('id')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A school with that name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add school' }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
