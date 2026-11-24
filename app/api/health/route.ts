import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Liveness + dependency check for an external uptime monitor. */
export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('subjects').select('id').limit(1)
    if (error) return NextResponse.json({ ok: false }, { status: 503 })
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
