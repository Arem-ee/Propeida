'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, FileQuestion, BookOpenCheck, GraduationCap } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { getPlatformStats } from '@/lib/platform-stats'

interface Stats {
  questionsAnswered: number
  practiceSessions: number
  mockSessions: number
}

function formatNumber(n: number): string {
  if (n <= 0) return '—'
  return n.toLocaleString('en-NG')
}

export default function MarketingCommunity() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let mounted = true
    getPlatformStats()
      .then((d) => {
        if (mounted) setStats(d)
      })
      .catch(() => {
        if (mounted) setStats(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  const cards = stats
    ? [
        { icon: FileQuestion, value: formatNumber(stats.questionsAnswered), label: 'Questions answered' },
        { icon: Activity, value: formatNumber(stats.practiceSessions), label: 'Practice sessions completed' },
        { icon: GraduationCap, value: formatNumber(stats.mockSessions), label: 'Mock exams completed' },
        { icon: BookOpenCheck, value: siteConfig.trustMetrics.verifiedQuestions, label: 'Verified questions' },
      ]
    : [
        { icon: FileQuestion, value: '—', label: 'Questions answered' },
        { icon: Activity, value: '—', label: 'Practice sessions completed' },
        { icon: GraduationCap, value: '—', label: 'Mock exams completed' },
        { icon: BookOpenCheck, value: siteConfig.trustMetrics.verifiedQuestions, label: 'Verified questions' },
      ]

  return (
    <section id="community" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Students learning with Propeida, right now
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Real numbers from the platform — no marketing math. This is what preparation looks like when it is open to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/30 p-8 text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-gray-900 tabular-nums">{card.value}</div>
                <div className="mt-1.5 text-sm text-gray-500">{card.label}</div>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          Every one of these students started the same way you can:{' '}
          <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700">
            signing up for free
          </Link>
          .
        </p>
      </div>
    </section>
  )
}