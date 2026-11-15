'use client'

import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

/** Route-level safety net for the admin shell: one clear way back, never a dead end. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-10 text-center">
      <h1 className="font-display text-2xl font-medium text-black">The admin view hit a problem</h1>
      <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-ink-soft">
        Something went wrong while loading this page. Your data is safe — this is only the view failing.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-soft hover:bg-gray-50 min-h-[44px]"
        >
          Back to the dashboard
        </Link>
      </div>
    </div>
  )
}
