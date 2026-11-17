'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Play } from 'lucide-react'
import { startMockEventSession } from '@/lib/actions/mock-events'
import type { StartMockEventResult } from '@/lib/actions/mock-events'

export default function EventEnterButton({ eventId, label, disabledLabel }: { eventId: string; label: string; disabledLabel?: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onClick = async () => {
    setBusy(true)
    setError(null)
    const result: StartMockEventResult = await startMockEventSession(eventId)
    if (result.ok && result.sessionId) {
      router.push(`/mocks/session/${result.sessionId}`)
      return
    }
    setError(result.error ?? 'Could not start the mock')
    setBusy(false)
  }

  return (
    <div>
      {error && <p className="mb-2 text-sm font-semibold text-red-600">{error}</p>}
      <button
        onClick={onClick}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 min-h-[56px] cursor-pointer"
      >
        <Play className="h-5 w-5" />
        {busy ? 'Setting up your mock...' : disabledLabel ?? label}
      </button>
    </div>
  )
}
