'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Copy, ExternalLink, LogOut, Users, Check, CalendarClock, X } from 'lucide-react'
import {
  cancelSquadMockWindow,
  createSquadMockWindow,
  joinMySquad,
  joinSquadByInvite,
  leaveSquad,
} from '@/lib/actions/squads'

type ActionState = 'idle' | 'working' | 'done'

export function JoinSquadButton({ label = 'Join my squad' }: { label?: string }) {
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
            setError(err instanceof Error ? err.message : 'Could not join your squad.')
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
            setError(err instanceof Error ? err.message : 'Could not join that squad.')
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
          if (!window.confirm('Leave your squad? You can join another one later.')) return
          setBusy(true)
          setError(null)
          try {
            await leaveSquad()
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not leave your squad.')
          } finally {
            setBusy(false)
          }
        }}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 min-h-[44px] cursor-pointer disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {busy ? 'Leaving…' : 'Leave squad'}
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
        <div>
          <p className="text-sm font-extrabold text-black">Invite a study partner</p>
          <p className="text-xs font-semibold text-gray-500">
            A private link, not a public board. No one else sees it.
          </p>
        </div>
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
    ? `My squad is taking the ${examName} mock together on ${label}. No scores, just showing up. ${inviteUrl}`
    : inviteUrl

  if (mockWindow) {
    return (
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 animate-pop-in">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-black">One mock, one time</p>
            <p className="text-xs font-semibold text-gray-500">
              Everyone takes it at the same time.
            </p>
          </div>
        </div>
        <p className="mt-4 font-display text-xl font-medium leading-snug text-black">{label}</p>
        <p className="mt-1 text-xs font-semibold text-ink-soft">
          Taking it together does not share scores. It just means showing up.
        </p>
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
                if (!window.confirm('Cancel this squad mock window?')) return
                setBusy(true)
                setError(null)
                try {
                  await cancelSquadMockWindow(mockWindow.id)
                  router.refresh()
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not cancel this window.')
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
          <p className="text-sm font-extrabold text-black">Pick one mock time for the squad</p>
          <p className="text-xs font-semibold text-gray-500">
            Pick one time. The squad takes the mock together. Nobody&rsquo;s score is compared.
          </p>
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
            setError(err instanceof Error ? err.message : 'Could not schedule this window.')
          } finally {
            setBusy(false)
          }
        }}
        className="mt-3 w-full rounded-2xl bg-blue-600 px-6 py-4 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px] disabled:opacity-60 cursor-pointer pressable"
      >
        {busy ? 'Scheduling…' : 'Schedule shared mock'}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
    </div>
  )
}
