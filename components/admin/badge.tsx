/** Status pills and verification dots — shared by the bank, the review queue, and the dashboard. */

const QUESTION_STATUS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_review: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
}

export function QuestionStatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold capitalize ${
        QUESTION_STATUS[status] ?? QUESTION_STATUS.draft
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

const VERIFIED_DOT: Record<string, string> = {
  unverified: 'bg-red-500',
  source_cited: 'bg-amber-500',
  human_verified: 'bg-emerald-500',
}

export const VERIFIED_LABELS: Record<string, string> = {
  unverified: 'Unverified',
  source_cited: 'Source-cited',
  human_verified: 'Human-verified',
}

export function VerifiedDot({ state }: { state: string }) {
  return (
    <span
      role="img"
      aria-label={VERIFIED_LABELS[state] ?? state}
      title={VERIFIED_LABELS[state] ?? state}
      className={`inline-block h-2 w-2 rounded-full ${VERIFIED_DOT[state] ?? VERIFIED_DOT.unverified}`}
    />
  )
}

const LESSON_STATUS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  retired: 'bg-red-100 text-red-700',
}

export function LessonStatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold capitalize ${
        LESSON_STATUS[status] ?? LESSON_STATUS.draft
      }`}
    >
      {status}
    </span>
  )
}
