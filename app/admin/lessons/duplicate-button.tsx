'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Duplicate a lesson into a new slug. The copy starts as a draft. */
export default function DuplicateLessonButton({ lessonId, baseSlug }: { lessonId: string; baseSlug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState(`${baseSlug}-copy`)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setWorking(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/lessons/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lessonId, slug: slug.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Duplicate failed')
      router.push(`/admin/lessons/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duplicate failed')
      setWorking(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Copy this lesson with all its blocks into a new draft"
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 min-h-[36px] cursor-pointer"
      >
        Duplicate
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        aria-label="New lesson slug"
        className="w-40 rounded-lg border border-gray-200 px-2 py-1.5 text-xs min-h-[36px]"
      />
      <button
        onClick={() => void run()}
        disabled={working}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 min-h-[36px] cursor-pointer disabled:opacity-50"
      >
        {working ? 'Copying…' : 'Copy'}
      </button>
      <button
        onClick={() => { setOpen(false); setError(null) }}
        className="rounded-lg px-2 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 min-h-[36px] cursor-pointer"
      >
        Cancel
      </button>
      {error && <span className="text-xs font-bold text-red-600">{error}</span>}
    </span>
  )
}
