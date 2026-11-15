import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * One big number with a label and a destination. Used on the dashboard
 * for "what needs attention" cards.
 */
export default function StatCard({
  label,
  value,
  foot,
  href,
}: {
  label: string
  value: number
  foot?: ReactNode
  href: string
}) {
  const zero = value === 0
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(37,99,235,0.35)]"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft/80">
        {label}
      </p>
      <p className={`mt-2 font-display text-4xl font-medium tabular-nums leading-none ${zero ? 'text-ink-soft/50' : 'text-black'}`}>
        {value}
      </p>
      <p className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-blue-700">
        <span className="text-ink-soft/80">{foot}</span>
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  )
}
