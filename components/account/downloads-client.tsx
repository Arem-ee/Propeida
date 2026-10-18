'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, HardDrive, WifiOff } from 'lucide-react'

function formatMB(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${Math.max(1, Math.round(mb * 1024))} KB` : `${mb.toFixed(1)} MB`
}

export default function DownloadsClient() {
  const [usage, setUsage] = useState<number | null>(null)
  const [quota, setQuota] = useState<number | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [deferred, setDeferred] = useState<{ prompt: () => void } | null>(null)

  useEffect(() => {
    let live = true
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      navigator.storage.estimate()
        .then((est) => {
          if (!live) return
          setUsage(est.usage ?? null)
          setQuota(est.quota ?? null)
        })
        .catch(() => {})
    }
    const onPrompt = (e: Event) => {
      e.preventDefault()
      if (!live) return
      setDeferred({ prompt: () => (e as unknown as { prompt: () => void }).prompt() })
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => {
      live = false
      window.removeEventListener('beforeinstallprompt', onPrompt)
    }
  }, [])

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
          Downloads
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          What lives on this device.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="flex items-center gap-2 font-display text-lg font-medium text-black">
            <HardDrive className="h-5 w-5 text-blue-600" />
            Storage used
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-black">
            {usage === null ? '—' : formatMB(usage)}
            {quota !== null && (
              <span className="ml-2 align-middle text-sm font-bold text-gray-500">of {formatMB(quota)}</span>
            )}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink-soft">
            Lessons ship inside the app and open offline once loaded. Question banks sync per session and need a connection for now — downloadable subject packs arrive with the packs system.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
          <p className="flex items-center gap-2 font-display text-lg font-medium text-black">
            <Download className="h-5 w-5 text-blue-600" />
            Install Propeida
          </p>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink-soft">
            Add Propeida to your home screen for fullscreen study and faster opens.
          </p>
          {canInstall && deferred ? (
            <button
              onClick={() => deferred.prompt()}
              className="mt-3.5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px] cursor-pointer"
            >
              Install app
            </button>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-[13px] font-bold text-gray-500">
              <WifiOff className="h-4 w-4" />
              Use your browser&apos;s “Add to Home screen” — or you&apos;re already installed.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
