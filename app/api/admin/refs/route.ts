import { NextResponse } from 'next/server'
import { requireAdmin, adminErrorResponse } from '@/lib/admin'

export async function GET() {
  try {
    const { supabase } = await requireAdmin()
    const [examsRes, subjectsRes, schoolsRes] = await Promise.all([
      supabase.from('exams').select('id, name').order('name').limit(500),
      supabase.from('subjects').select('id, name').order('name').limit(500),
      supabase.from('schools').select('id, name').order('name').limit(500),
    ])

    return NextResponse.json({
      exams: examsRes.data ?? [],
      subjects: subjectsRes.data ?? [],
      schools: schoolsRes.data ?? [],
    })
  } catch (err) {
    return adminErrorResponse(err)
  }
}
