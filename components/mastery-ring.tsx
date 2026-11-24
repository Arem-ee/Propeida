import { statusForScore, type MasteryStatus } from '@/lib/mastery'

/**
 * MasteryRing: a progress ring for one subject.
 *
 * The arc shows how far the learner has gone: it fills to the raw mastery
 * score, so more practice evidence means a fuller ring. The qualitative
 * level is carried by the label inside, not by changing the arc colour,
 * because one brand colour reads as progress while a traffic-light scheme
 * reads as a judgement. An unstarted subject gets an empty grey ring.
 */
const LEVEL: Record<MasteryStatus, string> = {
  secured: 'Secured',
  developing: 'Developing',
  fragile: 'Needs work',
}

const R = 32
const CIRCUMFERENCE = 2 * Math.PI * R
const FILL = '#2563eb'

export default function MasteryRing({ score, size = 96 }: { score: number | null; size?: number }) {
  const level = score === null ? null : statusForScore(score)
  const label = level ? LEVEL[level] : 'Not started'
  const fill = score === null ? 0 : Math.max(0, Math.min(100, score))
  // A tracked subject that scored zero still shows a small mark so it is
  // never mistaken for a subject that was never attempted.
  const arc = score === null ? 0 : Math.max(fill, 3)
  const aria = score === null
    ? 'Not started'
    : `${label}, ${fill}% of the way along`

  return (
    <div className="shrink-0" role="img" aria-label={aria}>
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
          fontSize={fill >= 100 ? 8.5 : 8}
          fontWeight="800"
          fill={score === null ? '#9ca3af' : '#1f2937'}
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
