'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Clock } from 'lucide-react'

export interface PracticeHistoryItem {
  id: string
  examName: string
  mode: string
  accuracy: number | null
  completedAt: string
}

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'highest', label: 'Highest score' },
  { key: 'lowest', label: 'Lowest score' },
]

export default function PracticeHistory({
  items,
  limit,
}: {
  items: PracticeHistoryItem[]
  limit: number
}) {
  const [sort, setSort] = useState<SortKey>('newest')

  const visible = useMemo(() => {
    const sorted = [...items]
    sorted.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        case 'highest':
          return (b.accuracy ?? 0) - (a.accuracy ?? 0)
        case 'lowest':
          return (a.accuracy ?? 0) - (b.accuracy ?? 0)
        default:
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      }
    })
    return sorted.slice(0, limit)
  }, [items, limit, sort])

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Sort past practice">
        {SORTS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSort(option.key)}
            aria-pressed={sort === option.key}
            className={`rounded-full px-3 py-2 text-[11px] font-extrabold min-h-[40px] transition-all ${
              sort === option.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-ink-soft border border-blue-100/70 hover:border-blue-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {visible.map((item) => {
          const accuracy = item.accuracy ?? 0
          return (
            <Link
              key={item.id}
              href={`/results/${item.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-blue-100/70 bg-white px-4 py-3.5 hover:border-blue-300 transition-all min-h-[60px] pressable"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                accuracy >= 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
              }`}>
                {accuracy >= 0.8
                  ? <Check className="h-5 w-5" strokeWidth={3} />
                  : <Clock className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-extrabold text-black">{item.examName}</span>
                <span className="block text-xs font-bold text-gray-500 capitalize">
                  {item.mode} · {new Date(item.completedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                </span>
              </span>
              <span className="font-display text-lg font-medium text-black shrink-0">
                {Math.round(accuracy * 100)}%
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
