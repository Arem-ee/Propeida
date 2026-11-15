import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import NewSchoolFormWrapper from './new-school-form-wrapper'
import PageHeader from '@/components/admin/page-header'
import { AdminTable, THead, Th, TBody, Td, TableEmpty } from '@/components/admin/table'

export const metadata = { title: 'Schools' }
export const dynamic = 'force-dynamic'

export default async function SchoolsPage() {
  const supabase = createAdminClient()
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, slug, school_screenings(year)')
    .order('name')

  const rows = schools ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Schools & screenings"
        description="Every screening fact lives under its school, year-tagged. Open a school to manage modes, weights, and cutoffs"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <AdminTable>
          <THead>
            <tr>
              <Th>School</Th>
              <Th>Screenings</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((school) => (
              <tr key={school.id} className="hover:bg-blue-50/30">
                <Td className="font-bold text-black">{school.name}</Td>
                <Td className="tabular-nums">{(school.school_screenings ?? []).length} year(s)</Td>
                <Td className="text-right">
                  <Link
                    href={`/admin/schools/${school.id}`}
                    className="inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Manage
                  </Link>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <TableEmpty colSpan={3}>No schools are here yet, so add the first one</TableEmpty>
            )}
          </TBody>
        </AdminTable>

        <NewSchoolFormWrapper />
      </div>
    </div>
  )
}
