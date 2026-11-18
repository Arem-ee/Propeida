'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Mascot } from '@/components/mascot'
import ReferralCard from '@/components/account/referral-card'
import { getPreferences, setPreference, type FontScale, type Theme } from '@/lib/settings'
import { setCohortUpdatesEnabled } from '@/lib/actions/notifications'

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)] animate-fade-up">
      <p className="font-display text-lg font-medium text-black">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">{hint}</p>
      <div className="mt-3.5">{children}</div>
    </div>
  )
}

function Choice<T extends string>({
  options,
  value,
  onPick,
}: {
  options: { value: T; label: string }[]
  value: T
  onPick: (v: T) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onPick(o.value)}
          aria-pressed={value === o.value}
          className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold min-h-[52px] cursor-pointer transition-all pressable ${
            value === o.value
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-ink-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function SettingsClient({
  initialNotificationsEnabled = true,
  planLabel = 'Free',
  planHint = 'Free practice and one mock per exam, and Pro opens everything',
  planCtaLabel = 'See Pro',
  referral = null,
}: {
  initialNotificationsEnabled?: boolean
  planLabel?: string
  planHint?: string
  planCtaLabel?: string
  referral?: { referralCode: string; totalReferrals: number; verifiedReferrals: number } | null
}) {
  const [font, setFont] = useState<FontScale>('standard')
  const [theme, setTheme] = useState<Theme>('default')
  const [sound, setSound] = useState(true)
  const [haptics, setHaptics] = useState(true)
  const [notifications, setNotifications] = useState(initialNotificationsEnabled)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const [savingNotifications, startNotifications] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const prefs = getPreferences()
    setFont(prefs.font)
    setTheme(prefs.theme)
    setSound(prefs.sound)
    setHaptics(prefs.haptics)
  }, [])

  const removeAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Could not delete account')
      window.location.href = '/'
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete your account')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black">
          Settings
        </h1>
      </div>

      <div className="space-y-4">
        <Row label="Plan" hint={planHint}>
          <p className="font-display text-xl font-medium text-black">{planLabel}</p>
          <Link
            href="/account/upgrade"
            className="mt-3 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px] pressable"
          >
            {planCtaLabel}
          </Link>
        </Row>

        {referral && (
          <Row
            label="Bring a friend"
            hint="Share your link, and when your friend makes their first Pro payment, you get 7 days of JAMB Pro"
          >
            <ReferralCard {...referral} />
          </Row>
        )}

        <Row label="Text size" hint="This device only and separate from the accessibility needs saved on your profile">
          <Choice<FontScale>
            value={font}
            onPick={(v) => { setFont(v); setPreference('font', v) }}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </Row>

        <Row label="Appearance" hint="This device only, and sunlight gives you maximum contrast outdoors while profile accessibility is separate">
          <Choice<Theme>
            value={theme}
            onPick={(v) => { setTheme(v); setPreference('theme', v) }}
            options={[
              { value: 'default', label: 'Default' },
              { value: 'cream', label: 'Cream' },
              { value: 'sunlight', label: 'Sunlight' },
            ]}
          />
        </Row>

        <Row label="Celebration sound" hint="One short chime when a session ends and never during questions">
          <Choice
            value={sound ? 'on' : 'off'}
            onPick={(v) => { setSound(v === 'on'); setPreference('sound', v) }}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </Row>

        <Row label="Haptics" hint="One soft vibration on session completion, where supported">
          <Choice
            value={haptics ? 'on' : 'off'}
            onPick={(v) => { setHaptics(v === 'on'); setPreference('haptics', v) }}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </Row>

        <Row
          label="Cohort updates"
          hint="Short anonymous updates about your study group and a weekly summary, never a ranking"
        >
          <Choice
            value={notifications ? 'on' : 'off'}
            onPick={(v) => {
              const enabled = v === 'on'
              setNotifications(enabled)
              setNotificationsError(null)
              startNotifications(async () => {
                try {
                  await setCohortUpdatesEnabled(enabled)
                } catch {
                  setNotifications(!enabled)
                  setNotificationsError('Could not save this preference')
                }
              })
            }}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
          {savingNotifications && <p className="mt-2 text-xs font-bold text-ink-soft">Saving your settings</p>}
          {notificationsError && <p className="mt-2 text-xs font-bold text-red-700">{notificationsError}</p>}
        </Row>

        <div className="rounded-3xl border-2 border-red-200 bg-red-50/50 p-5">
          <p className="font-display text-lg font-medium text-black">Delete account</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">
            This removes your profile, history, results, and learning records, and you cannot undo it
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3.5 rounded-2xl border-2 border-red-300 bg-white px-5 py-2.5 text-sm font-extrabold text-red-700 min-h-[48px] cursor-pointer pressable"
            >
              Delete your account
            </button>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              <div className="flex items-center gap-3">
                <Mascot expression="worried" size="sm" className="shrink-0" />
                <p className="text-sm font-extrabold text-red-700 leading-snug">
                  Are you sure? There is no undo for this
                </p>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => void removeAccount()}
                  disabled={deleting}
                  className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white min-h-[48px] cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting your account' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-extrabold text-ink-soft min-h-[48px] cursor-pointer"
                >
                  Keep my account
                </button>
              </div>
              {deleteError && <p className="text-sm font-bold text-red-700">{deleteError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
