import Link from 'next/link'
import { ChevronRight, CalendarCheck, Target } from 'lucide-react'
import { getDashboardData } from '@/lib/actions/dashboard'

const PRESENCE_MIN_WEEKLY_ACTIVE = 10

const STATUS_STYLE: Record<string, { chip: string; dot: string; label: string }> = {
  secured: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Secured',
  },
  developing: {
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    label: 'Developing',
  },
  fragile: {
    chip: 'border-red-200 bg-red-50 text-red-800',
    dot: 'bg-red-400',
    label: 'Needs work',
  },
  'not-started': {
    chip: 'border-gray-200 bg-white text-gray-500',
    dot: 'bg-gray-300',
    label: 'Not started',
  },
}

export const metadata = { title: 'Home' }

export default async function HomePage() {
  const data = await getDashboardData()
  const username = data.profile.username
  const review = data.review
  const continueSession = data.continueSession
  const continueLesson = data.continueLesson
  const presence = data.presence
  const cohort = data.cohort
  const progressMap = data.progressMap ?? []
  const weakest = data.weakest
  const learningDays = data.streak?.current_streak ?? 0

  const practiseHref =
    weakest && ['english', 'mathematics', 'current-affairs'].includes(weakest.subjectSlug)
      ? `/learn/${weakest.subjectSlug}`
      : '/learn'

  // One hero next-action (docs §3): timed mock, due review, lesson,
  // weakest practice, else begin. Everything else renders secondary.
  const hero: 'mock' | 'review' | 'lesson' | 'practice' | 'start' =
    continueSession && continueSession.mode === 'mock'
      ? 'mock'
      : review.due.length > 0
        ? 'review'
        : continueLesson
          ? 'lesson'
          : continueSession || weakest
            ? 'practice'
            : 'start'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          {username ? `Welcome back, ${username}` : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          What is the best next thing for you to do?
        </p>
        {presence && presence.weeklyActiveStudents >= PRESENCE_MIN_WEEKLY_ACTIVE && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-100 px-3 py-1.5 text-xs font-bold text-ink-soft shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {presence.weeklyActiveStudents.toLocaleString()} students studied this week
          </p>
        )}
        {learningDays > 0 && (
          <p className="mt-2.5 ml-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-800">
            {learningDays} learning {learningDays === 1 ? 'day' : 'days'} — pauses change nothing
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
        {/* Hero: the single next action. Secondary modules follow. */}
        {hero === 'mock' && continueSession && (
          <Link
            href={`/mocks/session/${continueSession.id}`}
            className="group sm:col-span-2 rounded-3xl bg-red-500 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(239,68,68,0.65)] transition-all"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-100">Next: finish your mock</p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium leading-tight">{continueSession.examName}</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-red-100">Timed exam in progress — every minute counts.</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-red-600 min-h-[52px]">
              Resume mock <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'review' && review.due[0] && (
          <div className="sm:col-span-2 rounded-3xl bg-violet-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(139,92,246,0.65)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-violet-200">
              Next: prove it stuck
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium leading-tight">Today&apos;s review</h2>
            {review.due.length > 1 && (
              <Link
                href={`/practice?subjects=${review.due.map((d) => encodeURIComponent(d.subjectSlug)).join(',')}`}
                className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 transition-all min-h-[52px] hover:shadow-lg"
              >
                <span className="text-[15px] font-extrabold text-violet-700">Mixed review — all {review.due.length} subjects, interleaved</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-extrabold text-white shrink-0">
                  Start
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}
            <div className="mt-4 space-y-2">
              {review.due.map((item) => (
                <Link
                  key={item.subjectId}
                  href={`/practice?subject=${encodeURIComponent(item.subjectSlug)}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 hover:bg-white/20 transition-all min-h-[52px]"
                >
                  <span className="text-[15px] font-extrabold text-white">{item.subjectName}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-violet-700 shrink-0">
                    Review now
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {hero === 'lesson' && continueLesson && (
          <Link
            href={`/learn/${continueLesson.subject}/${continueLesson.slug}`}
            className="group sm:col-span-2 rounded-3xl bg-emerald-500 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(16,185,129,0.65)] transition-all"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-100">Next: continue learning</p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium leading-tight">{continueLesson.topic}</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-emerald-100">Back into the lesson — diagnostic, worked example, practice.</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-emerald-700 min-h-[52px]">
              Continue <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'practice' && (continueSession || weakest) && (
          <Link
            href={continueSession && continueSession.mode !== 'mock' ? `/practice/session/${continueSession.id}` : practiseHref}
            className="group sm:col-span-2 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">Next: practise a skill</p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium leading-tight">
              {continueSession && continueSession.mode !== 'mock' ? continueSession.examName : (weakest?.subjectName ?? 'Practice')}
            </h2>
            <p className="mt-1.5 text-[15px] font-semibold text-blue-100">Targeted questions, linked to what you learned.</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-blue-700 min-h-[52px]">
              Start <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'start' && (
          <Link
            href="/learn"
            className="group sm:col-span-2 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">Next: begin</p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium leading-tight">Start your first lesson</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-blue-100">Five minutes. We place you by doing, not by survey.</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-blue-700 min-h-[52px]">
              Begin <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}

        {cohort && (
          <div className="sm:col-span-2 overflow-hidden rounded-3xl bg-black text-white p-5 sm:p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.5)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
              Class of {cohort.examName} {cohort.year}
            </p>
            <p className="mt-1.5 font-display text-xl font-medium leading-snug">
              {cohort.daysLeft !== null
                ? `${cohort.daysLeft} day${cohort.daysLeft === 1 ? '' : 's'} to go.`
                : 'Dates to be announced — study now, we count down when it is official.'}
            </p>
            {cohort.weeklyActive >= PRESENCE_MIN_WEEKLY_ACTIVE && (
              <p className="mt-1 text-[13px] font-semibold text-blue-100/80">
                {cohort.weeklyActive.toLocaleString()} studying with you this week.
              </p>
            )}
          </div>
        )}

        {/* 1 — Continue learning (suppressed when it is the hero) */}
        {hero !== 'mock' && continueSession && continueSession.mode === 'mock' ? (
          <Link
            href={`/mocks/session/${continueSession.id}`}
            className="group sm:col-span-2 rounded-3xl border-2 border-red-200 bg-red-50/60 p-5 sm:p-6 hover:border-red-300 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-red-700">Continue learning</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueSession.examName} mock</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Timed exam in progress — pick up where you left off.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white transition-transform group-hover:translate-x-1">
                <ChevronRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : hero !== 'lesson' && continueLesson ? (
          <Link
            href={`/learn/${continueLesson.subject}/${continueLesson.slug}`}
            className="group sm:col-span-2 rounded-3xl border-2 border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 hover:border-emerald-300 hover:shadow-[0_16px_40px_-24px_rgba(16,185,129,0.5)] transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Continue learning</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueLesson.topic}</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Back into the lesson — diagnostic, worked example, practice.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white transition-transform group-hover:translate-x-1">
                <ChevronRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : hero !== 'practice' && continueSession ? (
          <Link
            href={`/practice/session/${continueSession.id}`}
            className="group sm:col-span-2 rounded-3xl border-2 border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Continue learning</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueSession.examName}</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5 capitalize">{continueSession.mode} session in progress.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white transition-transform group-hover:translate-x-1">
                <ChevronRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : hero !== 'start' ? (
          <Link
            href="/learn"
            className="group sm:col-span-2 rounded-3xl bg-blue-600 p-5 sm:p-6 text-white shadow-[0_20px_44px_-20px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">Continue learning</p>
                <h2 className="mt-1 font-display text-[22px] font-medium">Start your first lesson</h2>
                <p className="text-sm font-semibold text-blue-100 mt-0.5">Five minutes. We place you by doing, not by survey.</p>
              </div>
              <ChevronRight className="h-7 w-7 text-blue-200 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ) : null}

        {/* 2 — Today's review (suppressed when it is the hero) */}
        {hero !== 'review' && review.due.length > 0 && (
          <div className="sm:col-span-2 rounded-3xl border-2 border-violet-200 bg-violet-50/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,0.7)]">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-medium text-black">Today&apos;s review</h2>
            </div>
            <p className="mt-2 text-[13px] font-semibold text-ink-soft">
              Retrieval due — prove it stuck.
            </p>
            <div className="mt-3.5 space-y-2">
              {review.due.map((item) => (
                <Link
                  key={item.subjectId}
                  href={`/practice?subject=${encodeURIComponent(item.subjectSlug)}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3.5 hover:border-violet-400 hover:shadow-sm transition-all min-h-[52px]"
                >
                  <span className="text-[15px] font-extrabold text-black">{item.subjectName}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-extrabold text-white shrink-0">
                    Review now
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 3 — Practise a skill (suppressed when it is the hero, unless a
            session also waits — different content, keep both) */}
        {(hero !== 'practice' || continueSession) && weakest ? (
          <Link
            href={practiseHref}
            className="group sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Practise a skill</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{weakest.subjectName}</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Your weakest tracked subject — targeted questions, linked to lessons.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Target className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : hero !== 'start' ? (
          <Link
            href="/learn"
            className="group sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Practise a skill</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">Learn first, then practise</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Finish a lesson — targeted practice unlocks from what you learned.</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Target className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : null}

        {/* 5 — Progress map: calm states, never a mountain */}
        {progressMap.length > 0 && (
          <div className="sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-400">Progress map</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {progressMap.map((s) => {
                const style = STATUS_STYLE[s.status] ?? STATUS_STYLE['not-started']!
                return (
                  <span
                    key={s.subjectId}
                    title={style.label}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold ${style.chip}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {s.subjectName}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
