import type { ReactNode } from 'react'

/** Shared form chrome: labels, inputs, notices — one voice across admin forms. */

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-black min-h-[44px] placeholder:text-gray-400 transition-colors focus:border-blue-600 focus:outline-none'

export const textareaClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-black resize-y placeholder:text-gray-400 transition-colors focus:border-blue-600 focus:outline-none'

export const labelClass =
  'block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft mb-1.5'

export const selectClass = inputClass

/** Labelled field wrapper. hint renders under the label, not the input. */
export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {hint && <p className="-mt-1 mb-1.5 text-[11px] font-semibold text-ink-soft/70">{hint}</p>}
      {children}
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
      {children}
    </div>
  )
}

export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
      {children}
    </div>
  )
}

export function FormCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${className}`}>
      {children}
    </div>
  )
}
