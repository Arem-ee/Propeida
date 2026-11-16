import { createAdminClient } from '@/lib/supabase/admin'
import { Mail } from 'lucide-react'
import PageHeader from '@/components/admin/page-header'
import ContactInbox from '@/components/admin/contact-inbox'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Contact messages' }

export default async function AdminContactSubmissionsPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('id, email, full_name, phone, organization_type, student_count, requested_university, requested_course, message, created_at')
    .order('created_at', { ascending: false })

  const rows = submissions ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Audience"
        title="Contact messages"
        description="Enquiries from schools and institutions. Open one to read it fully and reply"
        actions={
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-ink-soft">
            {rows.length} total
          </span>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
            <Mail className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-ink-soft">No messages have come in yet</p>
        </div>
      ) : (
        <ContactInbox rows={rows as Parameters<typeof ContactInbox>[0]['rows']} />
      )}
    </div>
  )
}
