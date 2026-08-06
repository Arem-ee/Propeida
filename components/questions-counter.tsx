'use client'

import { useEffect, useState } from 'react'

interface Stats {
  questionsAnswered: number
  practiceSessions: number
  activeStudents30d: number
  studentsTotal: number
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-NG')
}

export default function QuestionsCounter() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .catch(() => setStats(null))
  }, [])

  return (
    <section className="border-t border-gray-100 bg-gray-900 py-16 sm:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Questions practiced by Propeida students
        </p>
        <p className="mt-4 text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums">
          {stats ? formatNumber(stats.questionsAnswered) : 'Counting...'}
        </p>
        <p className="mt-4 text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {stats
            ? `Live from the platform — ${formatNumber(stats.practiceSessions)} practice sessions and rising.`
            : 'Live numbers update here as students practice. It is real, and it is free for them.'}
        </p>
      </div>
    </section>
  )
}