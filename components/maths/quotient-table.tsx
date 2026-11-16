export interface QuotientRow {
  dividend: number
  remainder: number
}

export function QuotientTable({
  divisor,
  rows,
  caption,
}: {
  divisor: number
  rows: QuotientRow[]
  caption?: string
}) {
  if (!rows || rows.length === 0) return null
  const W = 520
  const rowH = 50
  const pad = 18
  const topPad = 14
  const botPad = 28
  const H = rows.length * rowH + topPad + botPad

  const col1W = 78
  const col2W = 170
  const col3W = 130
  const inner = pad + col1W + 14 + col2W + 14 + col3W

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={caption ?? `Division by ${divisor} with remainders`}>
      {rows.map((row, i) => {
        const y = topPad + i * rowH + rowH / 2 + 5
        return (
          <g key={i}>
            <text x={pad} y={y} fontSize={16} fontWeight={800} fill="#101c33" textAnchor="middle">
              {divisor}
            </text>
            <line x1={pad + col1W / 2 + 6} y1={topPad + i * rowH + 12} x2={pad + col1W / 2 + 6} y2={topPad + i * rowH + rowH - 12} stroke="#101c33" strokeWidth={2.25} strokeLinecap="round" />
            <text x={pad + col1W / 2 + 16} y={y} fontSize={15} fontWeight={700} fill="#101c33">
              {row.dividend}
            </text>
            <text x={inner - col3W + 8} y={y} fontSize={14} fontWeight={800} fill="#2563eb">
              remainder {row.remainder}
            </text>
            {i < rows.length - 1 && (
              <line x1={pad} y1={topPad + (i + 1) * rowH} x2={inner - 10} y2={topPad + (i + 1) * rowH} stroke="#cbd5e1" strokeWidth={1.25} />
            )}
          </g>
        )
      })}
      <text x={pad + col1W / 2 + 14} y={H - 8} fontSize={13} fontWeight={800} fill="#2563eb">
        ↑ read remainders from bottom: {rows.map(r => r.remainder).reverse().join(' ')}
      </text>
    </svg>
  )
}
