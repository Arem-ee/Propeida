import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const { supabase } = await requireAdmin()
    const [examsRes, subjectsRes, schoolsRes] = await Promise.all([
      supabase.from('exams').select('id, name').order('name'),
      supabase.from('subjects').select('id, name').order('name'),
      supabase.from('schools').select('id, name').order('name'),
    ])

    return NextResponse.json({
      exams: examsRes.data ?? [],
      subjects: subjectsRes.data ?? [],
      schools: schoolsRes.data ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
