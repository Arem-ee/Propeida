import { toLessonVisual } from '@/lib/notes/visual'

const COLOURS = ['#2563eb', '#d97706', '#16a34a'] as const

/**
 * An XY plot drawn as inline SVG. Four or fewer short series per chart,
 * at most three, and every label is real text so the figure scales,
 * translates and reads aloud like the rest of the library. Colours are
 * capped at three by contract.
 */
export default function ChartVisual({ visual }: { visual: unknown }) {
  const parsed = toLessonVisual(visual)
  if (!parsed || parsed.kind !== 'chart') return null
  const { caption, xLabel, yLabel, series } = parsed

  const W = 320
  const H = 212
  const padL = 44
  const padR = 8
  const padT = 10
  const padB = 34
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (const s of series) {
    for (const [x, y] of s.points) {
      if (x < xMin) xMin = x
      if (x > xMax) xMax = x
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
    }
  }
  if (xMin === xMax) xMax = xMin + 1
  if (yMin === yMax) yMax = yMin + 1
  // A little headroom on the y-axis so the curve never touches the frame.
  const yPad = (yMax - yMin) * 0.08
  yMax += yPad
  yMin -= yPad

  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW
  const sy = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * plotH

  const pathOf = (points: [number, number][]) =>
    points.map(([x, y], i) => (i === 0 ? 'M' : 'L') + sx(x).toFixed(2) + ' ' + sy(y).toFixed(2)).join(' ')

  const zeroY = yMin <= 0 && yMax >= 0 ? sy(0) : null

  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-vis-rule bg-white p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={caption}
      >
        {/* spines */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="1.4" />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="1.4" />
        {zeroY !== null && (
          <line x1={padL} y1={zeroY} x2={padL + plotW} y2={zeroY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
        )}
        {/* axes tick ordinals — small, plain numbers at the ends */}
        <text x={padL - 5} y={padT + plotH + 11} fontSize="9" fill="#94a3b8" textAnchor="end">{Math.round(xMin * 10) / 10}</text>
        <text x={padL + plotW} y={padT + plotH + 11} fontSize="9" fill="#94a3b8" textAnchor="end">{Math.round(xMax * 10) / 10}</text>
        <text x={padL - 6} y={padT + 4} fontSize="9" fill="#94a3b8" textAnchor="end">{Math.round(yMax * 10) / 10}</text>
        <text x={padL - 6} y={padT + plotH} fontSize="9" fill="#94a3b8" textAnchor="end">{Math.round(yMin * 10) / 10}</text>
        {/* curves */}
        {series.map((s, i) => (
          <path
            key={i}
            d={pathOf(s.points)}
            fill="none"
            stroke={COLOURS[i]}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {/* y axis label, rotated */}
        <text
          x={10}
          y={padT + plotH / 2}
          fontSize="9.5"
          fill="#64748b"
          fontWeight={700}
          textAnchor="middle"
          transform={`rotate(-90 10 ${padT + plotH / 2})`}
        >
          {yLabel}
        </text>
        {/* x axis label */}
        <text x={padL + plotW / 2} y={H - 4} fontSize="9.5" fill="#64748b" fontWeight={700} textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      {series.some((s) => s.label) && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1">
          {series.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
              <span aria-hidden="true" className="h-0.5 w-4 rounded" style={{ background: COLOURS[i] }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <figcaption className="mt-1.5 text-[12px] font-semibold leading-relaxed text-gray-600">
        {caption}
      </figcaption>
    </figure>
  )
}
