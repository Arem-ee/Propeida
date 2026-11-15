import { createAdminClient } from '@/lib/supabase/admin'
import CyclesManager from '../schools/cycles-manager'
import PageHeader from '@/components/admin/page-header'

export const metadata = { title: 'Exam cycles' }
export const dynamic = 'force-dynamic'

export default async function CyclesPage() {
  const supabase = createAdminClient()
  const { data: exams } = await supabase.from('exams').select('id, name, slug').order('name')

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Exam cycles"
        description="Dates power countdowns and exam-anchored review. Only verified rows render — unverified stays quiet, never guessed"
      />
      <div className="max-w-2xl">
        <CyclesManager exams={(exams ?? []).map((e) => ({ id: e.id, name: e.name, slug: e.slug }))} />
      </div>
    </div>
  )
}
