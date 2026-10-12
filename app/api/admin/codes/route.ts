import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

/** Registry codes for a subject, for misconception authoring dropdowns. */
export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin()
    const subjectId = new URL(request.url).searchParams.get('subject_id')
    if (!subjectId) return NextResponse.json({ codes: [] })

    const { data, error } = await supabase
      .from('misconception_codes')
      .select('code, name, definition')
      .eq('subject_id', subjectId)
      .order('code')
    if (error) throw error
    return NextResponse.json({ codes: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

/** Add a registry code. Codes are lowercase-hyphenated identifiers. */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const body = await request.json()
    const { subject_id, code, name, definition, example } = body

    if (!subject_id || typeof subject_id !== 'string') {
      return NextResponse.json({ error: 'subject_id is required' }, { status: 400 })
    }
    const cleanCode = String(code ?? '').trim().toLowerCase()
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cleanCode)) {
      return NextResponse.json({ error: 'code must be lowercase words joined by hyphens' }, { status: 400 })
    }
    if (!String(name ?? '').trim() || !String(definition ?? '').trim()) {
      return NextResponse.json({ error: 'name and definition are required' }, { status: 400 })
    }

    const { error } = await supabase.from('misconception_codes').insert({
      subject_id,
      code: cleanCode,
      name: String(name).trim(),
      definition: String(definition).trim(),
      example: String(example ?? '').trim() || null,
    })
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'that code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add code' }, { status: 500 })
    }
    return NextResponse.json({ success: true, code: cleanCode })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
