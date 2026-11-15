import Link from 'next/link'
import {
  Upload,
  SearchCheck,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  GraduationCap,
  School,
  CalendarClock,
  Tags,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/admin/page-header'
import StatCard from '@/components/admin/stat-card'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard' }

function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [
    reviewRes,
    readyRes,
    lessonsRes,
    contactRes,
    examsRes,
    schoolsRes,
    cyclesRes,
    codesRes,
    reviewsRes,
  ] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }).in('status', ['draft', 'in_review']),
    supabase.from('questions').select('id', { count: 'exact', head: true }).neq('status', 'published').neq('verified_state', 'unverified'),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).in('status', ['draft', 'review']),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('exams').select('id', { count: 'exact', head: true }),
    supabase.from('schools').select('id', { count: 'exact', head: true }),
    supabase.from('exam_cycles').select('id', { count: 'exact', head: true }),
    supabase.from('misconception_codes').select('id', { count: 'exact', head: true }),
    supabase
      .from('question_reviews')
      .select('question_id, verified_state, note, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const reviewCount = reviewRes.count ?? 0
  const readyCount = readyRes.count ?? 0
  const lessonsCount = lessonsRes.count ?? 0
  const contactCount = contactRes.count ?? 0
  const allClear = reviewCount === 0 && readyCount === 0 && lessonsCount === 0

  const recentReviews = reviewsRes.data ?? []
  const reviewQuestionIds = [...new Set(recentReviews.map((r) => r.question_id))]
  const questionText = new Map<string, string>()
  if (reviewQuestionIds.length > 0) {
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question_text')
      .in('id', reviewQuestionIds)
    for (const q of questions ?? []) questionText.set(q.id, q.question_text)
  }

  const pipeline = [
    {
      href: '/admin/questions/upload',
      icon: Upload,
      step: '1',
      title: 'Bring it in',
      body: 'CSV upload, pasted text, or a new question by hand. Everything lands in review, nothing publishes from here',
      count: null as number | null,
    },
    {
      href: '/admin/questions/review',
      icon: SearchCheck,
      step: '2',
      title: 'Review',
      body: 'Check against the source. Source-cited means you saw where the answer comes from. Human-verified means you solved it yourself',
      count: reviewCount,
    },
    {
      href: '/admin/questions/review',
      icon: CheckCircle2,
      step: '3',
      title: 'Publish',
      body: 'Only verified questions reach learners. Unverified stays out of sessions',
      count: readyCount,
    },
    {
      href: '/admin/analytics',
      icon: BarChart3,
      step: '4',
      title: 'Measure',
      body: 'Coverage and usage after publishing. See what is working and what needs more',
      count: null as number | null,
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Propeida Admin"
        title="What needs you today"
        description="The content pipeline in order: bring it in, review it, publish it, then measure it. Everything below is live"
        actions={
          <Link
            href="/admin/questions/review"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Open review queue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      {allClear && (
        <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
          Review queue is clear. Nothing is waiting on you right now
        </div>
      )}

      {/* Order of operation */}
      <section aria-labelledby="pipeline-heading" className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-6">
        <h2 id="pipeline-heading" className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft/80">
          Order of operation
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pipeline.map((s, i) => {
            const Icon = s.icon
            return (
              <li key={s.step} className="relative">
                <Link
                  href={s.href}
                  className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-soft/60">
                      Step {s.step}
                    </span>
                    {s.count !== null && s.count > 0 && (
                      <span className="ml-auto inline-flex min-w-[26px] items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-amber-800">
                        {s.count}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-black">{s.title}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </Link>
                {i < pipeline.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute -right-[19px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-blue-200 xl:block"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {/* Needs attention */}
      <h2 className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft/80">
        Needs attention
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Waiting for review" value={reviewCount} foot="Drafts and in review" href="/admin/questions/review" />
        <StatCard label="Verified, not published" value={readyCount} foot="Ready to go live" href="/admin/questions/review" />
        <StatCard label="Lessons in progress" value={lessonsCount} foot="Drafts and in review" href="/admin/lessons" />
        <StatCard label="Contact messages" value={contactCount} foot="From schools and institutions" href="/admin/contact-submissions" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent verification trail */}
        <section aria-labelledby="recent-heading" className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft/80">
              Recent verification trail
            </h2>
            <Link href="/admin/questions/review" className="inline-flex min-h-[36px] items-center text-xs font-extrabold text-blue-700 hover:underline">
              Review queue
            </Link>
          </div>
          {recentReviews.length > 0 ? (
            <ol className="mt-3 divide-y divide-gray-100">
              {recentReviews.map((review, i) => (
                <li key={`${review.question_id}-${i}`} className="flex items-start gap-3 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${review.verified_state === 'human_verified' ? 'bg-emerald-500' : review.verified_state === 'source_cited' ? 'bg-amber-500' : 'bg-gray-300'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-black">
                      {questionText.get(review.question_id) ?? 'Question'}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-ink-soft">
                      {review.verified_state.replace('_', ' ')} · {timeAgo(review.created_at)}
                      {review.note ? ` · ${review.note}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center text-sm font-semibold text-ink-soft">
              No verification activity yet — it will appear here as you work the queue
            </p>
          )}
        </section>

        {/* Setup shortcuts */}
        <section aria-labelledby="setup-heading" className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] lg:col-span-2">
          <h2 id="setup-heading" className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-soft/80">
            Setup
          </h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {[
              { href: '/admin/exams', label: 'Exams', detail: `${examsRes.count ?? 0} defined`, icon: GraduationCap },
              { href: '/admin/schools', label: 'Schools & screenings', detail: `${schoolsRes.count ?? 0} schools`, icon: School },
              { href: '/admin/cycles', label: 'Exam cycles', detail: `${cyclesRes.count ?? 0} cycles`, icon: CalendarClock },
              { href: '/admin/codes', label: 'Misconception codes', detail: `${codesRes.count ?? 0} codes`, icon: Tags },
            ].map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-[48px] items-center gap-3 py-2.5 transition-colors hover:text-blue-800">
                    <Icon className="h-4 w-4 text-ink-soft/60" aria-hidden />
                    <span className="flex-1 text-[13px] font-extrabold text-black">{item.label}</span>
                    <span className="text-[11px] font-bold tabular-nums text-ink-soft">{item.detail}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-blue-300" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
