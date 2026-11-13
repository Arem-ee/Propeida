import { unstable_cache } from 'next/cache'
import { createAdminClient } from './supabase/admin'

export interface PathSubject {
  id: string
  name: string
  slug: string
}

const PAGE = 1000
const MAX_ROWS = 5000

async function loadPathSubjects(examIds: string[]): Promise<PathSubject[]> {
  const admin = createAdminClient()

  // The boundary is what the path can teach or test: published questions,
  // shared lessons, or path-scoped lessons. No evidence source for it, no
  // shelf entry.
  const { data: links } = await admin
    .from('exam_subjects')
    .select('subject_id')
    .in('exam_id', examIds)

  const candidateIds = [...new Set((links ?? []).map((row) => row.subject_id as string))]
  if (candidateIds.length === 0) return []

  const questionSubjectIds = new Set<string>()
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await admin
      .from('questions')
      .select('subject_id')
      .in('exam_id', examIds)
      .in('subject_id', candidateIds)
      .eq('status', 'published')
      .range(from, from + PAGE - 1)
    if (error) break
    if (!data || data.length === 0) break
    for (const row of data) questionSubjectIds.add(row.subject_id as string)
    if (data.length < PAGE) break
  }

  const { data: lessons } = await admin
    .from('lessons')
    .select('subject_id')
    .in('subject_id', candidateIds)
    .or(`exam_id.is.null,exam_id.in.(${examIds.join(',')})`)

  const lessonSubjectIds = new Set((lessons ?? []).map((row) => row.subject_id as string))
  const available = candidateIds.filter(
    (id) => questionSubjectIds.has(id) || lessonSubjectIds.has(id),
  )
  if (available.length === 0) return []

  const { data } = await admin
    .from('subjects')
    .select('id, name, slug')
    .in('id', available)
    .order('name')

  return (data ?? []) as PathSubject[]
}

const pathSubjectsCache = unstable_cache(
  async (examIds: string[]) => loadPathSubjects(examIds),
  ['path-subjects-v1'],
  { revalidate: 300 },
)

/**
 * Subjects a path can actually teach or test. Shared lessons expand every
 * path's catalogue; path-scoped content expands only that path's. Beyond the
 * shelf, this is also what guards progress against a JAMB list being shown
 * to someone studying Post-UTME.
 */
export async function getPathSubjects(examIds: string[]): Promise<PathSubject[]> {
  const ids = [...new Set(examIds.filter(Boolean))].sort()
  if (ids.length === 0) return []
  return pathSubjectsCache(ids)
}
