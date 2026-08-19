'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Compass, Loader2 } from 'lucide-react'
import FeedCard from './feed-card'
import InterestPicker from './interest-picker'
import type { FeedItem } from '@/lib/explore/feed-types'
import {
  LOCAL_FOLLOWED_KEY,
  LOCAL_INTERESTS_KEY,
  LOCAL_PICKER_SEEN_KEY,
  LOCAL_SAVED_KEY,
} from '@/lib/explore/feed-types'
import { track } from '@/lib/analytics'

interface DiscoveryFeedProps {
  initialItems: FeedItem[]
  initialSeenIds: string[]
  initialSavedIds: string[]
  initialFollowedIds: string[]
  initialInterests: string[]
  hasUser: boolean
}

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export default function DiscoveryFeed({
  initialItems,
  initialSeenIds,
  initialSavedIds,
  initialFollowedIds,
  initialInterests,
  hasUser,
}: DiscoveryFeedProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems)
  const [saved, setSaved] = useState<Set<string>>(() => new Set(initialSavedIds))
  const [followed, setFollowed] = useState<Set<string>>(() => new Set(initialFollowedIds))
  const [interests, setInterests] = useState<string[]>(initialInterests)
  const [showPicker, setShowPicker] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [ended, setEnded] = useState(false)
  const seenRef = useRef<Set<string>>(new Set(initialSeenIds))
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const localSaved = readStored<string[]>(LOCAL_SAVED_KEY)
    const localFollowed = readStored<string[]>(LOCAL_FOLLOWED_KEY)
    const localInterests = readStored<string[]>(LOCAL_INTERESTS_KEY)
    setSaved((prev) => new Set([...prev, ...(localSaved ?? [])]))
    setFollowed((prev) => new Set([...prev, ...(localFollowed ?? [])]))
    if (initialInterests.length === 0 && Array.isArray(localInterests) && localInterests.length > 0) {
      setInterests(localInterests)
    }
    if (initialInterests.length === 0 && !readStored<string>(LOCAL_PICKER_SEEN_KEY)) {
      setShowPicker(true)
    }
  }, [initialInterests.length])

  const loadMore = useCallback(async () => {
    if (loadingMore || ended) return
    setLoadingMore(true)
    try {
      const res = await fetch('/api/explore/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests,
          seenIds: [...seenRef.current],
          limit: 6,
        }),
      })
      const json = (await res.json()) as { items: FeedItem[] }
      if (!json.items || json.items.length === 0) {
        setEnded(true)
      } else {
        setItems((prev) => [...prev, ...json.items])
        for (const item of json.items) {
          seenRef.current.add(item.id)
          if (item.entityId && item.entityType) {
            seenRef.current.add(`${item.entityType}:${item.entityId}`)
          }
        }
      }
    } catch {
      setEnded(true)
    } finally {
      setLoadingMore(false)
    }
  }, [interests, loadingMore, ended])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { rootMargin: '600px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const persistLocal = (key: string, value: Set<string>) => {
    try {
      localStorage.setItem(key, JSON.stringify([...value]))
    } catch {
      // storage unavailable — fine
    }
  }

  const sendInteraction = async (
    item: FeedItem,
    action: string,
    enabled: boolean
  ) => {
    if (!hasUser || !item.entityId || !item.entityType) return
    try {
      const url = `/api/explore/interactions?entityType=${encodeURIComponent(
        item.entityType
      )}&entityId=${encodeURIComponent(item.entityId)}&action=${encodeURIComponent(action)}`
      await fetch(url, {
        method: enabled ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: enabled ? JSON.stringify({ entityType: item.entityType, entityId: item.entityId, action }) : undefined,
      })
    } catch {
      // interactions must never break the feed
    }
  }

  const handleOpen = (item: FeedItem) => {
    void track('explore-card-click', {
      entityType: item.entityType,
      entityId: item.entityId,
      cardType: item.type,
    })
    if (hasUser) void sendInteraction(item, 'click', true)
  }

  const handleSave = (item: FeedItem) => {
    const active = !saved.has(item.id)
    setSaved((prev) => {
      const next = new Set(prev)
      if (active) next.add(item.id)
      else next.delete(item.id)
      if (!hasUser) persistLocal(LOCAL_SAVED_KEY, next)
      return next
    })
    void track('explore-save', { entityType: item.entityType, entityId: item.entityId, active })
    if (hasUser) void sendInteraction(item, 'save', active)
  }

  const handleFollow = (item: FeedItem) => {
    const active = !followed.has(item.id)
    setFollowed((prev) => {
      const next = new Set(prev)
      if (active) next.add(item.id)
      else next.delete(item.id)
      if (!hasUser) persistLocal(LOCAL_FOLLOWED_KEY, next)
      return next
    })
    void track('explore-follow', { entityType: item.entityType, entityId: item.entityId, active })
    if (hasUser) void sendInteraction(item, 'follow', active)
  }

  const handleShare = async (item: FeedItem) => {
    void track('explore-share', { entityType: item.entityType, entityId: item.entityId })
    if (hasUser) void sendInteraction(item, 'share', true)
    const url = new URL(item.href, window.location.origin).toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: item.headline, text: item.body, url })
        return
      }
    } catch {
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(item.id)
      window.setTimeout(() => setCopiedId(null), 1600)
    } catch {
      // clipboard unavailable
    }
  }

  const handleDismiss = (item: FeedItem) => {
    setItems((prev) => prev.filter((x) => x.id !== item.id))
    seenRef.current.add(item.id)
    if (item.entityId && item.entityType) {
      seenRef.current.add(`${item.entityType}:${item.entityId}`)
    }
    void track('explore-dismiss', { entityType: item.entityType, entityId: item.entityId })
    if (hasUser) void sendInteraction(item, 'dismiss', true)
  }

  const refreshFeed = useCallback(async (chosen: string[]) => {
    setLoadingMore(true)
    try {
      const res = await fetch('/api/explore/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: chosen, seenIds: [], limit: 10 }),
      })
      const json = (await res.json()) as { items: FeedItem[]; seenIds: string[] }
      if (json.items && json.items.length > 0) {
        setItems(json.items)
        seenRef.current = new Set(json.seenIds ?? [])
        setEnded(false)
      }
    } catch {
      // keep the current feed
    } finally {
      setLoadingMore(false)
    }
  }, [])

  const handleInterestsDone = (chosen: string[]) => {
    setInterests(chosen)
    setShowPicker(false)
    try {
      localStorage.setItem(LOCAL_INTERESTS_KEY, JSON.stringify(chosen))
      localStorage.setItem(LOCAL_PICKER_SEEN_KEY, '1')
    } catch {
      // storage unavailable — fine
    }
    if (hasUser && chosen.length > 0) {
      void fetch('/api/explore/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: chosen }),
      })
    }
    if (chosen.length > 0) void refreshFeed(chosen)
  }

  const actions = {
    onOpen: handleOpen,
    onSave: handleSave,
    onFollow: handleFollow,
    onShare: handleShare,
    onDismiss: handleDismiss,
  }

  return (
    <div className="space-y-5">
      {showPicker && <InterestPicker onDone={handleInterestsDone} />}

      <div className="flex items-center gap-2 px-1">
        <Compass className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">For you</h2>
      </div>

      {items.map((item) => (
        <FeedCard
          key={item.id}
          item={item}
          saved={saved.has(item.id)}
          followed={followed.has(item.id)}
          copied={copiedId === item.id}
          actions={actions}
        />
      ))}

      <div ref={sentinelRef} className="flex min-h-[64px] items-center justify-center py-4">
        {loadingMore ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-label="Loading more" />
        ) : ended ? (
          <p className="text-sm text-gray-400">
            That&apos;s the feed for now — check back for fresh ideas.
          </p>
        ) : (
          <p className="text-sm text-gray-300">More possibilities…</p>
        )}
      </div>
    </div>
  )
}