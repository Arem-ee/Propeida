import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'

/**
 * The one table in the admin: same wrapper, same head, same empty row
 * everywhere. Staff tool density, but warm-paper styling.
 */
export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <table className="min-w-full divide-y divide-gray-100">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50/80">{children}</thead>
}

export function Th({ className = '', children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className={`px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-ink-soft/80 ${className}`}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function Td({ className = '', children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...rest} className={`px-4 py-3 text-sm text-ink-soft ${className}`}>
      {children}
    </td>
  )
}

/** Full-width row shown when a filtered list is empty. */
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center text-sm font-semibold text-ink-soft">
        {children}
      </td>
    </tr>
  )
}
