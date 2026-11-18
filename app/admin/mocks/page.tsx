import PageHeader from '@/components/admin/page-header'
import MockEventManager from '@/components/admin/mock-event-manager'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export const metadata = { title: 'Mock events' }
export const dynamic = 'force-dynamic'

export default async function MockEventsPage() {
  await requireAdmin()
  const supabase = createAdminClient()
  const [{ data: exams }, { data: topics }, { data: subjects }, { data: examSubjects }] = await Promise.all([
    supabase.from('exams').select('id, name, slug').order('name'),
    supabase.from('topics').select('id, subject_id, name, slug, sort_order').eq('published', true).order('sort_order'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
  ])

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjects ?? []) {
    ;(examSubjectMap[es.exam_id] ??= []).push(es.subject_id)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Mock events"
        description="Schedule a platform-wide, timed paper everyone sits together. Pro users enter during the window; every participant sees the same questions, and the leaderboard displays after results land. Check one or more topics to run a focused paper — for example, electrolysis-only or economics-only"
      />
      <div className="max-w-2xl">
        <MockEventManager
          exams={(exams ?? []).map((e) => ({ id: e.id, name: e.name, slug: e.slug }))}
          topics={(topics ?? []).map((t) => ({ id: t.id, subject_id: t.subject_id, name: t.name, slug: t.slug }))}
          subjects={(subjects ?? []).map((s) => ({ id: s.id, name: s.name, slug: s.slug }))}
          examSubjectMap={examSubjectMap}
        />
      </div>
    </div>
  )
}
