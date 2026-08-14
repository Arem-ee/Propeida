'use server'

import { createClient, getAuthUser } from '@/lib/supabase/server'

export async function getLeaderboardData(period: 'all_time' | 'weekly', examId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_period: period,
    p_exam_id: examId,
  })

  if (error) throw new Error('Failed to load leaderboard')

  return (data ?? []).map((row: Record<string, unknown>, index: number) => ({
    rank: index + 1,
    userId: row.user_id as string,
    username: (row.username as string | null) ?? 'Unknown',
    avatarIndex: (row.avatar_index as number | null) ?? null,
    score: row.score as number,
    schoolName: (row.school_name as string | null) ?? null,
    schoolSlug: (row.school_slug as string | null) ?? null,
  }))
}

export async function getLeaderboardExams() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return []

  const { data: access } = await supabase
    .from('user_exam_access')
    .select('exam_id')
    .eq('user_id', user.id)

  const accessIds = (access ?? []).map((a) => a.exam_id)

  const { data } = await supabase
    .from('exams')
    .select('id, name, slug, school_id')
    .or('slug.eq.jamb,school_id.not.is.null')
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
  const user = await getAuthUser(supabase)
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
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_exam_access')
    .insert({ user_id: user.id, exam_id: examId })

  if (error && error.code !== '23505') throw new Error('Failed to add institution')
}

export async function removeUserExamAccess(examId: string) {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_exam_access')
    .delete()
    .eq('user_id', user.id)
    .eq('exam_id', examId)

  if (error) throw new Error('Failed to remove institution')
}
