import { createAdminClient } from '@/lib/supabase/admin'
import { BarChart3 } from 'lucide-react'
import PageHeader from '@/components/admin/page-header'
import AnalyticsInbox from '@/components/admin/analytics-inbox'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics' }

export default async function AdminAnalyticsPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [{ data: events }, { data: eventCounts }] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('event_name, event_data, url_path, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.rpc('get_analytics_event_counts'),
  ])

  const counts = (eventCounts ?? []).map((e: { event_name: string; count: number | string | null }) => ({
    event_name: e.event_name,
    count: Number(e.count ?? 0),
  }))
  const totalCount = counts.reduce((sum: number, e: { count: number }) => sum + e.count, 0)

  return (
    <div>
      <PageHeader
        eyebrow="Audience"
        title="Analytics"
        description="What the public does on the marketing site and in product. Counts come from the event table — nothing here is estimated"
        actions={
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-ink-soft">
            {totalCount} total events
          </span>
        }
      />

      {!events || events.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
            <BarChart3 className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-ink-soft">No events have come in yet</p>
        </div>
      ) : (
        <AnalyticsInbox
          events={(events ?? []) as Parameters<typeof AnalyticsInbox>[0]['events']}
          counts={counts}
          total={totalCount}
        />
      )}
    </div>
  )
}
