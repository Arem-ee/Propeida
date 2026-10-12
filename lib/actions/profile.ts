'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AVATAR_COUNT } from '@/lib/avatars'

export async function updateAvatarIndex(avatarIndex: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const idx = Math.max(0, Math.min(avatarIndex, AVATAR_COUNT - 1))

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_index: idx })
    .eq('id', user.id)

  if (error) throw new Error('Failed to update avatar')

  revalidatePath('/account')
  revalidatePath('/home')
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


