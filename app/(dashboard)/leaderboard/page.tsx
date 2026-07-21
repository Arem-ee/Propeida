'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, TrendingUp, School } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { getLeaderboardData, getLeaderboardExams } from '@/lib/actions/leaderboard'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarIndex: number | null
  score: number
  schoolName: string | null
  schoolSlug: string | null
}

interface ExamOption {
  id: string
  name: string
  slug: string
}

export default function LeaderboardPage() {
  const searchParams = useSearchParams()
  const hub = searchParams.get('hub') === 'universities' ? 'universities' : 'jamb'
  const [period, setPeriod] = useState<'all_time' | 'weekly'>('all_time')
  const [examSlug, setExamSlug] = useState<string | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [exams, setExams] = useState<ExamOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getLeaderboardExams().then((data) => {
      setExams(data)
      if (hub === 'universities') {
        const firstSchool = data.find((e) => e.slug !== 'jamb')
        if (firstSchool) setExamSlug(firstSchool.slug)
      }
    }).catch(() => {})
  }, [hub])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getLeaderboardData(period, examSlug)
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [period, examSlug])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {hub === 'universities' ? 'University Leaderboard' : 'Leaderboard'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Top scorers by exam.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPeriod('all_time')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold min-h-[44px] cursor-pointer ${
                period === 'all_time' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              All Time
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold min-h-[44px] cursor-pointer ${
                period === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Weekly
            </button>
          </div>

          {exams.length > 0 && (
            <select
              value={examSlug ?? ''}
              onChange={(e) => setExamSlug(e.target.value || null)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 bg-white min-h-[44px]"
            >
              <option value="">JAMB (Global)</option>
              {exams.filter((e) => e.slug !== 'jamb').map((e) => (
                <option key={e.id} value={e.slug}>{e.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{error}</div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center">
          <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No entries yet</p>
          <p className="text-xs text-gray-400 mt-1">Complete exams to appear on the leaderboard.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div key={entry.userId} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-3.5">
              <span className={`text-sm font-bold w-8 text-center ${i < 3 ? 'text-lg' : 'text-gray-400'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
              </span>
              <Avatar username={entry.username} avatarIndex={entry.avatarIndex} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{entry.username}</p>
                {entry.schoolName && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <School className="h-3 w-3" /> {entry.schoolName}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{entry.score.toFixed(1)}</p>
                <p className="text-xs text-gray-400">score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
