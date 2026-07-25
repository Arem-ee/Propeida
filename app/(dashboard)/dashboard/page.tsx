'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Target, Flame, Zap, Check, X, ChevronRight, ArrowRight } from 'lucide-react'
import { getDashboardData, submitDailyQuestion } from '@/lib/actions/dashboard'
import { claimReferral } from '@/lib/actions/referral'
import { useHub } from '@/components/dashboard-hub-provider'

interface DailyQuestionData {
  id: string | null
  attempt: { is_correct: boolean } | null
}

export default function DashboardPage() {
  const { hub } = useHub()
  const [username, setUsername] = useState('')
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestionData>({ id: null, attempt: null })
  const [lastSession, setLastSession] = useState<{ id: string; examName: string; score: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const data = await Promise.race([
        getDashboardData(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Dashboard data timed out — check browser console for details')), 15000)
        ),
      ])
      setUsername(data.profile.username)
      setStreak(data.streak)
      setDailyQuestion(data.dailyQuestion)
      const first = data.recentSessions[0]
      if (first) {
        setLastSession({ id: first.id, examName: first.examName, score: first.score })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    try {
      const pendingRef = localStorage.getItem('pending_ref')
      if (pendingRef) {
        claimReferral(pendingRef).catch(() => {}) // best-effort
      }
    } catch {
    } finally {
      try { localStorage.removeItem('pending_ref') } catch {}
    }
  }, [])

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
        <button onClick={loadData} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {username ? `Good ${getTimeOfDay()}, ${username}` : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {hub === 'universities' ? 'University hub' : 'JAMB hub'} — pick up where you left off.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
        <Link
          href={`/practice${hub === 'universities' ? '?hub=universities' : ''}`}
          className="sm:col-span-2 rounded-xl border border-gray-100 bg-white p-5 sm:p-6 hover:border-blue-200 hover:bg-blue-50/10 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="rounded-xl bg-blue-100 p-2.5 inline-flex mb-3">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Start a session</h2>
              <p className="text-sm text-gray-500 mt-0.5">Practice questions or take a mock exam.</p>
            </div>
            <ChevronRight className="h-6 w-6 text-gray-300" />
          </div>
          {lastSession && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
              <span>Last session:</span>
              <span className="font-semibold text-gray-700">{lastSession.examName}</span>
              <span className="ml-auto font-bold text-gray-900">{lastSession.score}</span>
            </div>
          )}
        </Link>

        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="rounded-xl bg-amber-100 p-2">
              <Flame className="h-4 w-4 text-amber-600" />
            </div>
            {streak.current_streak >= 3 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" /> On fire
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-gray-900">{streak.current_streak}</span>
            <span className="text-xs text-gray-400 font-semibold">day streak</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Best: {streak.longest_streak} days</p>
        </div>

        <DailyQuestionTile
          dailyQuestion={dailyQuestion}
          onSubmit={async (answer: string) => {
            if (!dailyQuestion.id) return
            const result = await submitDailyQuestion(dailyQuestion.id, answer)
            setDailyQuestion((prev) => ({ ...prev, attempt: { is_correct: result.isCorrect } }))
            loadData()
            return result
          }}
        />

        <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-white px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {hub === 'universities'
              ? 'Practice for your target universities and climb the leaderboard.'
              : 'Practice JAMB questions and climb the leaderboard.'}
          </p>
          <Link
            href={`/leaderboard${hub === 'universities' ? '?hub=universities' : ''}`}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 shrink-0 min-h-[36px] flex items-center"
          >
            Leaderboard
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function DailyQuestionTile({
  dailyQuestion,
  onSubmit,
}: {
  dailyQuestion: DailyQuestionData
  onSubmit: (answer: string) => Promise<{ isCorrect: boolean; correctAnswer: string } | undefined>
}) {
  const [dqData, setDqData] = useState<{
    dailyQuestionId: string
    question: { id: string; text: string; options: { key: string; text: string }[]; subjectName: string | null }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (dailyQuestion.attempt !== null) {
      setLoading(false)
      return
    }
    fetch('/api/daily-question')
      .then((r) => r.json())
      .then((data) => {
        if (data.question) setDqData(data)
        setLoading(false)
      })
      .catch(() => { setFetchError(true); setLoading(false) })
  }, [dailyQuestion.attempt])

  const handleSubmit = async () => {
    if (!selected || !dqData) return
    setSubmitting(true)
    try {
      const submitted = await onSubmit(selected)
      if (submitted) {
        setResult({ isCorrect: submitted.isCorrect, correctAnswer: submitted.correctAnswer })
      }
    } catch { setSubmitting(false) }
  }

  const attempted = dailyQuestion.attempt
  if (attempted || result) {
    const isCorrect = result?.isCorrect ?? attempted?.is_correct
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-xl bg-blue-100 p-1.5">
            <Check className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Question</span>
        </div>
        <div className={`flex items-center gap-2 rounded-xl p-3 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          {isCorrect ? (
            <><Check className="h-4 w-4 text-green-600" /><span className="text-sm font-bold text-green-700">Answered correctly!</span></>
          ) : (
            <><X className="h-4 w-4 text-red-600" /><span className="text-sm font-bold text-red-700">Incorrect</span></>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-blue-100 p-1.5">
            <Check className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Question</span>
        </div>
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (fetchError || !dqData) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-xl bg-blue-100 p-1.5">
            <Check className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Question</span>
        </div>
        <p className="text-xs text-gray-400">No question available today.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-xl bg-blue-100 p-1.5">
          <Check className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Question</span>
        {dqData.question.subjectName && (
          <span className="text-xs font-semibold text-gray-400 ml-auto">{dqData.question.subjectName}</span>
        )}
      </div>
      <p className="text-sm font-bold text-gray-900 mb-3 leading-snug">{dqData.question.text}</p>
      <div className="space-y-1.5 mb-3">
        {dqData.question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => !submitting && setSelected(opt.key)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all min-h-[44px] cursor-pointer ${
              selected === opt.key
                ? 'border-blue-300 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              selected === opt.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {opt.key}
            </span>
            {opt.text}
          </button>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300 min-h-[44px] cursor-pointer"
      >
        {submitting ? 'Submitting...' : 'Submit answer'}
      </button>
    </div>
  )
}
