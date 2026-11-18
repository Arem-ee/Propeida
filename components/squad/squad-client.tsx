'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Copy, ExternalLink, LogOut, Users, Check, CalendarClock, X, Pencil, Flame } from 'lucide-react'
import {
  cancelSquadMockWindow,
  createSquadMockWindow,
  joinMySquad,
  joinSquadByInvite,
  leaveSquad,
  setSquadIdentity,
  setSquadWeeklyGoal,
  type SquadGoalStatus,
} from '@/lib/actions/squads'
import { GOAL_PRESETS, SQUAD_COLORS, SQUAD_MARKS, type GoalKind } from '@/lib/squad-identity'
import { SquadMarkIcon } from '@/components/squad/squad-marks'

type ActionState = 'idle' | 'working' | 'done'

export function JoinSquadButton({ label = 'Join a squad' }: { label?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          try {
            await joinMySquad()
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not join your squad')
          } finally {
            setBusy(false)
          }
        }}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] disabled:opacity-60 cursor-pointer pressable"
      >
        {busy ? 'Joining…' : label}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}

export function JoinInviteButton({ code }: { code: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          try {
            await joinSquadByInvite(code)
            router.push('/squad')
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not join that squad')
          } finally {
            setBusy(false)
          }
        }}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-[16px] font-extrabold text-white hover:bg-blue-700 min-h-[56px] disabled:opacity-60 cursor-pointer pressable"
      >
        {busy ? 'Joining…' : 'Join this squad'}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}

