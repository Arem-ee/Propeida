'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, Target, ArrowRight, BarChart3 } from 'lucide-react'
import ComingSoon from '@/components/coming-soon'
import { getSessionHistory } from '@/lib/actions/practice'

interface HistoryItem {
  id: string
  examName: string
  examSlug: string
  mode: string
  score: number
  accuracy: number
  completedAt: string
}

export default function HistoryPage() {
  const searchParams = useSearchParams()
  const hub = searchParams.get('hub') === 'universities' ? 'universities' : 'jamb'
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSessionHistory(hub)
        setHistory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hub])

  if (hub === 'jamb') {
    return <ComingSoon />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {hub === 'universities' ? 'University Session History' : 'Session History'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">All your completed practice and mock exam sessions.</p>
        </div>
        <Link
          href={`/practice${hub === 'universities' ? '?hub=universities' : ''}`}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
        >
          <Target className="h-4 w-4" />
          New Session
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-900">No sessions yet</h2>
          <p className="mt-1 text-sm text-gray-500 mb-4">Complete a practice or mock exam to see your results here.</p>
          <Link
            href={`/practice${hub === 'universities' ? '?hub=universities' : ''}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px]"
          >
            Start your first session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const accuracyPct = Math.round(item.accuracy * 100)
            const date = new Date(item.completedAt).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const time = new Date(item.completedAt).toLocaleTimeString('en-NG', {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <Link
                key={item.id}
                href={`/results/${item.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 sm:p-5 hover:border-blue-200 hover:bg-blue-50/10 transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{item.examName}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-bold capitalize ${
                        item.mode === 'mock' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {date}, {time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-gray-900">{item.score}</div>
                    <div className={`text-xs font-semibold ${accuracyPct >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {accuracyPct}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
