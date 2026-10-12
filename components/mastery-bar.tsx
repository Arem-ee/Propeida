/**
 * MasteryBar: position on a red→green spectrum with a needle marker.
 * Shows ground covered, never numbers: no percents, no scores, no totals.
 * Null score (untracked) renders an empty track, not a zero.
 */
export default function MasteryBar({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div
        className="h-2.5 w-full rounded-full bg-gray-100"
        role="img"
        aria-label="Not started yet"
      />
    )
  }
  const clamped = Math.max(0, Math.min(100, score))
  return (
    <div
      className="relative h-2.5 w-full rounded-full"
      role="img"
      aria-label={`Mastery zone: ${clamped >= 80 ? 'secured' : clamped >= 50 ? 'developing' : 'needs work'}`}
      style={{
        background: 'linear-gradient(to right, #ef4444, #f97316, #eab308 45%, #84cc16 70%, #22c55e)',
      }}
    >
      <span
        className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-black shadow"
        style={{ left: `calc(${clamped}% - 1px)` }}
      />
    </div>
  )
}
