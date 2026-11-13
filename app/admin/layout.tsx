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

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 min-h-[44px]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-800 text-white font-bold text-base">A</span>
              Admin
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              <Link
                href="/admin/questions"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Questions
              </Link>
              <Link
                href="/admin/exams"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Exams
              </Link>
              <Link
                href="/admin/codes"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Codes
              </Link>
              <Link
                href="/admin/lessons"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Lessons
              </Link>
              <Link
                href="/admin/schools"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Schools
              </Link>
              <Link
                href="/admin/cycles"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Cycles
              </Link>
              <Link
                href="/admin/contact-submissions"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Contact
              </Link>
              <Link
                href="/admin/analytics"
                className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center pressable"
              >
                Analytics
              </Link>
              <Link
                href="/home"
                className="rounded-xl px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 min-h-[44px] flex items-center pressable"
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

