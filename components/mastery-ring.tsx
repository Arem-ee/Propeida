import { MASTERY_CONFIG, statusForScore, type MasteryStatus } from '@/lib/mastery'

/**
 * MasteryRing: a MATHia-style progress ring for one subject.
 *
 * The arc shows progress toward mastery, not raw accuracy and not content
 * covered. It fills relative to the Secured threshold, so reaching mastery
 * is a full ring. A raw accuracy of 80 is not "80% of the subject learned",
 * so showing it as a 80%-full ring would be dishonest. The colour and centre
 * label carry the level; unstarted subjects get an empty grey ring, and a
 * tracked subject that scored zero keeps a visible mark so the two states
 * cannot be confused.
 */
const LEVEL: Record<MasteryStatus, { label: string; color: string }> = {
  secured: { label: 'Secured', color: '#22c55e' },
  developing: { label: 'Developing', color: '#f59e0b' },
  fragile: { label: 'Needs work', color: '#f97316' },
}

const R = 32
const CIRCUMFERENCE = 2 * Math.PI * R

export default function MasteryRing({ score, size = 96 }: { score: number | null; size?: number }) {
  const level = score === null ? null : statusForScore(score)
  const color = level ? LEVEL[level].color : '#d1d5db'
  const label = level ? LEVEL[level].label : 'Not started'
  const fill = score === null
    ? 0
    : Math.min(100, Math.max(0, (score / MASTERY_CONFIG.securedScore) * 100))
  // A tracked subject with a zero score still shows a small mark so it is
  // never mistaken for a subject that was never attempted.
  const arc = score === null ? 0 : Math.max(fill, 3)
  const aria = score === null
    ? 'Not started'
    : `${label}, ${fill >= 100 ? 'mastery reached' : `${Math.round(fill)} percent toward mastery`}`

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
            stroke={color}
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
          fontSize={level === 'secured' ? 8.5 : 8}
          fontWeight="800"
          fill={score === null ? '#9ca3af' : color}
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
