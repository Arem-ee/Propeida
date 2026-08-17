import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const [careersRes, coursesRes, schoolsRes] = await Promise.all([
      supabase.from('careers').select('id, slug, name').order('name'),
      supabase.from('courses').select('id, slug, name').order('name'),
      supabase.from('schools').select('id, slug, name').order('name'),
    ])

    return NextResponse.json({
      careers: careersRes.data ?? [],
      courses: coursesRes.data ?? [],
      universities: schoolsRes.data ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}