'use client'

/**
 * QuestionTable: render a tabular question the way a candidate sees it in
 * the JAMB booklet. Mobile-first: horizontal scroll on narrow screens,
 * zebra rows for readability, header cells in caps.
 */
export interface QuestionTableSpec {
  headers: string[]
  rows: string[][]
  caption?: string
}

export function QuestionTable({ spec }: { spec: QuestionTableSpec }) {
  if (!spec || !Array.isArray(spec.headers) || !Array.isArray(spec.rows)) return null

  return (
    <div className="my-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-max border-collapse text-[13px] font-semibold text-ink-soft">
        {spec.caption && (
          <caption className="border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            {spec.caption}
          </caption>
        )}
        <thead>
          <tr>
            {spec.headers.map((header, i) => (
              <th
                key={i}
                className="border-b border-gray-200 bg-blue-50/60 px-4 py-2 text-left text-[12px] font-extrabold uppercase tracking-wide text-gray-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.rows.map((row, r) => (
            <tr key={r} className={r % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
              {row.map((cell, c) => (
                <td key={c} className="border-b border-gray-100 px-4 py-2 tabular-nums">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
