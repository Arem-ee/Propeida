'use client'

import { useState } from 'react'

export default function PublishToggle({
  entity,
  id,
  initialPublished,
  onToggle,
}: {
  entity: 'careers' | 'courses' | 'universities'
  id: string
  initialPublished: boolean
  onToggle: (published: boolean) => void
}) {
  const [published, setPublished] = useState(initialPublished)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const toggle = async () => {
    if (busy) return
    const next = !published
    setBusy(true)
    setError(false)
    try {
      const res = await fetch(`/api/admin/explore/${entity}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: next }),
      })
      if (!res.ok) throw new Error('Failed')
      setPublished(next)
      onToggle(next)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={published}
        aria-label={`${published ? 'Unpublish' : 'Publish'}`}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 cursor-pointer ${
          published ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            published ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs font-bold ${published ? 'text-green-600' : 'text-gray-400'}`}>
        {busy ? '…' : published ? 'Live' : 'Draft'}
      </span>
      {error && (
        <button onClick={toggle} className="text-xs font-semibold text-red-600 hover:underline cursor-pointer">
          Failed — retry
        </button>
      )}
    </div>
  )
}