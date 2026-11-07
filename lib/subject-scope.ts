/**
 * Which subjects are standalone revision verticals, not UTME exam subjects.
 *
 * `current-affairs` lives in the lessons library (its own curriculum,
 * revision notes and published lessons) but it is not a JAMB UTME elective
 * and must not appear in the JAMB/Post-UTME practice, mock or onboarding
 * subject pickers. Filtering here keeps the rule in one place.
 *
 * Client-safe: no server imports.
 */
export const STANDALONE_SUBJECT_SLUGS = ['current-affairs'] as const

export type StandaloneSubjectSlug = (typeof STANDALONE_SUBJECT_SLUGS)[number]

export function isStandaloneSubject(subjectSlug: string): boolean {
  return (STANDALONE_SUBJECT_SLUGS as readonly string[]).includes(subjectSlug)
}

export interface ScopeLike {
  target: 'jamb' | 'post-utme' | 'general'
  restricted: boolean
}

/**
 * Subjects for a learner's exam path. Standalone verticals (Current Affairs)
 * are scoped out of JAMB and Post-UTME pickers; general study sees all.
 */
export function filterSubjectsForScope<T extends { slug: string }>(
  subjects: T[],
  scope: ScopeLike | null | undefined,
): T[] {
  if (!scope || !scope.restricted) return subjects
  if (scope.target === 'general') return subjects
  return subjects.filter((subject) => !isStandaloneSubject(subject.slug))
}

/**
 * Same rule applied to an exam → subject-ids map, given the full subject
 * rows so ids can be resolved to slugs. Keeps the picker's default
 * (no explicit selection) in sync with the visible subjects.
 */
export function filterExamSubjectMapForScope(
  examSubjectMap: Record<string, string[]>,
  subjects: { id: string; slug: string }[],
  scope: ScopeLike | null | undefined,
): Record<string, string[]> {
  if (!scope || !scope.restricted || scope.target === 'general') return examSubjectMap
  const excludedIds = new Set(
    subjects.filter((s) => isStandaloneSubject(s.slug)).map((s) => s.id),
  )
  if (excludedIds.size === 0) return examSubjectMap
  const out: Record<string, string[]> = {}
  for (const [examId, subjectIds] of Object.entries(examSubjectMap)) {
    out[examId] = subjectIds.filter((id) => !excludedIds.has(id))
  }
  return out
}
