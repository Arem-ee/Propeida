import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ScreeningsManager from './screenings-manager'
import PageHeader from '@/components/admin/page-header'
import { requireAdmin } from '@/lib/admin'

export const metadata = { title: 'Manage school' }
export const dynamic = 'force-dynamic'

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: school }, { data: screenings }] = await Promise.all([
    supabase.from('schools').select('id, name, slug').eq('id', id).single(),
    supabase
      .from('school_screenings')
      .select('id, year, mode, jamb_weight, screening_weight, olevel_weight, cutoff, sittings_allowed, source')
      .eq('school_id', id)
      .order('year', { ascending: false }),
  ])
  if (!school) notFound()

  return (
    <div>
      <PageHeader
        eyebrow="Setup · Schools"
        title={school.name}
        description="Screening facts by year. Blank means unknown — the student app renders dashes, never guesses"
      />
      <div className="max-w-2xl">
        <ScreeningsManager schoolId={school.id} initial={screenings ?? []} />
      </div>
    </div>
  )
}
