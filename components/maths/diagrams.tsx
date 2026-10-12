/**
 * Instructional diagram kit (docs: visual model before symbols).
 * SVG-only: crisp at any density, kilobytes not megabytes, no deps.
 * Every visual carries labels — decoration without a labelled connection
 * to the math is rejected at authoring review.
 */

export interface NumberLinePoint {
  value: number
  label: string
  color?: string
}

export function NumberLine({
  min,
  max,
  points,
  step = 1,
}: {
  min: number
  max: number
  points: NumberLinePoint[]
  step?: number
}) {
  const W = 560
  const H = 120
  const pad = 36
  const span = max - min || 1
  const x = (v: number) => pad + ((v - min) / span) * (W - pad * 2)

  const ticks: number[] = []
  for (let v = min; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Number line from ${min} to ${max}`}>
      <line x1={pad - 8} y1={64} x2={W - pad + 8} y2={64} stroke="#101c33" strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${W - pad + 8},64 ${W - pad - 2},59 ${W - pad - 2},69`} fill="#101c33" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={58} x2={x(t)} y2={70} stroke="#94a3b8" strokeWidth={1.5} />
          <text x={x(t)} y={88} textAnchor="middle" fontSize={13} fontWeight={700} fill="#64748b">{t}</text>
        </g>
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <line x1={x(p.value)} y1={64} x2={x(p.value)} y2={34} stroke={p.color ?? '#2563eb'} strokeWidth={2} strokeDasharray="3 3" />
          <circle cx={x(p.value)} cy={64} r={7} fill={p.color ?? '#2563eb'} stroke="#fff" strokeWidth={2.5} />
          <text x={x(p.value)} y={24} textAnchor="middle" fontSize={14} fontWeight={800} fill="#101c33">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

export function FractionBars({
  fractions,
}: {
  fractions: { numerator: number; denominator: number; color?: string; label?: string }[]
}) {
  const W = 560
  const rowH = 44
  const pad = 8
  const labelW = 72
  const H = fractions.length * (rowH + 18) + 8

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Fraction bars">
      {fractions.map((f, i) => {
        const y = 8 + i * (rowH + 18)
        const barX = pad + labelW
        const barW = W - barX - pad
        const segW = barW / Math.max(1, f.denominator)
        return (
          <g key={i}>
            <text x={pad} y={y + rowH / 2 + 5} fontSize={15} fontWeight={800} fill="#101c33">
              {f.label ?? `${f.numerator}/${f.denominator}`}
            </text>
            {Array.from({ length: f.denominator }).map((_, s) => (
              <rect
                key={s}
                x={barX + s * segW}
                y={y}
                width={Math.max(0, segW - 2)}
                height={rowH}
                rx={7}
                fill={s < f.numerator ? (f.color ?? '#2563eb') : '#eef2f7'}
                stroke={s < f.numerator ? undefined : '#cbd5e1'}
                strokeWidth={1.5}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function AlgebraBalance({
  left,
  right,
  tilt = 0,
}: {
  left: string[]
  right: string[]
  /** -1 (left down) .. 1 (right down); 0 balanced */
  tilt?: number
}) {
  const W = 560
  const cx = W / 2
  const beamY = 60
  const armLen = 190
  const angle = Math.max(-1, Math.min(1, tilt)) * 7
  const rad = (angle * Math.PI) / 180
  const lx = cx - Math.cos(rad) * armLen
  const ly = beamY - Math.sin(rad) * armLen
  const rx = cx + Math.cos(rad) * armLen
  const ry = beamY + Math.sin(rad) * armLen

  const pan = (px: number, py: number, terms: string[], key: string) => (
    <g key={key}>
      <line x1={px} y1={py} x2={px} y2={py + 34} stroke="#64748b" strokeWidth={2.5} />
      <rect x={px - 95} y={py + 34} width={190} height={10} rx={5} fill="#94a3b8" />
      {terms.map((t, i) => (
        <g key={i}>
          <rect
            x={px - 88 + (i % 2) * 92}
            y={py + 50 + Math.floor(i / 2) * 34}
            width={84}
            height={28}
            rx={9}
            fill={/x/i.test(t) ? '#dbeafe' : '#fef3c7'}
            stroke={/x/i.test(t) ? '#2563eb' : '#d97706'}
            strokeWidth={1.5}
          />
          <text
            x={px - 46 + (i % 2) * 92}
            y={py + 69 + Math.floor(i / 2) * 34}
            textAnchor="middle"
            fontSize={14}
            fontWeight={800}
            fill="#101c33"
          >
            {t}
          </text>
        </g>
      ))}
    </g>
  )

  const rows = Math.max(Math.ceil(left.length / 2), Math.ceil(right.length / 2))
  const totalH = 100 + rows * 34

  return (
    <svg viewBox={`0 0 ${W} ${totalH + 40}`} className="w-full" role="img" aria-label="Balance scale">
      <line x1={cx} y1={beamY - 34} x2={cx} y2={beamY} stroke="#101c33" strokeWidth={3} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#101c33" strokeWidth={5} strokeLinecap="round" />
      <circle cx={cx} cy={beamY} r={7} fill="#101c33" />
      {pan(lx, ly, left, 'l')}
      {pan(rx, ry, right, 'r')}
    </svg>
  )
}

export interface PlanePoint {
  x: number
  y: number
  label?: string
  color?: string
}

export function CoordinatePlane({
  points,
  range = 5,
}: {
  points: PlanePoint[]
  range?: number
}) {
  const W = 420
  const H = 420
  const pad = 30
  const span = range * 2 || 1
  const px = (v: number) => pad + ((v + range) / span) * (W - pad * 2)
  const py = (v: number) => pad + ((range - v) / span) * (H - pad * 2)

  const grid: number[] = []
  for (let v = -range; v <= range; v++) grid.push(v)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px] mx-auto" role="img" aria-label="Coordinate plane">
      {grid.map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={pad} x2={px(v)} y2={H - pad} stroke={v === 0 ? '#101c33' : '#e2e8f0'} strokeWidth={v === 0 ? 2 : 1} />
          <line x1={pad} y1={py(v)} x2={W - pad} y2={py(v)} stroke={v === 0 ? '#101c33' : '#e2e8f0'} strokeWidth={v === 0 ? 2 : 1} />
        </g>
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={px(p.x)} cy={py(p.y)} r={8} fill={p.color ?? '#2563eb'} stroke="#fff" strokeWidth={2.5} />
          {p.label && (
            <text x={px(p.x) + 12} y={py(p.y) - 10} fontSize={14} fontWeight={800} fill="#101c33">
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
