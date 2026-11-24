import { statusForScore, type MasteryStatus } from '@/lib/mastery'

/**
 * MasteryRing: a MATHia-style progress ring for one subject.
 *
 * The arc shows ground covered and the colour plus centre label show the
 * mastery level. It shows a level, not a percentage, because mastery is
 * demonstrated in levels, not consumed like content. A learner who has not
 * started gets an empty grey ring, never a zero.
 */
const LEVEL: Record<MasteryStatus, { label: string; color: string }> = {
  secured: { label: 'Secured', color: '#22c55e' },
  developing: { label: 'Developing', color: '#f59e0b' },
  fragile: { label: 'Needs work', color: '#f97316' },
}

const R = 32
const CIRCUMFERENCE = 2 * Math.PI * R

export default function MasteryRing({ score, size = 78 }: { score: number | null; size?: number }) {
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score))
  const level = score === null ? null : statusForScore(score)
  const color = level ? LEVEL[level].color : '#d1d5db'
  const label = level ? LEVEL[level].label : 'Not started'

  return (
    <div
      className="shrink-0"
      role="img"
      aria-label={`${label}${score !== null ? `, ${pct} percent toward mastery` : ''}`}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        {pct > 0 && (
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(CIRCUMFERENCE * pct) / 100} ${CIRCUMFERENCE}`}
            transform="rotate(-90 40 40)"
          />
        )}
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fontWeight="800"
          fill={score === null ? '#9ca3af' : color}
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
