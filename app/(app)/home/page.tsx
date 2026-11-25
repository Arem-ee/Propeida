import Link from 'next/link'
import { ChevronRight, CalendarCheck, Target, ArrowRight } from 'lucide-react'
import { createClient, getCurrentUser } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/actions/dashboard'
import { getProStatus } from '@/lib/entitlements'
import { Mascot } from '@/components/mascot'
import UpgradeCard from '@/components/paywall/upgrade-card'
import HomeTour from '@/components/celebrations/home-tour'

const PRESENCE_MIN_WEEKLY_ACTIVE = 10

export const metadata = { title: 'Home' }

export default async function HomePage() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  let subjectsPending = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subjects_pending')
      .eq('id', user.id)
      .single()
    subjectsPending = profile?.subjects_pending ?? false
  }
  const proStatus = user
    ? await getProStatus(user.id)
    : { isPro: true, labels: [] as string[], source: null, expiresAt: null }
  const isPro = proStatus.isPro
  const data = await getDashboardData()
  const username = data.profile.username
  const review = data.review
  const continueSession = data.continueSession
  const continueLesson = data.continueLesson
  const presence = data.presence
  const cohort = data.cohort
  const weakest = data.weakest
  const learningDays = data.streak?.current_streak ?? 0

  const practiseHref = weakest ? `/learn/${weakest.subjectSlug}` : '/learn'

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
        <div className="flex items-center gap-3">
          <Mascot expression="welcome" size="md" className="shrink-0" priority />
          <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
            {username ? `Welcome back, ${username}` : 'Welcome back'}
          </h1>
        </div>
        {presence && presence.weeklyActiveStudents >= PRESENCE_MIN_WEEKLY_ACTIVE && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-100 px-3 py-1.5 text-xs font-bold text-ink-soft shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {presence.weeklyActiveStudents.toLocaleString()} people studied this week
            {cohort?.verified && cohort.daysLeft !== null && (
              <span className="text-blue-700">
                · {cohort.daysLeft} day{cohort.daysLeft === 1 ? '' : 's'} to {cohort.examName}
              </span>
            )}
          </p>
        )}
        {learningDays > 0 && (
          <p className="chip-glow mt-2.5 ml-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 py-1 pl-1 pr-3 text-xs font-extrabold text-amber-800">
            <Mascot expression="streak" size="xs" motion="flicker" className="shrink-0" />
            {learningDays} learning {learningDays === 1 ? 'day' : 'days'} so far
          </p>
        )}

        {subjectsPending && (
          <div className="mt-2.5 inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M20.386 14.586a5 5 0 10-7.072-7.072 7 7 0 117.072 7.072z" />
            </svg>
            <p className="text-xs font-bold text-amber-800">
              Pick your subjects so your questions and lessons match what you study
              <Link href="/onboarding" className="underline underline-offset-2 font-extrabold text-amber-900 ml-1">Edit here</Link>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
        {/* Optional: first-time placement check */}
        {!data.profile?.onboarding_completed && (
          <Link
            href="/diagnostic"
            className="group sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 transition-all card-lift animate-fade-up"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">Placement check</p>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">Where should you start?</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Five quick questions in English and Maths, and your answers show where you should start</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <ArrowRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        )}

        {/* Hero: the single next action. Secondary modules follow. */}
        {hero === 'mock' && continueSession && (
          <Link
            data-tour="hero"
            href={`/mocks/session/${continueSession.id}`}
            className="group sm:col-span-2 rounded-3xl bg-red-500 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(239,68,68,0.65)] transition-all card-lift animate-fade-up"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">{continueSession.examName}</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-red-100">Your timed exam is still running and the clock has not stopped</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-red-600 min-h-[52px]">
              Resume mock <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'review' && review.due[0] && (
          !isPro ? (
            <div className="sm:col-span-2">
            <UpgradeCard
              title={`You have ${review.due.length} ${review.due.length === 1 ? 'thing' : 'things'} waiting for review`}
              body="Pro brings each topic back at the moment you are about to forget it"
              bullets={['You get a review whenever a topic is due', 'Topics you find hard come back sooner']}
            />
            </div>
          ) : (
          <div data-tour="hero" className="sm:col-span-2 rounded-3xl bg-violet-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(139,92,246,0.65)] animate-fade-up">
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">Today&apos;s review</h2>
            <Link
              href="/recall"
              className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/10 border border-white/20 px-4 py-3.5 hover:bg-white/20 transition-all min-h-[52px]"
            >
              <span className="text-[15px] font-extrabold text-white">Quick recall</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-violet-700 shrink-0">
                Start
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            {review.due.length > 1 && (
              <Link
                href={`/practice?subjects=${review.due.map((d) => encodeURIComponent(d.subjectSlug)).join(',')}`}
                className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 transition-all min-h-[52px] hover:shadow-lg"
              >
                <span className="text-[15px] font-extrabold text-violet-700">Mixed review · {review.due.length} subjects</span>
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
          )
        )}
        {hero === 'lesson' && continueLesson && (
          <Link
            data-tour="hero"
            href={`/learn/${continueLesson.subject}/${continueLesson.slug}`}
            className="group sm:col-span-2 rounded-3xl bg-emerald-500 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(16,185,129,0.65)] transition-all card-lift animate-fade-up"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">{continueLesson.topic}</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-emerald-100">You get a quick check, a worked example, and then practice</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-emerald-700 min-h-[52px]">
              Continue <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'practice' && (continueSession || weakest) && (
          <Link
            data-tour="hero"
            href={continueSession && continueSession.mode !== 'mock' ? `/practice/session/${continueSession.id}` : practiseHref}
            className="group sm:col-span-2 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all card-lift animate-fade-up"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">
              {continueSession && continueSession.mode !== 'mock' ? continueSession.examName : (weakest?.subjectName ?? 'Practice')}
            </h2>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-blue-700 min-h-[52px]">
              Start <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        {hero === 'start' && (
          <Link
            data-tour="hero"
            href="/learn"
            className="group sm:col-span-2 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white shadow-[0_20px_44px_-20px_rgba(37,99,235,0.65)] hover:bg-blue-700 transition-all card-lift animate-fade-up"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight">Start your first lesson</h2>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-blue-700 min-h-[52px]">
              Begin <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        )}

        {cohort && (
          <div className="sm:col-span-2 overflow-hidden rounded-3xl bg-black text-white p-5 sm:p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.5)] animate-fade-up" style={{ animationDelay: '80ms' }}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
              Class of {cohort.examName} {cohort.year}
            </p>
            <p className="mt-1.5 font-display text-xl font-medium leading-snug">
              {cohort.daysLeft !== null
                ? `${cohort.daysLeft} day${cohort.daysLeft === 1 ? '' : 's'} to go`
                : 'There is no official date yet, so keep studying and we will count down when it is announced'}
            </p>
            {cohort.weeklyActive >= PRESENCE_MIN_WEEKLY_ACTIVE && (
              <p className="mt-1 text-[13px] font-semibold text-blue-100/80">
                {cohort.weeklyActive.toLocaleString()} people are studying with you this week
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
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueSession.examName} mock</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">Your timed exam is still running, so pick up where you left off</p>
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
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueLesson.topic}</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">You get a quick check, a worked example, and then practice</p>
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
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{continueSession.examName}</h2>
                <p className="text-sm font-semibold text-ink-soft mt-0.5">{continueSession.mode === 'mock' ? 'Your mock exam' : 'Your practice'} is in progress</p>
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
                <h2 className="mt-1 font-display text-[22px] font-medium">Start your first lesson</h2>
              </div>
              <ChevronRight className="h-7 w-7 text-blue-200 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ) : null}

        {/* 2 — Today's review (suppressed when it is the hero) */}
        {hero !== 'review' && review.due.length > 0 && (
          !isPro ? (
            <div className="sm:col-span-2">
            <UpgradeCard
              title={`${review.due.length} ${review.due.length === 1 ? 'review waiting' : 'reviews waiting'}`}
              body="Pro brings each topic back at the moment you are about to forget it"
            />
            </div>
          ) : (
          <div className="sm:col-span-2 rounded-3xl border-2 border-violet-200 bg-violet-50/60 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,0.7)]">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-medium text-black">Today&apos;s review</h2>
            </div>
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
          )
        )}

        {/* 3 — Practise a skill (suppressed when it is the hero, unless a
            session also waits — different content, keep both) */}
        {(hero !== 'practice' || continueSession) && weakest ? (
          <Link
            href={practiseHref}
            className="group sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 transition-all card-lift animate-fade-up"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">{weakest.subjectName}</h2>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Target className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : hero !== 'start' ? (
          <Link
            href="/learn"
            className="group sm:col-span-2 rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] hover:border-blue-300 transition-all card-lift animate-fade-up"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="mt-1 font-display text-[22px] font-medium text-black">Finish a lesson before you practise</h2>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Target className="h-6 w-6" />
              </span>
            </div>
          </Link>
        ) : null}
      </div>
      {learningDays === 0 && <HomeTour enabled />}
    </div>
  )
}
