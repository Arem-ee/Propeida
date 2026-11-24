import { CircleDashed, History, Target } from 'lucide-react'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getProgressMap, getNextReviews, type ProgressSubject } from '@/lib/mastery'
import { getProStatus } from '@/lib/entitlements'
import MasteryRing from '@/components/mastery-ring'
import { getSessionHistory } from '@/lib/actions/practice'
import { EmptyState } from '@/components/ui-states'
import UpgradeCard from '@/components/paywall/upgrade-card'
import PracticeHistory from '@/components/progress/practice-history'
import { ProgressTabs } from '@/components/progress/progress-tabs'
import { parseProgressView } from '@/lib/progress-views'
import { getProgressActivity, getAccuracySeries } from '@/lib/progress-data'
import { fetchCurrentStreak } from '@/lib/streak'

export const metadata = { title: 'Progress' }

const STATUS_CARD: Record<string, { border: string; dot: string }> = {
  secured: {
    border: 'border-emerald-200 bg-emerald-50/50',
    dot: 'bg-emerald-500',
  },
  developing: {
    border: 'border-amber-200 bg-amber-50/50',
    dot: 'bg-amber-500',
  },
  fragile: {
    border: 'border-amber-200 bg-amber-50/50',
    dot: 'bg-amber-500',
  },
  'not-started': {
    border: 'border-gray-200 bg-white',
    dot: 'bg-gray-300',
  },
}

interface ProgressRow extends ProgressSubject {
  hasContent: boolean
}

const STATUS_ORDER: Record<string, number> = {
  secured: 0,
  developing: 1,
  fragile: 2,
  'not-started': 3,
}

function isReviewDue(reviewAt: string | null): boolean {
  if (!reviewAt) return false
  return new Date(reviewAt).getTime() <= Date.now()
}

