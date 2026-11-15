import type { ReactNode } from 'react'

/**
 * One header for every admin page: eyebrow (optional section label),
 * display title, plain-language description of what this page is for,
 * and an actions slot on the right.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-[28px] font-medium leading-tight tracking-tight text-black">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}
