import { createAdminClient } from '@/lib/supabase/admin'
import NewCodeForm from './form'
import PageHeader from '@/components/admin/page-header'
import { AdminTable, THead, Th, TBody, Td, TableEmpty } from '@/components/admin/table'
import { requireAdmin } from '@/lib/admin'

export const metadata = { title: 'Misconception codes' }
export const dynamic = 'force-dynamic'

export default async function CodesPage() {
  await requireAdmin()
  const supabase = createAdminClient()
  const [{ data: codes }, { data: subjects }] = await Promise.all([
    supabase
      .from('misconception_codes')
      .select('id, code, name, definition, example, subjects!inner(name)')
      .order('code'),
    supabase.from('subjects').select('id, name').order('name'),
  ])

  const rows = codes ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Misconception codes"
        description="The controlled vocabulary. Questions map distractors to these codes — free text stops here"
        actions={
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-ink-soft">
            {rows.length} codes defined
          </span>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <AdminTable>
          <THead>
            <tr>
              <Th>Code</Th>
              <Th>Subject</Th>
              <Th>Name</Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((c) => {
              const subject = Array.isArray(c.subjects) ? c.subjects[0] : c.subjects
              return (
                <tr key={c.id}>
                  <Td className="font-mono text-xs font-bold text-black">{c.code}</Td>
                  <Td className="text-xs">{(subject as { name?: string })?.name ?? '-'}</Td>
                  <Td className="text-xs">{c.name}</Td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <TableEmpty colSpan={3}>No codes yet — add the first one to start mapping distractors</TableEmpty>
            )}
          </TBody>
        </AdminTable>

        <NewCodeForm subjects={subjects ?? []} />
      </div>
    </div>
  )
}
