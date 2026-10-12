import { createAdminClient } from '@/lib/supabase/admin'
import NewCodeForm from './form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Misconception codes' }

export default async function CodesPage() {
  const supabase = createAdminClient()
  const [{ data: codes }, { data: subjects }] = await Promise.all([
    supabase
      .from('misconception_codes')
      .select('id, code, name, definition, example, subjects!inner(name)')
      .order('code'),
    supabase.from('subjects').select('id, name').order('name'),
  ])

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Misconception codes</h1>
      <p className="text-sm text-gray-500 mb-8">
        The controlled vocabulary. Questions map distractors to these codes — free text stopped here.
        {(codes ?? []).length} codes defined.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(codes ?? []).map((c) => {
                const subject = Array.isArray(c.subjects) ? c.subjects[0] : c.subjects
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-gray-900">{c.code}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{(subject as { name?: string })?.name ?? '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-700">{c.name}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          <NewCodeForm subjects={subjects ?? []} />
        </div>
      </div>
    </div>
  )
}
