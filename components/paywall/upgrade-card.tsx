import Link from 'next/link'
import { Lock } from 'lucide-react'

/**
 * The calm paywall. One idea, one action: Pro is what opens this.
 * No timers, no threats, no countdowns. Inline everywhere (locked
 * lesson, review teaser, progress map, mock cap) so it feels like
 * one voice, not a series of pop-ups.
 */
export default function UpgradeCard({
  title,
  body,
  bullets,
}: {
  title: string
  body: string
  bullets?: string[]
}) {
  return (
    <div className="rounded-3xl border-2 border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Lock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium text-black">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink-soft">{body}</p>
        </div>
      </div>
      {bullets && bullets.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm font-semibold text-ink-soft">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/pricing"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px] pressable"
        >
          See Pro
        </Link>
        <Link
          href="/home"
          className="inline-flex flex-1 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-ink-soft hover:bg-gray-50 min-h-[48px] pressable"
        >
          Not now
        </Link>
      </div>
    </div>
  )
}

export const PRO_BULLETS = [
  'Every lesson, every subject.',
  'Unlimited practice and mocks.',
  'Reviews that keep things in memory.',
]
