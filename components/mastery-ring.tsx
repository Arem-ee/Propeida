/**
 * MasteryRing: a progress ring for one subject.
 *
 * The arc shows the subject's accuracy score (an exponential average of the
 * learner's correct answers), NOT how much of the syllabus has been covered.
 * Keep that distinction visible in the page copy: a bare number reads as
 * coverage and misleads a learner who has only answered one question.
 */
const R = 32
const CIRCUMFERENCE = 2 * Math.PI * R
const FILL = '#22c55e'

export default function MasteryRing({ score, size = 96 }: { score: number | null; size?: number }) {
  const started = score !== null
  const fill = started ? Math.max(0, Math.min(100, score)) : 0
  // A tracked subject that scored zero still shows a small mark so it is
  // never mistaken for a subject that was never attempted.
  const arc = started ? Math.max(fill, 3) : 0
  const aria = started ? `${fill}% accuracy so far, not topics covered` : 'Not started'

  return (
    <div className="shrink-0" role="img" aria-label={aria} title={aria}>
      <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        {arc > 0 && (
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={FILL}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(CIRCUMFERENCE * arc) / 100} ${CIRCUMFERENCE}`}
            transform="rotate(-90 40 40)"
          />
        )}
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="19"
          fontWeight="800"
          fill={started ? '#166534' : '#9ca3af'}
        >
          {started ? `${fill}%` : '—'}
        </text>
      </svg>
    </div>
  )
}
