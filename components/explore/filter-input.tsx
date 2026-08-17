'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { EXPLORE_SEARCH_DEBOUNCE_MS } from '@/lib/explore/constants'

export default function ExploreFilterInput({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const trimmed = value.trim()
      if (trimmed) params.set('q', trimmed)
      else params.delete('q')
      router.replace(`?${params.toString()}`)
    }, EXPLORE_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [value, router, searchParams])

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[44px]"
      />
    </div>
  )
}