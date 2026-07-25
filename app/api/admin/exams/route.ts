import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    const { name, slug, description, school_id, subject_selection_mode, subject_ids, question_count, time_limit_seconds } = body

    if (!name || !slug || !subject_selection_mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (question_count !== undefined && (typeof question_count !== 'number' || question_count < 1 || !Number.isInteger(question_count))) {
      return NextResponse.json({ error: 'question_count must be a positive integer' }, { status: 400 })
    }
    if (time_limit_seconds !== undefined && (typeof time_limit_seconds !== 'number' || time_limit_seconds < 1 || !Number.isInteger(time_limit_seconds))) {
      return NextResponse.json({ error: 'time_limit_seconds must be a positive integer' }, { status: 400 })
    }

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        name,
        slug,
        description: description || null,
        school_id: school_id || null,
        subject_selection_mode,
      })
      .select('id')
      .single()

    if (examError) {
      if (examError.code === '23505') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
    }

    if (subject_ids && subject_ids.length > 0) {
      const { error: linkError } = await supabase
        .from('exam_subjects')
        .insert(subject_ids.map((sid: string) => ({ exam_id: exam.id, subject_id: sid })))

      if (linkError) return NextResponse.json({ error: 'Failed to link subjects' }, { status: 500 })
    }

    if (question_count || time_limit_seconds) {
      const { data: config } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'mock_defaults')
        .single()

      const defaults = (config?.value as Record<string, { question_count: number | null; time_limit_seconds: number | null }>) ?? {}
      defaults[slug] = {
        question_count: question_count ?? null,
        time_limit_seconds: time_limit_seconds ?? null,
      }

      await supabase
        .from('app_config')
        .upsert({ key: 'mock_defaults', value: defaults as unknown as string }, { onConflict: 'key' })
    }

    // School-specific exams (Post-UTME) get 2 free mock attempts by default
    if (school_id) {
      const { data: attemptsConfig } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'free_mock_attempts')
        .single()

      const attempts = (attemptsConfig?.value as Record<string, number>) ?? { '__default__': 1 }
      attempts[slug] = 2

      await supabase
        .from('app_config')
        .upsert({ key: 'free_mock_attempts', value: attempts as unknown as string }, { onConflict: 'key' })
    }

    return NextResponse.json({ success: true, id: exam.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    const { id, name, slug, description, school_id, subject_selection_mode, subject_ids, question_count, time_limit_seconds } = body

    if (!id || !name || !slug || !subject_selection_mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (question_count !== undefined && (typeof question_count !== 'number' || question_count < 1 || !Number.isInteger(question_count))) {
      return NextResponse.json({ error: 'question_count must be a positive integer' }, { status: 400 })
    }
    if (time_limit_seconds !== undefined && (typeof time_limit_seconds !== 'number' || time_limit_seconds < 1 || !Number.isInteger(time_limit_seconds))) {
      return NextResponse.json({ error: 'time_limit_seconds must be a positive integer' }, { status: 400 })
    }

    const { error: examError } = await supabase
      .from('exams')
      .update({
        name,
        slug,
        description: description || null,
        school_id: school_id || null,
        subject_selection_mode,
      })
      .eq('id', id)

    if (examError) {
      if (examError.code === '23505') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
    }

    if (subject_ids) {
      await supabase.from('exam_subjects').delete().eq('exam_id', id)
      if (subject_ids.length > 0) {
        const { error: linkError } = await supabase
          .from('exam_subjects')
          .insert(subject_ids.map((sid: string) => ({ exam_id: id, subject_id: sid })))
        if (linkError) return NextResponse.json({ error: 'Failed to link subjects' }, { status: 500 })
      }
    }

    if (question_count !== undefined || time_limit_seconds !== undefined) {
      const { data: config } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'mock_defaults')
        .single()

      const defaults = (config?.value as Record<string, { question_count: number | null; time_limit_seconds: number | null }>) ?? {}
      defaults[slug] = {
        question_count: question_count ?? null,
        time_limit_seconds: time_limit_seconds ?? null,
      }

      await supabase
        .from('app_config')
        .upsert({ key: 'mock_defaults', value: defaults as unknown as string }, { onConflict: 'key' })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
