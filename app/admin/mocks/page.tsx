import PageHeader from '@/components/admin/page-header'
import MockEventManager from '@/components/admin/mock-event-manager'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export const metadata = { title: 'Mock events' }
export const dynamic = 'force-dynamic'

export default async function MockEventsPage() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: exams } = await supabase.from('exams').select('id, name, slug').order('name')

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Mock events"
        description="Schedule a platform-wide, timed paper everyone sits together. Pro users enter during the window; every participant sees the same questions, and the leaderboard displays after results land"
      />
      <div className="max-w-2xl">
        <MockEventManager exams={(exams ?? []).map((e) => ({ id: e.id, name: e.name, slug: e.slug }))} />
      </div>
    </div>
  )
}
