import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

const MODES = ['in_person_cbt', 'online_proctored', 'documentary']

function asWeight(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error('Weights must be whole numbers 0-100')
  return n
}

function asInt(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 0) throw new Error(`${label} must be a whole number`)
  return n
}

/** List a school's screenings (newest year first). */
export async function GET(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const schoolId = new URL(request.url).searchParams.get('school_id')
    if (!schoolId) return NextResponse.json({ screenings: [] })
    const { data, error } = await supabase
      .from('school_screenings')
      .select('id, year, mode, jamb_weight, screening_weight, olevel_weight, cutoff, sittings_allowed, source')
      .eq('school_id', schoolId)
      .order('year', { ascending: false })
    if (error) throw error
    return NextResponse.json({ screenings: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { school_id } = body
    if (!school_id || typeof school_id !== 'string') {
      return NextResponse.json({ error: 'Missing school' }, { status: 400 })
    }

    let payload: Record<string, unknown>
    try {
      const year = asInt(body.year, 'Year')
      if (!year || year < 2000 || year > 2100) throw new Error('Year must be 2000-2100')
      if (!MODES.includes(body.mode)) throw new Error('Pick a screening mode')
      payload = {
        school_id,
        year,
        mode: body.mode,
        jamb_weight: asWeight(body.jamb_weight),
        screening_weight: asWeight(body.screening_weight),
        olevel_weight: asWeight(body.olevel_weight),
        cutoff: asInt(body.cutoff, 'Cutoff'),
        sittings_allowed: asInt(body.sittings_allowed, 'Sittings'),
        source: typeof body.source === 'string' && body.source.trim() ? body.source.trim() : null,
      }
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('school_screenings')
      .insert(payload)
      .select('id')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'That school already has this year' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add screening' }, { status: 500 })
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
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Missing screening id' }, { status: 400 })

    let payload: Record<string, unknown>
    try {
      if (!MODES.includes(body.mode)) throw new Error('Pick a screening mode')
      payload = {
        mode: body.mode,
        jamb_weight: asWeight(body.jamb_weight),
        screening_weight: asWeight(body.screening_weight),
        olevel_weight: asWeight(body.olevel_weight),
        cutoff: asInt(body.cutoff, 'Cutoff'),
        sittings_allowed: asInt(body.sittings_allowed, 'Sittings'),
        source: typeof body.source === 'string' && body.source.trim() ? body.source.trim() : null,
      }
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid fields' }, { status: 400 })
    }

    const { error } = await supabase.from('school_screenings').update(payload).eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update screening' }, { status: 500 })
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
    if (!id) return NextResponse.json({ error: 'Missing screening id' }, { status: 400 })
    const { error } = await supabase.from('school_screenings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete screening' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
