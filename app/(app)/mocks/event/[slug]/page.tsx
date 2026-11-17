import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Timer, CalendarClock, Crown, Trophy, Lock, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { hasExamAccess } from '@/lib/entitlements'
import { getMockEvent, getMyEventEntry, getMockEventLeaderboard } from '@/lib/mock-events'
import EventEnterButton from './event-enter-button'
import UpgradeCard from '@/components/paywall/upgrade-card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mock event' }

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })
}

export default async function MockEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getMockEvent(slug)
  if (!event) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const hasAccess = user ? await hasExamAccess(user.id, event.exam_id) : false

  const now = Date.now()
  const started = now >= new Date(event.starts_at).getTime()
  const ended = now >= new Date(event.ends_at).getTime()
  const state: 'upcoming' | 'live' | 'ended' = !started ? 'upcoming' : ended ? 'ended' : 'live'

  const myEntry = user ? await getMyEventEntry(event.id, user.id) : null
  const leaderboard = await getMockEventLeaderboard(event.id, user?.id ?? null)



  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/mocks"
          aria-label="Back to mocks"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-blue-300 hover:text-blue-600 min-h-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Mock event</p>
      </div>

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 text-white shadow-[0_24px_48px_-24px_rgba(37,99,235,0.55)]">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-200">
          <Crown className="h-4 w-4" /> Pro exclusive
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-white">{event.name}</h1>
        <p className="mt-2 text-sm font-medium text-blue-100">{event.description ?? 'Everyone sits the same questions, under mock-exam conditions, at the same time.'}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-bold text-blue-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
            <CalendarClock className="h-4 w-4" /> {formatWhen(event.starts_at)} – {formatWhen(event.ends_at)}
          </span>
          {event.exam_slug === 'jamb' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <Timer className="h-4 w-4" /> JAMB format
            </span>
          )}
        </div>
      </div>

      {/* What's happening now */}
      {state === 'upcoming' && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4">
          <p className="text-base font-extrabold text-amber-900">Not started yet</p>
          <p className="text-sm font-semibold text-amber-900/80">This mock event is scheduled for {formatWhen(event.starts_at)}. Pro users get the entry button the moment it goes live, and the leaderboard lands when it closes.</p>
        </div>
      )}

      {state === 'live' && !myEntry && (
        <div className="rounded-2xl border border-blue-200/70 bg-blue-50/60 px-5 py-4">
          {hasAccess ? (
            <>
              <p className="text-base font-extrabold text-blue-900">It is live now</p>
              <p className="text-sm font-semibold text-blue-900/80">Same questions for everyone, answered in one sitting. When you submit, the paper opens and your result is ranked against the rest of the cohort.</p>
              <div className="mt-3">
                <EventEnterButton eventId={event.id} label="Sit this mock now" />
              </div>
            </>
          ) : (
            <>
              <p className="text-base font-extrabold text-blue-900">Pro unlocks this paper</p>
              <p className="text-sm font-semibold text-blue-900/80">This is a Pro-only event for your exam. The full bank opens, and so do unlimited mocks with time and conditions like the real hall.</p>
              <div className="mt-3">
                <UpgradeCard title="Go Pro to join the event" body="All mocks, every lesson, and the shared paper" />
              </div>
            </>
          )}
        </div>
      )}

      {state === 'live' && myEntry && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-4">
          <p className="text-base font-extrabold text-emerald-900">You have sat this mock</p>
          <p className="text-sm font-semibold text-emerald-900/80">Your answers are submitted and the ranking below updates live as more Pro users finish.</p>
        </div>
      )}

      {state === 'ended' && myEntry && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-4">
          <p className="text-base font-extrabold text-emerald-900">Your paper is in</p>
          <p className="text-sm font-semibold text-emerald-900/80">Final ranking is below. Everyone sat the same questions under the same clock.</p>
        </div>
      )}

      {state === 'ended' && !myEntry && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="flex items-center gap-2 text-base font-extrabold text-gray-800"><Lock className="h-4 w-4" /> This mock event has ended</p>
          <p className="text-sm font-semibold text-gray-600">You can review the final leaderboard, but new entries are closed.</p>
        </div>
      )}

      {/* Leaderboard */}
      {(state !== 'upcoming' || leaderboard.participantCount > 0) && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-lg font-semibold text-slate-900">Live leaderboard</h2>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{leaderboard.participantCount} Pro users</span>
          </div>
          {leaderboard.rows.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm font-semibold text-slate-500">No results yet. Results land here as soon as the first submissions come in.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {leaderboard.rows.slice(0, 50).map((r) => (
                <li
                  key={r.userId}
                  className={`flex items-center gap-3 px-5 py-2.5 ${r.isYou ? 'bg-blue-50/70' : ''}`}
                >
                  <span className="w-8 text-center font-display text-base font-bold text-slate-400">{r.rank}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {r.username.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-900">
                    {r.username}{r.isYou ? ' (you)' : ''}
                  </span>
                  <span className="text-sm font-extrabold tabular-nums text-slate-800">{r.score}</span>
                  <span className="w-12 text-right text-[11px] font-bold tabular-nums text-slate-400">{Math.round(r.accuracy * 100)}%</span>
                </li>
              ))}
            </ol>
          )}
          {leaderboard.rows.length > 50 && (
            <p className="border-t border-slate-100 px-5 py-3 text-center text-[11px] font-bold text-slate-400">Top 50 shown</p>
          )}
        </section>
      )}

      <p className="text-center text-xs font-semibold text-gray-400">
        Pro only · Timed like a real JAMB paper · Same questions for every participant
      </p>
    </div>
  )
}
