import { createAdminClient } from '@/lib/supabase/admin'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const EVENT_LABELS: Record<string, string> = {
  'hero-cta-click': 'Hero CTA clicks',
  'whatsapp-click': 'WhatsApp link clicks',
  'signup-start': 'Signups started',
  'signup-complete': 'Signups completed',
  'mock-start': 'Mock exams started',
  'mock-complete': 'Mock exams completed',
  'visit-partner': 'Partner page visits',
  'visit-sponsor': 'Sponsor page visits',
}

export default async function AdminAnalyticsPage() {
  const supabase = createAdminClient()

  const [{ data: events }, { count: totalCount }] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('event_name, event_data, url_path, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
  ])

  const grouped = new Map<string, number>()
  for (const event of events ?? []) {
    grouped.set(event.event_name, (grouped.get(event.event_name) ?? 0) + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-3 py-1">
          {totalCount ?? 0} total events
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {[...grouped.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => (
            <div key={name} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{count}</div>
              <div className="mt-1 text-xs font-semibold text-gray-500">
                {EVENT_LABELS[name] ?? name}
              </div>
            </div>
          ))}
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400 mb-4">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No events yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Page</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
                    {EVENT_LABELS[event.event_name] ?? event.event_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap max-w-[180px] truncate">
                    {event.url_path ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-[280px] truncate">
                    {event.event_data && Object.keys(event.event_data).length > 0
                      ? JSON.stringify(event.event_data)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-400 whitespace-nowrap">
                    {new Date(event.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalCount && totalCount > 500 ? (
            <div className="border-t border-gray-100 px-4 py-3 text-center text-xs font-semibold text-gray-400">
              Showing the 500 most recent of {totalCount} events
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
