'use client'

import { useEffect, useState } from 'react'
import { BookOpenCheck, FileQuestion, GraduationCap, School } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { getPlatformStats } from '@/lib/platform-stats'

interface Stats {
  questionsAnswered: number
  mockSessions: number
}

function formatNumber(n: number): string {
  if (n <= 0) return '—'
  return n.toLocaleString('en-NG')
}

export default function MarketingTrustMetrics() {
  const [live, setLive] = useState<Stats | null>(null)

  useEffect(() => {
    let mounted = true
    getPlatformStats()
      .then((d) => {
        if (mounted) setLive(d)
      })
      .catch(() => {
        if (mounted) setLive(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  const metrics = [
    {
      icon: FileQuestion,
      value: live ? formatNumber(live.questionsAnswered) : '—',
      note: 'questions answered on Propeida',
    },
    {
      icon: GraduationCap,
      value: live ? formatNumber(live.mockSessions) : '—',
      note: 'mock exams completed',
    },
    { icon: BookOpenCheck, value: siteConfig.trustMetrics.verifiedQuestions, note: siteConfig.trustMetrics.verifiedQuestionsNote },
    { icon: School, value: siteConfig.trustMetrics.universitiesSupported, note: siteConfig.trustMetrics.universitiesSupportedNote },
  ]

  return (
    <section className="border-t border-gray-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {metrics.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">{item.value}</div>
                  <div className="mt-0.5 text-sm text-gray-500">{item.note}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}