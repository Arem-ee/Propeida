'use client'

import Link from 'next/link'
import { WifiOff, RotateCcw } from 'lucide-react'

/** Loading: skeleton cards in layout shape, never blank spinners. */
export function LoadingCards({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-blue-100/60 bg-white p-5 sm:p-6 animate-pulse"
        >
          <div className="h-3 w-24 rounded-full bg-blue-100" />
          <div className="mt-3 h-6 w-3/4 rounded-lg bg-gray-100" />
          <div className="mt-2 h-4 w-1/2 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

/**
 * Empty: status + one-line teaching + one verb CTA + optional quiet link.
 * Never "No data," never 0%.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string
  body: string
  actionLabel: string
  actionHref: string
  secondaryLabel?: string
  secondaryHref?: string
}) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center">
        <span className="font-display text-3xl text-blue-300">?</span>
      </div>
      <h2 className="font-display text-2xl font-medium text-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-relaxed text-ink-soft">{body}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] min-h-[52px] transition-all"
      >
        {actionLabel}
      </Link>
      {secondaryLabel && secondaryHref && (
        <div className="mt-3">
          <Link href={secondaryHref} className="text-xs font-bold text-gray-500 hover:text-gray-600 min-h-[40px] inline-flex items-center">
            {secondaryLabel}
          </Link>
        </div>
      )}
    </div>
  )
}

/** Offline: slim persistent bar. Queued work syncs; nothing is lost. */
export function OfflineBar({ queuedCount = 0 }: { queuedCount?: number }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs font-bold text-amber-800">
        Offline — answers save on this device and sync later.
        {queuedCount > 0 && ` ${queuedCount} waiting to sync.`}
      </p>
    </div>
  )
}

/** Error with a way back. Every dead end has a door. */
export function ErrorState({
  message,
  onRetry,
  backHref = '/',
  backLabel = 'Go home',
}: {
  message: string
  onRetry?: () => void
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center">
      <p className="text-[15px] font-bold text-red-700">{message}</p>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        )}
        <Link
          href={backHref}
          className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-soft min-h-[48px]"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  )
}