function formatDay(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const view = parseProgressView(params.view)

  const supabase = await createClient()
  const user = await getAuthUser(supabase)

  const pro = user
    ? await getProStatus(user.id)
    : { isPro: true, labels: [] as string[], source: null, expiresAt: null, hasJambPro: true, hasPutmePro: true }
  const isPro = pro.isPro

  const [map, history, profileRes, subjectsRes] = await Promise.all([
    user ? getProgressMap(supabase, user.id) : Promise.resolve([]),
    (async () => {
      try {
        return await getSessionHistory()
      } catch {
        return []
      }
    })(),
    user
      ? supabase
          .from('profiles')
          .select('subject_combinations, exam_target')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('subjects').select('id, name, slug').order('name'),
  ])

  const chosenKeys = new Set(
    ((profileRes.data?.subject_combinations ?? []) as string[])
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )
  const subjectRows = (subjectsRes.data ?? []) as { id: string; name: string; slug: string }[]
  const chosenSubjects = subjectRows.filter(
    (subject) =>
      chosenKeys.has(subject.slug.toLowerCase()) || chosenKeys.has(subject.name.toLowerCase()),
  )

  const mapById = new Map(map.map((subject) => [subject.subjectId, subject]))
  const rows: ProgressRow[] = []
  const seen = new Set<string>()

  const addSubject = (subject: ProgressSubject, hasContent: boolean) => {
    if (seen.has(subject.subjectId)) return
    seen.add(subject.subjectId)
    rows.push({ ...subject, hasContent })
  }

  for (const subject of chosenSubjects) {
    const tracked = mapById.get(subject.id)
    addSubject(
      tracked ?? {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectSlug: subject.slug,
        status: 'not-started',
        score: null,
      },
      Boolean(tracked),
    )
  }

  // Evidence keeps its shelf even when the subject is not one of the saved
  // combinations, and JAMB/Post-UTME always carries English.
  for (const subject of map) {
    if (subject.status !== 'not-started') addSubject(subject, true)
  }
  if (profileRes.data?.exam_target !== 'general') {
    const english = subjectRows.find((subject) => subject.slug === 'english')
    if (english) {
      const tracked = mapById.get(english.id)
      addSubject(
        tracked ?? {
          subjectId: english.id,
          subjectName: english.name,
          subjectSlug: english.slug,
          status: 'not-started',
          score: null,
        },
        Boolean(tracked),
      )
    }
  }

  // A learner with no saved combination keeps the path map they had before.
  if (rows.length === 0) {
    for (const subject of map) addSubject(subject, true)
  }

  rows.sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) ||
      a.subjectName.localeCompare(b.subjectName),
  )

  const securedCount = rows.filter((subject) => subject.status === 'secured').length
  const totalCount = rows.length
  const hasEvidence = rows.some((subject) => subject.status !== 'not-started')
  const isNew = !hasEvidence && history.length === 0

  // Panel-specific reads only: a learner on Overview does not pay for the
  // accuracy series or the activity series.
  const [activity, accuracy, streak] = await Promise.all([
    user ? getProgressActivity(supabase, user.id) : Promise.resolve({ days: [], due: 0 }),
    view === 'recall' && user ? getAccuracySeries(supabase, user.id) : Promise.resolve([]),
    user ? fetchCurrentStreak(supabase, user.id) : Promise.resolve(null),
  ])

  const nextReviews = user
    ? await getNextReviews(
        supabase,
        user.id,
        rows.filter((subject) => subject.status !== 'not-started').map((subject) => subject.subjectId),
      ).catch(() => ({} as Record<string, string | null>))
    : {}

  const dueDates = Object.values(nextReviews).filter((value): value is string => !!value)
  const nextDue = dueDates.sort()[0] ?? null
  const peakDay = activity.days.reduce((best, day) => (day.count > best.count ? day : best), {
    day: '',
    count: 0,
  })

  const header = (
    <div className="mb-7">
      <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
        Progress
      </h1>
      <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
        {isNew || totalCount === 0
          ? 'Your subjects show up here as you learn'
          : `You have secured ${securedCount} of ${totalCount} subject${totalCount === 1 ? '' : 's'}`}
      </p>
    </div>
  )

  if (isNew) {
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <EmptyState
          title="Nothing secured yet"
          body="You start here, and one short lesson makes your first subject show up here"
          actionLabel="Start your first lesson"
          actionHref="/learn"
          secondaryLabel="or try some practice"
          secondaryHref="/practice"
        />
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <UpgradeCard
          title="Your subject map is Pro"
          body="It shows exactly what is secure, what is developing, and what needs work, and it tells you what to do next"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {header}
      <ProgressTabs view={view} />

      <div
        role="tabpanel"
        id={`panel-${view}`}
        aria-labelledby={`tab-${view}`}
        tabIndex={0}
        className="pt-5"
      >
        {view === 'overview' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-3xl border border-blue-100 bg-white p-4">
              <Target className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-black">
                  {activity.due > 0
                    ? `${activity.due} review${activity.due === 1 ? '' : 's'} waiting`
                    : 'Nothing due right now'}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-ink-soft">
                  {nextDue
                    ? `${isReviewDue(nextDue) ? 'Due' : 'Next review'} ${formatDay(nextDue)}. Short practice brings a subject back.`
                    : 'A short practice session sets the next review date.'}
                  {streak !== null ? ` Current streak: ${streak} day${streak === 1 ? '' : 's'}.` : ''}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                Your subjects
              </p>
              <p className="mb-3 text-[13px] font-semibold leading-relaxed text-ink-soft">
                The marker follows the questions you answer, so it moves when you practise and it stays put when you only read
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rows.map((s, idx) => {
                  const style = STATUS_CARD[s.status] ?? STATUS_CARD['not-started']!
                  const reviewAt = nextReviews[s.subjectId] ?? null
                  const reviewDue = isReviewDue(reviewAt)
                  const reviewDate = reviewAt ? formatDay(reviewAt) : null
                  const reviewCopy =
                    s.status === 'not-started'
                      ? s.hasContent
                        ? 'You have not started this subject yet, and it stays here until you are ready'
                        : 'We are still checking the questions for this subject, so it stays here until they are ready'
                      : reviewDue
                        ? `This was due for review on ${reviewDate}, so a short practice brings it back`
                        : reviewDate
                          ? `This comes back for review around ${reviewDate}`
                          : 'You have started this subject, so keep going'
                  return (
                    <div key={s.subjectId} className={`rounded-3xl border-2 p-4 animate-fade-up ${style.border}`} style={{ animationDelay: `${Math.min(8, idx) * 40}ms` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                            <span className="truncate font-display text-lg font-medium text-black">{s.subjectName}</span>
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-ink-soft">{reviewCopy}</p>
                        </div>
                        <MasteryRing score={s.score} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'recall' && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
              <p className="text-sm font-extrabold text-amber-900">What this tab can and cannot tell you</p>
              <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-amber-900">
                It shows the accuracy recorded in your finished practice and mocks, and how many reviews are waiting. It does not measure true retention, because we do not yet track which answers were scheduled reviews. Treat it as a record of practice, not a grade.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-3xl border border-blue-100 bg-white p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Reviews waiting</p>
                <p className="mt-1 font-display text-3xl font-semibold text-black">{activity.due}</p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  {activity.due > 0 ? 'A short practice brings these back' : 'Your review queue is clear'}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-100 bg-white p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">Recent accuracy</p>
                <p className="mt-1 font-display text-3xl font-semibold text-black">
                  {accuracy.length > 0
                    ? `${Math.round((accuracy.reduce((sum, item) => sum + item.accuracy, 0) / accuracy.length) * 100)}%`
                    : 'No data yet'}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  {accuracy.length > 0 ? `Across your last ${accuracy.length} finished sessions` : 'Finish a practice to see this'}
                </p>
              </div>
            </div>

            {accuracy.length > 0 && (
              <div className="rounded-3xl border border-blue-100 bg-white p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                  Accuracy by session
                </p>
                <div className="space-y-2.5">
                  {accuracy.slice(0, 10).map((point) => (
                    <div key={point.id} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 truncate text-xs font-bold text-ink-soft">
                        {formatDay(point.completedAt)}
                      </span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <span
                          className="block h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(0, point.accuracy * 100))}%` }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right text-xs font-extrabold text-black">
                        {Math.round(point.accuracy * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-blue-100 bg-white p-5">
              <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                Last 30 days
              </p>
              <p className="mb-4 text-[13px] font-semibold leading-relaxed text-ink-soft">
                One block is a day with a finished session, lesson check, reflection or daily question.
                {peakDay.count > 0 ? ` Your busiest day was ${formatDay(peakDay.day)} with ${peakDay.count}.` : ''}
              </p>
              <div className="flex flex-wrap gap-1.5" role="img" aria-label={`Learning activity over 30 days. ${activity.days.filter((d) => d.count > 0).length} days had activity.`}>
                {activity.days.map((day) => (
                  <span
                    key={day.day}
                    title={`${formatDay(day.day)}: ${day.count}`}
                    className={`h-6 w-6 rounded-md ${
                      day.count === 0
                        ? 'bg-gray-100'
                        : day.count < 3
                          ? 'bg-blue-200'
                          : day.count < 8
                            ? 'bg-blue-400'
                            : 'bg-blue-700'
                    }`}
                  />
                ))}
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
                  You have not finished any practice yet, so your history will appear here
                </p>
              ) : (
                <>
                  <PracticeHistory items={history} limit={isPro ? 20 : 5} />
                  {history.length > (isPro ? 20 : 5) && (
                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      {isPro
                        ? 'You see your last 20 here'
                        : 'Free shows 5 past practice here, and Pro shows 20'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl bg-ink text-white p-5 sm:p-6 flex items-center gap-2 text-xs font-bold text-gray-500">
          <CircleDashed className="h-4 w-4 shrink-0 text-gray-500" />
          When you pause, your progress stays saved and you can pick up where you left off
        </div>
      </div>
    </div>
  )
}
