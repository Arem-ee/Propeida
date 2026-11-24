'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/error-log'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError('error-boundary', error)
    void fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: 'page',
        message: error.message.slice(0, 500),
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {})
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div role="alert">
        <h1 className="font-display text-2xl font-medium text-black">Something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-relaxed text-ink-soft">
          We could not load this page, but your saved progress is safe
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-bold text-ink-soft hover:bg-gray-50 min-h-[44px]"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
