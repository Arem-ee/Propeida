import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 min-h-[44px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800 text-white font-bold text-base">A</span>
              Admin
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/questions"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center"
              >
                Questions
              </Link>
              <Link
                href="/admin/exams"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center"
              >
                Exams
              </Link>
              <Link
                href="/admin/contact-submissions"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center"
              >
                Contact
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 min-h-[44px] flex items-center"
              >
                Back to Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
