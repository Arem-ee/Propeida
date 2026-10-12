'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPreferences, setPreference, type FontScale, type Theme } from '@/lib/settings'

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
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
          className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-extrabold min-h-[52px] cursor-pointer transition-all ${
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

export default function SettingsClient() {
  const [font, setFont] = useState<FontScale>('standard')
  const [theme, setTheme] = useState<Theme>('default')
  const [sound, setSound] = useState(true)
  const [haptics, setHaptics] = useState(true)
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
      setDeleteError(err instanceof Error ? err.message : 'Could not delete account')
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
        <Row label="Text size" hint="Larger text is easier in sunlight and on small screens.">
          <Choice<FontScale>
            value={font}
            onPick={(v) => { setFont(v); setPreference('font', v) }}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </Row>

        <Row label="Appearance" hint="Sunlight mode is maximum contrast for outdoors. Cream is softer for night reading.">
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

        <Row label="Celebration sound" hint="One short chime when a session ends. Never during questions.">
          <Choice
            value={sound ? 'on' : 'off'}
            onPick={(v) => { setSound(v === 'on'); setPreference('sound', v) }}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </Row>

        <Row label="Haptics" hint="One soft vibration on session completion, where supported.">
          <Choice
            value={haptics ? 'on' : 'off'}
            onPick={(v) => { setHaptics(v === 'on'); setPreference('haptics', v) }}
            options={[
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </Row>

        <div className="rounded-3xl border-2 border-red-200 bg-red-50/50 p-5">
          <p className="font-display text-lg font-medium text-black">Delete account</p>
          <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">
            Removes your profile, history, results, and learning records. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3.5 rounded-2xl border-2 border-red-300 bg-white px-5 py-2.5 text-sm font-extrabold text-red-700 min-h-[48px] cursor-pointer"
            >
              Delete my account...
            </button>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              <p className="text-sm font-extrabold text-red-700">Are you sure? Everything goes.</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => void removeAccount()}
                  disabled={deleting}
                  className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-extrabold text-white min-h-[48px] cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete everything'}
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
