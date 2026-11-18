import Link from 'next/link'
import { ArrowLeft, CircleDashed, Users, Check } from 'lucide-react'
import { getSquadStatus, getSquadInvitePreview } from '@/lib/actions/squads'
import {
  InviteShare,
  JoinInviteButton,
  JoinSquadButton,
  LeaveSquadButton,
  MockWindowCard,
  SquadIdentityEditor,
  WeeklyGoalCard,
} from '@/components/squad/squad-client'
import { SquadMarkIcon } from '@/components/squad/squad-marks'

export const metadata = { title: 'Study squad' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export default async function SquadPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const inviteCode = first(params.join)
  const [status, preview] = await Promise.all([
    getSquadStatus(),
    inviteCode ? getSquadInvitePreview(inviteCode) : Promise.resolve(null),
  ])

  if (inviteCode) {
    return (
      <div className="mx-auto max-w-xl">
        <Link
          href="/squad"
          className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to squad
        </Link>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-6 sm:p-8 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-fade-up">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 p-1.5"
            style={{ backgroundColor: preview ? `${preview.color}1a` : undefined }}
          >
            {preview ? <SquadMarkIcon mark={preview.mark} seedFallback={preview.name} /> : <Users className="h-7 w-7 text-blue-600" />}
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-black">
            {preview ? `Join “${preview.name}”?` : 'Join this study squad?'}
          </h1>
          {preview && (
            <p className="mt-3 text-sm font-extrabold text-ink-soft">
              {preview.examName}
              {preview.cycleYear ? ` · ${preview.cycleYear} cohort` : ''}
              {' · '}
              {preview.memberCount} of {preview.maxMembers} seats filled
            </p>
          )}
          {status.joined ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-800">
                <Check className="h-4 w-4" /> You are already in a squad
              </p>
              <Link
                href="/squad"
                className="mt-4 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 min-h-[44px]"
              >
                Go to my squad
              </Link>
            </div>
          ) : (
            <JoinInviteButton code={inviteCode} />
          )}
        </div>
      </div>
    )
  }

  if (!status.joined || !status.squad) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
            Study squad
          </h1>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-6 sm:p-8 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-fade-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
            <Users className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-medium leading-tight text-black">
            Join your squad
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-ink-soft">
            {status.pathLabel}
          </p>

          {status.eligible ? (
            <JoinSquadButton />
          ) : (
            <div className="mt-6">
              <p className="text-sm font-bold text-ink-soft">{status.ineligibleReason}</p>
              {status.ctaHref && status.ctaLabel && (
                <Link
                  href={status.ctaHref}
                  className="mt-4 inline-flex rounded-2xl bg-blue-600 px-6 py-4 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
                >
                  {status.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const squad = status.squad
  const seatsOpen = Math.max(0, squad.maxMembers - squad.memberCount)

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Your squad
        </h1>
      </div>

      <div className="rounded-3xl border-2 border-blue-100/70 bg-white p-6 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl p-1.5"
              style={{ backgroundColor: `${squad.color}1a` }}
            >
              <SquadMarkIcon mark={squad.mark} seedFallback={squad.id} />
            </span>
            <div>
              <h2 className="font-display text-2xl font-medium leading-tight text-black">
                {squad.name}
              </h2>
              <p className="mt-1 text-xs font-bold text-gray-500">
                {squad.examName}
                {squad.cycleYear ? ` · ${squad.cycleYear} cohort` : ''} · {squad.memberCount} of{' '}
                {squad.maxMembers} seats filled{seatsOpen > 0 ? ` · ${seatsOpen} open` : ''}
              </p>
            </div>
          </div>
          <SquadIdentityEditor
            name={squad.name}
            mark={squad.mark}
            color={squad.color}
            isDefaultName={squad.isDefaultName}
          />
        </div>
      </div>

      {squad.weekly ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-3xl border border-blue-100/70 bg-white px-3 py-4 text-center">
            <p className="font-display text-2xl font-semibold text-black">{squad.weekly.sessions}</p>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-500">
              Times practised
            </p>
          </div>
          <div className="rounded-3xl border border-blue-100/70 bg-white px-3 py-4 text-center">
            <p className="font-display text-2xl font-semibold text-black">{squad.weekly.secured}</p>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-500">
              Secured
            </p>
          </div>
          <div className="rounded-3xl border border-blue-100/70 bg-white px-3 py-4 text-center">
            <p className="font-display text-2xl font-semibold text-black">
              {squad.weekly.activeMembers}
            </p>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-500">
              Showed up
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-3xl border border-amber-100 bg-amber-50/60 px-5 py-4">
          <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-semibold leading-relaxed text-amber-900">
            Squad totals appear after three people join
          </p>
        </div>
      )}

      <div className="mt-4">
        <WeeklyGoalCard
          goal={squad.goal}
          streakWeeks={squad.streakWeeks}
          color={squad.color}
        />
      </div>

      <div className="mt-4">
        <MockWindowCard
          mockWindow={squad.mockWindow}
          examName={squad.examName}
          inviteUrl={squad.inviteUrl}
        />
      </div>

      <div className="mt-4">
        <InviteShare inviteUrl={squad.inviteUrl} shareMessage={squad.shareMessage} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-blue-100/60 pt-4">
        <p className="text-xs font-semibold text-gray-500">
          You joined on {new Date(squad.joinedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <LeaveSquadButton />
      </div>
    </div>
  )
}
