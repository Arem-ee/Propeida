'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing, Bookmark, BookmarkCheck } from 'lucide-react'
import type { FeedEntityType } from '@/lib/explore/feed-types'
import { LOCAL_FOLLOWED_KEY, LOCAL_SAVED_KEY } from '@/lib/explore/feed-types'
import { track } from '@/lib/analytics'

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function persistLocal(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // storage unavailable - fine
  }
}

interface CareerActionsProps {
  entityId: string
  entityType?: FeedEntityType
  entityName?: string
  variant?: 'inline' | 'bar'
}

export default function CareerActions({
  entityId,
  entityType = 'career',
  entityName,
  variant = 'inline',
}: CareerActionsProps) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [saved, setSaved] = useState(false)
  const [followed, setFollowed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      let isAuthed = false
      try {
        const res = await fetch('/api/explore/interactions')
        if (res.ok) {
          isAuthed = true
          const json = (await res.json()) as { savedIds: string[]; followedIds: string[] }
          if (!cancelled) {
            setSaved(json.savedIds.includes(entityId))
            setFollowed(json.followedIds.includes(entityId))
          }
        }
      } catch {
        // network error - fall back to local state
      }
      if (!cancelled) {
        setAuthed(isAuthed)
        if (!isAuthed) {
          const localSaved = readStored<string[]>(LOCAL_SAVED_KEY) ?? []
          const localFollowed = readStored<string[]>(LOCAL_FOLLOWED_KEY) ?? []
          setSaved(localSaved.includes(entityId))
          setFollowed(localFollowed.includes(entityId))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [entityId])

  const toggle = async (action: 'save' | 'follow', current: boolean) => {
    const next = !current
    if (action === 'save') setSaved(next)
    else setFollowed(next)
    void track(`explore-${action}`, { entityType, entityId, active: next })
    if (!authed) {
      const key = action === 'save' ? LOCAL_SAVED_KEY : LOCAL_FOLLOWED_KEY
      const stored = new Set(readStored<string[]>(key) ?? [])
      if (next) stored.add(entityId)
      else stored.delete(entityId)
      persistLocal(key, stored)
      return
    }
    const url = '/api/explore/interactions'
    const method = next ? 'POST' : 'DELETE'
    try {
      if (method === 'POST') {
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityType, entityId, action }),
        })
      } else {
        await fetch(`${url}?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}&action=${action}`, {
          method,
        })
      }
    } catch {
      // revert on failure
      if (action === 'save') setSaved(current)
      else setFollowed(current)
    }
  }

  const baseClass =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition-colors'

  const saveButton = (
    <button
      type="button"
      onClick={() => void toggle('save', saved)}
      aria-pressed={saved}
      className={`${baseClass} ${
        saved
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
      } ${variant === 'bar' ? 'flex-1' : ''}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? 'Saved' : 'Save for later'}
    </button>
  )

  const followButton = (
    <button
      type="button"
      onClick={() => void toggle('follow', followed)}
      aria-pressed={followed}
      className={`${baseClass} ${
        followed
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
      } ${variant === 'bar' ? 'flex-1' : ''}`}
    >
      {followed ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {followed ? 'Following' : 'Follow'}
    </button>
  )

  if (variant === 'bar') {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-lg gap-2 px-4 py-3 safe-area-bottom">
          {saveButton}
          {followButton}
        </div>
        {entityName ? (
          <p className="sr-only">Save or follow {entityName} to shape your feed.</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {saveButton}
      {followButton}
      {entityName ? (
        <p className="sr-only">Save or follow {entityName} to shape your feed.</p>
      ) : null}
    </div>
  )
}