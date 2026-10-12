import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

function asDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** List all cycles (newest first) with exam names. */
export async function GET() {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('exam_cycles')
      .select('id, exam_id, year, starts_at, ends_at, verified, source, exams!inner(name)')
      .order('year', { ascending: false })
    if (error) throw error
    return NextResponse.json({ cycles: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { exam_id, year, starts_at, ends_at, verified, source } = body

    if (!exam_id || typeof exam_id !== 'string') {
      return NextResponse.json({ error: 'Pick an exam' }, { status: 400 })
    }
    const yearNum = Number(year)
    if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return NextResponse.json({ error: 'Year must be 2000-2100' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('exam_cycles')
      .insert({
        exam_id,
        year: yearNum,
        starts_at: asDate(starts_at),
        ends_at: asDate(ends_at),
        verified: verified === true,
        source: typeof source === 'string' && source.trim() ? source.trim() : null,
      })
      .select('id')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That exam already has this year' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add cycle' }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, starts_at, ends_at, verified, source } = body
    if (!id) return NextResponse.json({ error: 'Missing cycle id' }, { status: 400 })

    const { error } = await supabase
      .from('exam_cycles')
      .update({
        starts_at: asDate(starts_at),
        ends_at: asDate(ends_at),
        verified: verified === true,
        source: typeof source === 'string' && source.trim() ? source.trim() : null,
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update cycle' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing cycle id' }, { status: 400 })
    const { error } = await supabase.from('exam_cycles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete cycle' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
