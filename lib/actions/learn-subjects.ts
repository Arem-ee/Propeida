'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * The Learn hub: every subject with at least one published lesson, straight
 * from the database, so someone new never sees a ghost outcome for a subject
 * we have not actually authored yet. Counts are lesson counts, not
 * static-note counts.
 */
export async function getLearnSubjects(): Promise<{ slug: string; label: string; lessonCount: number }[]> {
  const admin = createAdminClient()
  const [{ data: subjects }, { data: lessons }] = await Promise.all([
    admin.from('subjects').select('id, slug, name'),
    admin.from('lessons').select('id, subject_id').eq('status', 'published'),
  ])
  const counts = new Map<string, number>()
  for (const lesson of lessons ?? []) {
    counts.set(lesson.subject_id, (counts.get(lesson.subject_id) ?? 0) + 1)
  }
  const out: { slug: string; label: string; lessonCount: number }[] = []
  for (const subject of subjects ?? []) {
    const count = counts.get(subject.id) ?? 0
    if (count === 0) continue
    out.push({ slug: subject.slug, label: subject.name, lessonCount: count })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label))
}
