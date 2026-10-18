'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div role="alert">
        <h2 className="font-display text-2xl font-medium text-black">That did not load</h2>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-relaxed text-ink-soft">
          Something interrupted this page. Your answers so far are saved.
        </p>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[52px] cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-soft hover:bg-gray-50 min-h-[52px]"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
