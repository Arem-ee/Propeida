'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmOptions {
  title: string
  body?: string
  confirmLabel?: string
  /** danger styles the confirm button in red */
  tone?: 'danger' | 'default'
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void
}

/**
 * Promise-based confirmation dialog: drop-in replacement for window.confirm
 * that matches the admin design system and stays keyboard accessible.
 *
 *   const { confirm, dialog } = useConfirm()
 *   if (await confirm({ title: 'Delete 3 questions?', tone: 'danger' })) { ... }
 *   return <>{dialog}</>
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const titleId = useId()

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  )

  const settle = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  // Escape closes from anywhere, regardless of which child holds focus
  useEffect(() => {
    if (!pending) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') settle(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pending, settle])

  const dialog = pending ? (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-black/45"
        onClick={() => settle(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl border border-blue-100/60 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${pending.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-medium leading-snug text-black">
              {pending.title}
            </h2>
            {pending.body && (
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-ink-soft">{pending.body}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => settle(false)}
            className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-ink-soft hover:bg-gray-50 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => settle(true)}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold text-white min-h-[44px] ${
              pending.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {pending.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, dialog }
}
