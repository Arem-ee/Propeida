'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, X } from 'lucide-react'

const STORAGE_KEY = 'propeida-support-cta-dismissed'

const EXCLUDED_PATHS = ['/support', '/practice/session', '/results']

export default function SupportOverlay() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (EXCLUDED_PATHS.some((prefix) => pathname.startsWith(prefix))) return

    let dismissed = false
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {}

    if (dismissed) return

    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [pathname])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Heart className="h-5 w-5" />
      </div>

      <h2 className="text-base font-semibold text-gray-900">Help improve Propeida</h2>
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
        We&apos;re expanding our question bank, building revision notes, and improving the platform. If
        you&apos;d like to support the work behind Propeida, you can help us keep building.
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          href="/support"
          onClick={dismiss}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Heart className="h-4 w-4" />
          Support Propeida
        </Link>
        <button
          onClick={dismiss}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 min-h-[44px] cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
