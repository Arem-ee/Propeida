'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

export interface SchoolOption {
  id: string
  name: string
  slug: string
}

export interface ScreeningFacts {
  year: number
  mode: string
  jambWeight: number | null
  screeningWeight: number | null
  olevelWeight: number | null
  cutoff: number | null
  sittingsAllowed: number | null
  source: string | null
}

export interface TargetState {
  schools: SchoolOption[]
  targetSchoolId: string | null
  screening: ScreeningFacts | null
}

export async function getTargetState(): Promise<TargetState> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const [{ data: schools }, { data: targets }] = await Promise.all([
    supabase.from('schools').select('id, name, slug').order('name'),
    supabase
      .from('student_targets')
      .select('school_id')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('priority')
      .limit(1),
  ])

  const targetSchoolId = (targets ?? [])[0]?.school_id ?? null
  let screening: ScreeningFacts | null = null

  if (targetSchoolId) {
    const { data: rows } = await supabase
      .from('school_screenings')
      .select('year, mode, jamb_weight, screening_weight, olevel_weight, cutoff, sittings_allowed, source')
      .eq('school_id', targetSchoolId)
      .order('year', { ascending: false })
      .limit(1)
    const row = (rows ?? [])[0]
    if (row) {
      screening = {
        year: row.year,
        mode: row.mode,
        jambWeight: row.jamb_weight,
        screeningWeight: row.screening_weight,
        olevelWeight: row.olevel_weight,
        cutoff: row.cutoff,
        sittingsAllowed: row.sittings_allowed,
        source: row.source,
      }
    }
  }

  return {
    schools: (schools ?? []) as SchoolOption[],
    targetSchoolId,
    screening,
  }
}

export async function setTargetSchool(schoolId: string | null): Promise<void> {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  // One active target: clear, then set.
  await supabase.from('student_targets').update({ active: false }).eq('user_id', user.id)

  if (schoolId) {
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('id', schoolId)
      .single()
    if (!school) throw new Error('Unknown school')
    const { error } = await supabase.from('student_targets').upsert(
      { user_id: user.id, school_id: schoolId, priority: 1, active: true },
      { onConflict: 'user_id,school_id' },
    )
    if (error) throw new Error('Failed to save target')
    await supabase
      .from('student_targets')
      .update({ active: true })
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
  }
}
