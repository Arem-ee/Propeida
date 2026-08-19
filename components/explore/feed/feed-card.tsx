'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  BellRing,
  Bookmark,
  BookmarkCheck,
  Brain,
  Building2,
  Flag,
  Flame,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Map,
  Puzzle,
  Scale,
  School,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import type { FeedItem, FeedItemType } from '@/lib/explore/feed-types'
import type { LucideIcon } from 'lucide-react'
import { SceneArt } from '@/components/explore/visuals/scene-art'

const TYPE_STYLES: Record<FeedItemType, { pill: string; icon: string; gradient: string }> = {
  fact: { pill: 'bg-sky-50 text-sky-700', icon: 'bg-sky-100', gradient: 'from-sky-50 to-white' },
  discovery: { pill: 'bg-blue-50 text-blue-700', icon: 'bg-blue-100', gradient: 'from-blue-50 to-white' },
  myth: { pill: 'bg-amber-50 text-amber-700', icon: 'bg-amber-100', gradient: 'from-amber-50 to-white' },
  pathway: { pill: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-100', gradient: 'from-emerald-50 to-white' },
  comparison: { pill: 'bg-violet-50 text-violet-700', icon: 'bg-violet-100', gradient: 'from-violet-50 to-white' },
  interactive: { pill: 'bg-fuchsia-50 text-fuchsia-700', icon: 'bg-fuchsia-100', gradient: 'from-fuchsia-50 to-white' },
  adjacent: { pill: 'bg-teal-50 text-teal-700', icon: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  course: { pill: 'bg-cyan-50 text-cyan-700', icon: 'bg-cyan-100', gradient: 'from-cyan-50 to-white' },
  university: { pill: 'bg-rose-50 text-rose-700', icon: 'bg-rose-100', gradient: 'from-rose-50 to-white' },
  trending: { pill: 'bg-orange-50 text-orange-700', icon: 'bg-orange-100', gradient: 'from-orange-50 to-white' },
  personalized: { pill: 'bg-indigo-50 text-indigo-700', icon: 'bg-indigo-100', gradient: 'from-indigo-50 to-white' },
  sectors: { pill: 'bg-teal-50 text-teal-700', icon: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  demand: { pill: 'bg-emerald-50 text-emerald-700', icon: 'bg-emerald-100', gradient: 'from-emerald-50 to-white' },
  reality: { pill: 'bg-rose-50 text-rose-700', icon: 'bg-rose-100', gradient: 'from-rose-50 to-white' },
}

const TYPE_ICONS: Record<FeedItemType, LucideIcon> = {
  fact: Lightbulb,
  discovery: Search,
  myth: Brain,
  pathway: Map,
  comparison: Scale,
  interactive: HelpCircle,
  adjacent: Puzzle,
  course: GraduationCap,
  university: School,
  trending: Flame,
  personalized: Sparkles,
  sectors: Building2,
  demand: TrendingUp,
  reality: Flag,
}

export interface FeedCardActions {
  onOpen?: (item: FeedItem) => void
  onSave: (item: FeedItem) => void
  onFollow: (item: FeedItem) => void
  onShare: (item: FeedItem) => void
  onDismiss: (item: FeedItem) => void
}

interface FeedCardProps {
  item: FeedItem
  saved: boolean
  followed: boolean
  copied: boolean
  actions: FeedCardActions
}

export default function FeedCard({ item, saved, followed, copied, actions }: FeedCardProps) {
  const style = TYPE_STYLES[item.type]
  const Icon = TYPE_ICONS[item.type]
  const actionable = Boolean(item.entityId && item.entityType)

  const stop = (event: React.MouseEvent, handler: (item: FeedItem) => void) => {
    event.preventDefault()
    event.stopPropagation()
    handler(item)
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-b ${style.gradient} shadow-sm`}
    >
      <Link
        href={item.href}
        onClick={() => actions.onOpen?.(item)}
        aria-label={`${item.headline} — ${item.ctaLabel}`}
        className="flex flex-col gap-3 p-5 pb-4"
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${style.pill}`}
          >
            {item.label}
          </span>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <h3 className="text-xl font-extrabold leading-snug tracking-tight text-gray-900">
          {item.headline}
        </h3>
        <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">
          {item.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      {item.scene ? (
        <div className="px-5 pb-2">
          <SceneArt scene={item.scene} className="h-28 w-full" label={`${item.label} illustration`} />
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-1 border-t border-gray-100/80 px-2 py-1">
        <div className="flex items-center gap-1">
          {actionable && (
            <button
              type="button"
              onClick={(event) => stop(event, actions.onSave)}
              aria-label={saved ? 'Remove from saved' : 'Save for later'}
              aria-pressed={saved}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
                saved ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
              }`}
            >
              {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
          )}
          {actionable && (
            <button
              type="button"
              onClick={(event) => stop(event, actions.onFollow)}
              aria-label={followed ? 'Stop following' : 'Follow this career'}
              aria-pressed={followed}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
                followed ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-600'
              }`}
            >
              {followed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </button>
          )}
          <button
            type="button"
            onClick={(event) => stop(event, actions.onShare)}
            aria-label={copied ? 'Link copied' : 'Share'}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors ${
              copied ? 'text-emerald-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={(event) => stop(event, actions.onDismiss)}
          aria-label="Not for me"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-gray-300 transition-colors hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}