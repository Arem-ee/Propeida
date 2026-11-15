import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/sidebar'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: {
    default: 'Propeida Admin',
    template: '%s · Propeida Admin',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  // Live counts for the sidebar badges. head-only queries, no rows transferred.
  const admin = createAdminClient()
  const [{ count: reviewCount }, { count: contactCount }] = await Promise.all([
    admin.from('questions').select('id', { count: 'exact', head: true }).in('status', ['draft', 'in_review']),
    admin.from('contact_submissions').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <AdminSidebar
        reviewCount={reviewCount ?? 0}
        contactCount={contactCount ?? 0}
        email={user.email ?? null}
      />
      <div className="lg:pl-[272px]">
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  )
}
