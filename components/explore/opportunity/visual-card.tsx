import type { ReactNode } from 'react'
import { VisualBox } from '@/components/explore/visuals/visual-box'
import type { AccentKey, ResolvedVisual } from '@/lib/explore/visual-scenes'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

export function Kicker({ children, accent }: { children: ReactNode; accent: AccentKey }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
      {children}
    </p>
  )
}

export function Transition({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="mx-auto max-w-2xl text-center font-serif text-xl italic leading-relaxed text-slate-500 sm:text-2xl">
        {children}
      </p>
    </div>
  )
}

interface SectionShellProps {
  id?: string
  accent: AccentKey
  kicker?: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionShell({
  id,
  accent,
  kicker,
  title,
  intro,
  children,
  className = '',
}: SectionShellProps) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {kicker ? <Kicker accent={accent}>{kicker}</Kicker> : null}
        <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h2>
        {intro ? <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{intro}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

interface SceneCardProps {
  visual?: ResolvedVisual
  accent: AccentKey
  className?: string
  children: ReactNode
}

export function SceneCard({ visual, accent, className = '', children }: SceneCardProps) {
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {visual ? (
        <div className={`relative aspect-[4/3] w-full ${ACCENT_STYLES[accent].soft}`}>
          <VisualBox visual={visual} className="absolute inset-0 h-full w-full" sizes="(min-width: 1024px) 33vw, 50vw" />
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </article>
  )
}