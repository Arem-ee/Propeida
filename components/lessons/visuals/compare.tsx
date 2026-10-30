import { toLessonVisual } from '@/lib/notes/visual'

/**
 * A two-way contrast. On a phone the two values stay side by side under a
 * full-width feature label, so the comparison survives at 360px without a
 * horizontal scroll or a duplicated card layout.
 */
export default function CompareVisual({ visual }: { visual: unknown }) {
  const parsed = toLessonVisual(visual)
  if (!parsed || parsed.kind !== 'compare') return null
  const { caption, columns, rows } = parsed

  return (
    <figure className="mt-4">
      <div className="overflow-hidden rounded-xl border border-vis-rule">
        <table className="w-full border-collapse text-left max-sm:block">
          <caption className="border-b border-vis-rule bg-vis-tint px-3 py-2 text-left text-[12px] font-extrabold leading-relaxed text-vis-accent-strong max-sm:block">
            {caption}
          </caption>
          <thead className="max-sm:block">
            <tr className="max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:px-3 max-sm:py-2">
              <th
                scope="col"
                className="w-[24%] px-3 py-2 text-[11px] font-extrabold uppercase tracking-wide text-gray-600 max-sm:hidden"
              >
                Aspect
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-[12px] font-extrabold leading-snug text-ink max-sm:px-0 max-sm:py-0"
              >
                {columns[0]}
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-[12px] font-extrabold leading-snug text-ink max-sm:px-0 max-sm:py-0"
              >
                {columns[1]}
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {rows.map((row, i) => (
              <tr
                key={`${row.feature}-${i}`}
                className="border-t border-vis-rule align-top max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-3 max-sm:gap-y-1 max-sm:px-3 max-sm:py-3"
              >
                <th
                  scope="row"
                  className="px-3 py-2.5 text-[13px] font-extrabold leading-snug text-ink max-sm:col-span-2 max-sm:px-0 max-sm:py-0"
                >
                  {row.feature}
                </th>
                <td className="px-3 py-2.5 text-[13px] font-semibold leading-relaxed text-ink-soft max-sm:px-0 max-sm:py-0">
                  {row.left}
                </td>
                <td className="px-3 py-2.5 text-[13px] font-semibold leading-relaxed text-ink-soft max-sm:px-0 max-sm:py-0">
                  {row.right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
