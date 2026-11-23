'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, type KeyboardEvent } from 'react'
import { PROGRESS_VIEWS, type ProgressView } from '@/lib/progress-views'

/**
 * URL-driven tabs. Links give deep links, refresh, Back/Forward and no-JS
 * support; the key handler adds the APG arrow-key roving behaviour that a
 * plain link row lacks.
 */
export function ProgressTabs({ view }: { view: ProgressView }) {
  const router = useRouter()
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const last = PROGRESS_VIEWS.length - 1
    let next = index
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return

    event.preventDefault()
    const target = PROGRESS_VIEWS[next]!.id
    router.push(`/progress?view=${target}`, { scroll: false })
    refs.current[target]?.focus()
  }

  return (
    <div role="tablist" aria-label="Progress views" className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      {PROGRESS_VIEWS.map((tab, index) => {
        const active = tab.id === view
        return (
          <Link
            key={tab.id}
            id={`tab-${tab.id}`}
            href={`/progress?view=${tab.id}`}
            ref={(node) => { refs.current[tab.id] = node }}
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              active
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-ink-soft hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
