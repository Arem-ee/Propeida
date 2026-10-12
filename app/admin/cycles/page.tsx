import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import CyclesManager from '../schools/cycles-manager'

export const metadata = { title: 'Exam cycles' }

export default async function CyclesPage() {
  const supabase = createAdminClient()
  const { data: exams } = await supabase.from('exams').select('id, name, slug').order('name')

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Exam cycles</h1>
      <p className="text-sm text-gray-500 mb-8">
        Dates power countdowns and exam-anchored review. Only verified rows render — unverified stays quiet, never guessed.
      </p>
      <div className="max-w-2xl">
        <CyclesManager exams={(exams ?? []).map((e) => ({ id: e.id, name: e.name, slug: e.slug }))} />
      </div>
    </div>
  )
}
