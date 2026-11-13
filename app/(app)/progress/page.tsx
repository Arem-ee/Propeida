import Link from 'next/link'
import { ChevronRight, Check, Clock, CircleDashed, History } from 'lucide-react'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getProgressMap, getMasterySummary, getNextReviews } from '@/lib/mastery'
import { getProStatus } from '@/lib/entitlements'
import MasteryBar from '@/components/mastery-bar'
import { getSessionHistory } from '@/lib/actions/practice'
import { EmptyState } from '@/components/ui-states'
import UpgradeCard from '@/components/paywall/upgrade-card'

export const metadata = { title: 'Progress' }

const STATUS_CARD: Record<string, { border: string; badge: string; dot: string; label: string }> = {
  secured: {
    border: 'border-emerald-200 bg-emerald-50/50',
    badge: 'bg-emerald-500 text-white',
    dot: 'bg-emerald-500',
    label: 'Secured',
  },
  developing: {
    border: 'border-amber-200 bg-amber-50/50',
    badge: 'bg-amber-400 text-black',
    dot: 'bg-amber-500',
    label: 'Developing',
  },
  fragile: {
    border: 'border-amber-200 bg-amber-50/50',
    badge: 'bg-amber-400 text-black',
    dot: 'bg-amber-500',
    label: 'Needs work',
  },
  'not-started': {
    border: 'border-gray-200 bg-white',
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-300',
    label: 'Not started',
  },
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const pro = user ? await getProStatus(user.id) : { isPro: true, labels: [] as string[], source: null, expiresAt: null }
  const isPro = pro.isPro

  const [map, summary, history] = await Promise.all([
    user ? getProgressMap(supabase, user.id) : [],
    user ? getMasterySummary(supabase, user.id) : { securedCount: 0, totalCount: 0 },
    (async () => {
      try {
        return await getSessionHistory()
      } catch {
        return []
      }
    })(),
  ])

  const nextReviews = user
    ? await getNextReviews(
        supabase,
        user.id,
        map.filter((s) => s.status !== 'not-started').map((s) => s.subjectId),
      ).catch(() => ({} as Record<string, string | null>))
    : {}

  const isNew = summary.totalCount === 0 && history.length === 0

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Progress
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          {isNew
            ? 'Your subjects show up here as you learn.'
            : `${summary.securedCount} of ${summary.totalCount} tracked subject${summary.totalCount === 1 ? '' : 's'} secured.`}
        </p>
      </div>

      {isNew ? (
        <EmptyState
          title="Nothing secured yet"
          body="That is where everyone starts. One short lesson and your first subject shows up here."
          actionLabel="Start your first lesson"
          actionHref="/learn"
          secondaryLabel="or try some practice"
          secondaryHref="/practice"
        />
      ) : !isPro ? (
        <UpgradeCard
          title="Your subject map is Pro"
          body="It shows exactly what is secure, what is developing, and what needs work — and tells you what to do next."
        />
      ) : (
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
              Your subjects
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {map.map((s, idx) => {
                const style = STATUS_CARD[s.status] ?? STATUS_CARD['not-started']!
                const reviewAt = nextReviews[s.subjectId] ?? null
                const reviewDate = reviewAt
                  ? new Date(reviewAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
                  : null
                return (
                  <div key={s.subjectId} className={`rounded-3xl border-2 p-4 animate-fade-up ${style.border}`} style={{ animationDelay: `${Math.min(8, idx) * 40}ms` }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                        <span className="truncate font-display text-lg font-medium text-black">{s.subjectName}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-ink-soft">
                      {s.status === 'not-started'
                        ? 'Untouched — there when you are ready.'
                        : reviewDate
                          ? `Back for review around ${reviewDate}.`
                          : 'Tracked. Keep going.'}
                    </p>
                    <div className="mt-2.5">
                      <MasteryBar score={s.score} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-gray-500" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                Past practice
              </p>
            </div>
            {history.length === 0 ? (
              <p className="rounded-3xl border border-blue-100/70 bg-white px-5 py-4 text-sm font-semibold text-ink-soft">
                Nothing here yet. Your finished practice will appear here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {history.slice(0, isPro ? 20 : 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/results/${item.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-blue-100/70 bg-white px-4 py-3.5 hover:border-blue-300 transition-all min-h-[60px] pressable"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      (item.accuracy ?? 0) >= 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {(item.accuracy ?? 0) >= 0.8
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
                      {Math.round((item.accuracy ?? 0) * 100)}%
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-ink text-white p-5 sm:p-6 flex items-center gap-2 text-xs font-bold text-gray-500">
            <CircleDashed className="h-4 w-4 shrink-0 text-gray-500" />
            Paused counts as saved, never broken. Your pace is the right pace.
          </div>
        </div>
      )}
    </div>
  )
}
