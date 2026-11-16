import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, School } from 'lucide-react'
import PageHeader from '@/components/admin/page-header'
import { AdminTable, THead, Th, TBody, Td, TableEmpty } from '@/components/admin/table'
import { requireAdmin } from '@/lib/admin'

export const metadata = { title: 'Exams' }

export default async function AdminExamsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, slug, subject_selection_mode, school_id, schools(name)')
    .order('name')

  const rows = exams ?? []
  const national = rows.filter((e) => !e.school_id).length
  const schoolBound = rows.length - national

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Exams"
        description="Every exam path Propeida serves. National exams and school-specific screenings live side by side"
        actions={
          <Link
            href="/admin/exams/new"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Exam
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2 text-xs font-bold text-ink-soft">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800">{national} national</span>
        <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-purple-800">{schoolBound} school-specific</span>
      </div>

      <AdminTable>
        <THead>
          <tr>
            <Th>Name</Th>
            <Th>Slug</Th>
            <Th>Type</Th>
            <Th>Subjects</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((exam) => {
            const school = Array.isArray(exam.schools) ? exam.schools[0] : exam.schools
            return (
              <tr key={exam.id} className="hover:bg-blue-50/30">
                <Td className="font-bold text-black">{exam.name}</Td>
                <Td className="font-mono text-xs">{exam.slug}</Td>
                <Td>
                  {exam.school_id ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                      <School className="h-3 w-3" aria-hidden />
                      {(school as { name?: string })?.name ?? 'School'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                      National
                    </span>
                  )}
                </Td>
                <Td className="capitalize">{String(exam.subject_selection_mode ?? '').replace('_', ' ')}</Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/exams/${exam.id}/edit`}
                    className="inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <TableEmpty colSpan={5}>No exams defined yet, so create the first one</TableEmpty>
          )}
        </TBody>
      </AdminTable>
    </div>
  )
}
