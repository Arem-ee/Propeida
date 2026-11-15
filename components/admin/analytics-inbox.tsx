'use client'

import { useState } from 'react'
import { AdminTable, THead, Th, TBody, Td } from './table'

export interface AnalyticsEvent {
  event_name: string
  event_data: Record<string, unknown> | null
  url_path: string | null
  created_at: string
}

const EVENT_LABELS: Record<string, string> = {
  'hero-cta-click': 'Hero CTA clicks',
  'whatsapp-click': 'WhatsApp link clicks',
  'signup-start': 'Signups started',
  'signup-complete': 'Signups completed',
  'mock-start': 'Mock exams started',
  'mock-complete': 'Mock exams completed',
  'visit-partner': 'Partner page visits',
  'visit-sponsor': 'Sponsor page visits',
  'visit-funding': 'Funding page visits',
  'explore-card-click': 'Explore card clicks',
  'explore-share': 'Explore shares',
  'explore-interests-skipped': 'Skipped topic interests',
  'support-page-view': 'Support page views',
}

function humanize(name: string) {
  if (EVENT_LABELS[name]) return EVENT_LABELS[name]
  const spaced = name.replace(/[-_]+/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Flat JSON object with few keys renders as readable "key: value" chips; anything else stays raw JSON. */
function DataCell({ value }: { value: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) {
    return <span className="text-ink-soft/50">—</span>
  }
  const entries = Object.entries(value)
  const flat = entries.every(([, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v))
  if (flat && entries.length <= 4) {
    return (
      <span className="inline-flex flex-wrap gap-1">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft"
          >
            <span className="text-ink-soft/60">{k}:</span>
            <span className="max-w-[140px] truncate">{String(v)}</span>
          </span>
        ))}
      </span>
    )
  }
  const raw = JSON.stringify(value)
  return <span title={raw}>{raw.slice(0, 80)}{raw.length > 80 ? '…' : ''}</span>
}

export default function AnalyticsInbox({
  events,
  counts,
  total,
}: {
  events: AnalyticsEvent[]
  counts: { event_name: string; count: number }[]
  total: number
}) {
  const [filter, setFilter] = useState<string>('all')

  const sortedCounts = [...counts].sort((a, b) => b.count - a.count)
  const visible = filter === 'all' ? events : events.filter((e) => e.event_name === filter)
  const visibleCount = filter === 'all' ? total : counts.find((c) => c.event_name === filter)?.count ?? 0

  return (
    <>
      {/* Count cards: every event we have, humanized */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {sortedCounts.map(({ event_name, count }) => (
          <button
            key={event_name}
            type="button"
            onClick={() => setFilter((current) => (current === event_name ? 'all' : event_name))}
            aria-pressed={filter === event_name}
            className={`cursor-pointer rounded-2xl border p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all hover:-translate-y-0.5 ${
              filter === event_name ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-200' : 'border-blue-100/70 bg-white'
            }`}
          >
            <div className="font-display text-2xl font-medium tabular-nums leading-none text-black">{count}</div>
            <div className="mt-2 text-[11px] font-bold leading-snug text-ink-soft">
              {humanize(event_name)}
            </div>
          </button>
        ))}
      </div>

      {/* Filter + table */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-ink-soft">
          Showing {visible.length} most recent of {visibleCount} {filter === 'all' ? 'total' : humanize(filter).toLowerCase()} events
        </p>
        <label className="inline-flex items-center gap-2 text-xs font-extrabold text-ink-soft">
          <span className="sr-only">Filter by event</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by event"
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[40px]"
          >
            <option value="all">All events</option>
            {sortedCounts.map(({ event_name, count }) => (
              <option key={event_name} value={event_name}>
                {humanize(event_name)} ({count})
              </option>
            ))}
          </select>
        </label>
      </div>

      <AdminTable>
        <THead>
          <tr>
            <Th>Event</Th>
            <Th>Page</Th>
            <Th>Data</Th>
            <Th className="text-right">When</Th>
          </tr>
        </THead>
        <TBody>
          {visible.map((event, idx) => (
            <tr key={idx} className="hover:bg-blue-50/30">
              <Td className="whitespace-nowrap font-bold text-black">
                {humanize(event.event_name)}
              </Td>
              <Td className="max-w-[180px] truncate whitespace-nowrap">
                {event.url_path ?? '—'}
              </Td>
              <Td className="max-w-[280px]">
                <DataCell value={event.event_data} />
              </Td>
              <Td className="whitespace-nowrap text-right">
                {new Date(event.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-14 text-center text-sm font-semibold text-ink-soft">
                No events in this filter yet
              </td>
            </tr>
          )}
        </TBody>
      </AdminTable>
    </>
  )
}
