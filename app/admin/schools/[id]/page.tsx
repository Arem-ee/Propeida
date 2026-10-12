import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ScreeningsManager from './screenings-manager'

export const metadata = { title: 'Manage school' }

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      <Link href="/admin/schools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Schools
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{school.name}</h1>
      <p className="text-sm text-gray-500 mb-8">
        Screening facts by year. Blank means unknown — the student app renders dashes, never guesses.
      </p>
      <div className="max-w-2xl">
        <ScreeningsManager schoolId={school.id} initial={screenings ?? []} />
      </div>
    </div>
  )
}
