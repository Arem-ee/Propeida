import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/account/profile-editor'

export const metadata = { title: 'Profile' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_index')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/progress"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-blue-700 min-h-[36px]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black">
          Profile
        </h1>
      </div>
      <ProfileEditor
        username={profile?.username ?? 'Student'}
        email={user.email ?? ''}
        avatarIndex={profile?.avatar_index ?? null}
      />
    </div>
  )
}
