import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/account/profile-editor'
import OnboardingPreferencesEditor from '@/components/account/onboarding-preferences-editor'

export const metadata = { title: 'Profile' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, subject_combinations, intended_course, exam_target, heard_about, study_time, target_score, accessibility_needs, subjects_pending')
    .eq('id', user.id)
    .single()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
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
      />
      <OnboardingPreferencesEditor
        examTarget={profile?.exam_target ?? null}
        subjectCombinations={(profile?.subject_combinations as string[]) ?? []}
        intendedCourse={profile?.intended_course ?? null}
        heardAbout={profile?.heard_about ?? null}
        studyTime={profile?.study_time ?? null}
        targetScore={profile?.target_score ?? null}
        accessibilityNeeds={profile?.accessibility_needs as { large_font?: boolean; high_contrast?: boolean; sound_off?: boolean } ?? { large_font: false, high_contrast: false, sound_off: false }}
        subjectsPending={profile?.subjects_pending ?? false}
        subjects={(subjects ?? []) as { id: string; name: string; slug: string }[]}
      />
    </div>
  )
}
