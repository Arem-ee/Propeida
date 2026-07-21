'use server'

import { createClient } from '@/lib/supabase/server'

export async function getLeaderboardData(period: 'all_time' | 'weekly', examSlug?: string | null) {
  const supabase = await createClient()

  let examId: string | null = null
  if (examSlug) {
    const { data: exam } = await supabase
      .from('exams')
      .select('id')
      .eq('slug', examSlug)
      .single()
    examId = exam?.id ?? null
  } else {
    const { data: jamb } = await supabase.from('exams').select('id').eq('slug', 'jamb').single()
    examId = jamb?.id ?? null
  }

  if (!examId) return []

  let query = supabase
    .from('leaderboard_entries')
    .select(`
      user_id,
      score,
      profiles!inner(username, avatar_index, schools!left(name, slug))
    `)
    .eq('period', period)
    .eq('exam_id', examId)
    .order('score', { ascending: false })
    .limit(100)

  const { data, error } = await query

  if (error) throw new Error('Failed to load leaderboard')

  const entries = (data ?? []).map((entry: Record<string, unknown>, index: number) => {
    const profiles = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles
    const schoolData = profiles?.schools
    const school = Array.isArray(schoolData) ? schoolData[0] : schoolData
    return {
      rank: index + 1,
      userId: entry.user_id as string,
      username: (profiles as { username?: string })?.username ?? 'Unknown',
      avatarIndex: (profiles as { avatar_index?: number | null })?.avatar_index ?? null,
      score: entry.score as number,
      schoolName: (school as { name?: string })?.name ?? null,
      schoolSlug: (school as { slug?: string })?.slug ?? null,
    }
  })

  return entries
}

export async function getLeaderboardExams() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: access } = await supabase
    .from('user_exam_access')
    .select('exam_id')
    .eq('user_id', user.id)

  const accessIds = (access ?? []).map((a) => a.exam_id)

  const { data } = await supabase
    .from('exams')
    .select('id, name, slug, school_id')
    .or(`slug.eq.jamb,school_id.neq.null`)
    .order('name')

  return (data ?? []).filter(
    (e) => e.slug === 'jamb' || accessIds.includes(e.id)
  ).map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
  }))
}

export async function getUserExamAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: access } = await supabase
    .from('user_exam_access')
    .select('exam_id')
    .eq('user_id', user.id)

  const accessIds = new Set((access ?? []).map((a) => a.exam_id))

  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, slug, school_id, schools(name, slug)')
    .not('school_id', 'is', null)
    .order('name')

  const schoolsWithExams: { id: string; name: string; slug: string; examId: string; examName: string; examSlug: string; added: boolean }[] = []
  for (const exam of exams ?? []) {
    const school = Array.isArray(exam.schools) ? exam.schools[0] : exam.schools
    if (!school) continue
    schoolsWithExams.push({
      id: (school as { id?: string })?.id ?? exam.school_id,
      name: (school as { name?: string })?.name ?? 'Unknown',
      slug: (school as { slug?: string })?.slug ?? '',
      examId: exam.id,
      examName: exam.name,
      examSlug: exam.slug,
      added: accessIds.has(exam.id),
    })
  }

  return schoolsWithExams
}

export async function addUserExamAccess(examId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_exam_access')
    .insert({ user_id: user.id, exam_id: examId })

  if (error && error.code !== '23505') throw new Error('Failed to add institution')
}

export async function removeUserExamAccess(examId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_exam_access')
    .delete()
    .eq('user_id', user.id)
    .eq('exam_id', examId)

  if (error) throw new Error('Failed to remove institution')
}
