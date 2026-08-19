'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Briefcase, GraduationCap, School, Loader2 } from 'lucide-react'
import type { SearchResults } from '@/lib/explore/types'
import { EXPLORE_SEARCH_DEBOUNCE_MS } from '@/lib/explore/constants'

export default function ExploreSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      setResults(null)
      setLoading(false)
      return
    }
    const id = ++requestId.current
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(trimmed)}`)
      const json = await res.json()
      if (requestId.current === id) {
        setResults(json as SearchResults)
        setLoading(false)
      }
    } catch {
      if (requestId.current === id) {
        setResults(null)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => runSearch(q), EXPLORE_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [q, runSearch])

  const total = results
    ? results.careers.length + results.courses.length + results.universities.length
    : 0

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onFocus={() => q.trim() && setOpen(true)}
          placeholder="Search careers, courses, universities…"
          aria-label="Search careers, courses and universities"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-10 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[52px]"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
        )}
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          {loading && !results && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Searching…</p>
          )}

          {!loading && total === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-semibold text-gray-700">No matches for “{q.trim()}”</p>
              <p className="mt-1 text-xs text-gray-400">
                Try a different keyword, or browse by category below.
              </p>
            </div>
          )}

          {!loading && total > 0 && (
            <div className="max-h-[70vh] overflow-y-auto py-1">
              {results && results.careers.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Careers
                  </p>
                  {results.careers.map((item) => (
                    <Link
                      key={item.id}
                      href={`/explore/careers/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <Briefcase className="h-4 w-4 shrink-0 text-blue-500" />
                      <span className="truncate text-sm font-semibold text-gray-800">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results && results.courses.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Courses
                  </p>
                  {results.courses.map((item) => (
                    <Link
                      key={item.id}
                      href={`/explore/courses/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <GraduationCap className="h-4 w-4 shrink-0 text-blue-500" />
                      <span className="truncate text-sm font-semibold text-gray-800">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results && results.universities.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Universities
                  </p>
                  {results.universities.map((item) => (
                    <Link
                      key={item.id}
                      href={`/explore/universities/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <School className="h-4 w-4 shrink-0 text-blue-500" />
                      <span className="truncate text-sm font-semibold text-gray-800">{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={`/explore/careers?q=${encodeURIComponent(q.trim())}`}
                onClick={() => setOpen(false)}
                className="block border-t border-gray-50 px-4 py-2.5 text-center text-xs font-bold text-blue-600 hover:bg-blue-50"
              >
                View all career results
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}