export function LeaveSquadButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm('Leave your squad? You can join another one later')) return
          setBusy(true)
          setError(null)
          try {
            await leaveSquad()
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not leave your squad')
          } finally {
            setBusy(false)
          }
        }}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 min-h-[44px] cursor-pointer disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {busy ? 'Leaving…' : 'Leave your squad'}
      </button>
      {error && <p role="alert" className="mt-1 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}

export function InviteShare({
  inviteUrl,
  shareMessage,
}: {
  inviteUrl: string
  shareMessage: string
}) {
  const [state, setState] = useState<ActionState>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setState('done')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      // Delivery is best-effort; the link remains visible for manual copy.
      setState('idle')
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`

  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 animate-pop-in">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Users className="h-5 w-5" />
        </span>
        <p className="text-sm font-extrabold text-black">Invite a study partner</p>
      </div>
      <label htmlFor="squad-invite" className="sr-only">Squad invite link</label>
      <input
        id="squad-invite"
        readOnly
        value={inviteUrl}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-4 w-full rounded-2xl border border-blue-100/70 bg-blue-50/40 px-4 py-3 text-xs font-semibold text-ink-soft outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 min-h-[48px] cursor-pointer pressable"
        >
          {state === 'done' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {state === 'done' ? 'Copied' : 'Copy link'}
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 min-h-[48px] pressable"
        >
          <ExternalLink className="h-4 w-4" />
          Share on WhatsApp
        </a>
      </div>
    </div>
  )
}

export function SquadIdentityEditor({
  name,
  mark,
  color,
  isDefaultName,
}: {
  name: string
  mark: string
  color: string
  isDefaultName: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftMark, setDraftMark] = useState(mark)
  const [draftColor, setDraftColor] = useState(color)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraftName(name)
          setDraftMark(mark)
          setDraftColor(color)
          setError(null)
          setOpen(true)
        }}
        className="inline-flex items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 min-h-[44px] cursor-pointer pressable"
      >
        <Pencil className="h-4 w-4" />
        {isDefaultName ? 'Name your squad' : 'Edit squad identity'}
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-3xl border border-blue-100/70 bg-blue-50/40 p-5 animate-pop-in">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
        Squad identity
      </p>
      <p className="mt-1 text-xs font-semibold text-ink-soft">
        Anyone in the squad can edit this
      </p>

      <label htmlFor="squad-name" className="mt-4 block text-xs font-bold text-ink-soft">
        Name
      </label>
      <input
        id="squad-name"
        value={draftName}
        maxLength={40}
        onChange={(event) => setDraftName(event.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
        placeholder="e.g. Lekki Revision Stars"
      />

      <p className="mt-4 text-xs font-bold text-ink-soft">Mark</p>
      <div className="mt-1.5 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {SQUAD_MARKS.map((option) => (
          <button
            key={option.key}
            type="button"
            title={option.label}
            aria-label={`Squad mark ${option.label}`}
            aria-pressed={draftMark === option.key}
            onClick={() => setDraftMark(option.key)}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl cursor-pointer transition-all border-2 ${
              draftMark === option.key ? 'border-blue-600 bg-white' : 'border-transparent bg-white hover:border-blue-300'
            }`}
          >
            <span className="block h-10 w-10">
              <SquadMarkIcon mark={option.key} />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-bold text-ink-soft">Colour</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SQUAD_COLORS.map((option) => (
          <button
            key={option}
            type="button"
            aria-label={`Squad colour ${option}`}
            aria-pressed={draftColor === option}
            onClick={() => setDraftColor(option)}
            className={`h-10 w-10 rounded-2xl cursor-pointer transition-transform ${
              draftColor === option ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'
            }`}
            style={{ backgroundColor: option }}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setError(null)
            try {
              await setSquadIdentity({ name: draftName, mark: draftMark, color: draftColor })
              setOpen(false)
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not save the identity')
            } finally {
              setBusy(false)
            }
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer disabled:opacity-60 pressable"
        >
          <Check className="h-4 w-4" />
          {busy ? 'Saving…' : 'Save identity'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold text-gray-500 hover:text-black min-h-[44px] cursor-pointer"
        >
          Cancel
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}

const GOAL_KINDS: GoalKind[] = ['questions', 'secured']

export function WeeklyGoalCard({
  goal,
  streakWeeks,
  color,
}: {
  goal: SquadGoalStatus | null
  streakWeeks: number | null
  color: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async (kind: GoalKind, target: number) => {
    setBusy(true)
    setError(null)
    try {
      await setSquadWeeklyGoal({ kind, target })
      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set the goal')
    } finally {
      setBusy(false)
    }
  }

  if (editing || !goal) {
    return (
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 animate-pop-in">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
          This week&rsquo;s shared goal
        </p>
        <div className="mt-4 space-y-4">
          {GOAL_KINDS.map((kind) => (
            <div key={kind}>
              <p className="text-xs font-bold text-ink-soft">{GOAL_PRESETS[kind].label}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {GOAL_PRESETS[kind].options.map((target) => (
                  <button
                    key={target}
                    type="button"
                    disabled={busy}
                    onClick={() => pick(kind, target)}
                    className="rounded-2xl border-2 border-blue-100 bg-white px-4 py-2.5 text-xs font-extrabold text-blue-700 hover:border-blue-400 min-h-[44px] cursor-pointer pressable disabled:opacity-60"
                  >
                    {target.toLocaleString('en-NG')} {GOAL_PRESETS[kind].unit}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {goal && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="mt-4 inline-flex items-center gap-2 px-1 py-2 text-xs font-bold text-gray-500 hover:text-black min-h-[40px] cursor-pointer"
          >
            Keep the current goal
          </button>
        )}
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
      </div>
    )
  }

  const preset = GOAL_PRESETS[goal.kind]
  const pct = goal.current == null ? 0 : Math.min(100, Math.round((goal.current / goal.target) * 100))
  const met = goal.met === true

  return (
    <div className={`rounded-3xl border p-5 animate-pop-in ${met ? 'border-emerald-200 bg-emerald-50/60' : 'border-blue-100/70 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
            This week&rsquo;s shared goal
          </p>
          <p className="mt-1 text-sm font-extrabold text-black">{preset.label}</p>
        </div>
        {streakWeeks != null && streakWeeks >= 2 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-700">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {streakWeeks}-week streak
          </span>
        )}
      </div>

      {goal.current == null ? (
        <p className="mt-4 text-sm font-semibold leading-relaxed text-ink-soft">
          Your squad target is <strong>{goal.target.toLocaleString('en-NG')} {preset.unit}</strong>, and totals appear when three people join
        </p>
      ) : (
        <>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: met ? '#059669' : color }}
            />
          </div>
          <p className="mt-2 text-sm font-extrabold text-black">
            {goal.current.toLocaleString('en-NG')} / {goal.target.toLocaleString('en-NG')} {preset.unit}
            {met && (
              <span className="inline-flex items-center gap-1.5 align-middle text-emerald-700">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> goal reached
              </span>
            )}
          </p>
        </>
      )}

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 min-h-[40px] cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5" />
        Change the goal
      </button>
    </div>
  )
}

function localInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MockWindowCard({
  mockWindow,
  examName,
  inviteUrl,
}: {
  mockWindow: { id: string; startsAt: string; canCancel: boolean } | null
  examName: string
  inviteUrl: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(() => localInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = mockWindow
    ? new Date(mockWindow.startsAt).toLocaleString('en-NG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
  const shareMessage = label
    ? `My squad takes the ${examName} mock on ${label} ${inviteUrl}`
    : inviteUrl

  if (mockWindow) {
    return (
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 animate-pop-in">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-black">Squad mock</p>
          </div>
        </div>
        <p className="mt-4 font-display text-xl font-medium leading-snug text-black">{label}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/mocks"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-blue-700 min-h-[48px]"
          >
            <CalendarClock className="h-4 w-4" />
            Open mocks
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-3 text-xs font-extrabold text-blue-700 hover:bg-blue-50 min-h-[48px]"
          >
            <ExternalLink className="h-4 w-4" />
            Tell the squad
          </a>
          {mockWindow.canCancel && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (!window.confirm('Do you want to cancel this squad mock window?')) return
                setBusy(true)
                setError(null)
                try {
                  await cancelSquadMockWindow(mockWindow.id)
                  router.refresh()
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not cancel this window')
                } finally {
                  setBusy(false)
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold text-gray-500 hover:text-red-600 min-h-[48px] cursor-pointer disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Cancel this time
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 animate-pop-in">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-black">Squad mock</p>
        </div>
      </div>
      <label htmlFor="squad-mock-time" className="mt-4 block text-xs font-bold text-ink-soft">
        Date and time
      </label>
      <input
        id="squad-mock-time"
        type="datetime-local"
        value={value}
        min={localInputValue(new Date())}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
      />
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          try {
            await createSquadMockWindow(new Date(value).toISOString())
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not schedule this window')
          } finally {
            setBusy(false)
          }
        }}
        className="mt-3 w-full rounded-2xl bg-blue-600 px-6 py-4 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px] disabled:opacity-60 cursor-pointer pressable"
      >
        {busy ? 'Scheduling…' : 'Schedule mock'}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}
