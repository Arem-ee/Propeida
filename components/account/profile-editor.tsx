'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AvatarPicker } from '@/components/avatar-picker'
import { Avatar } from '@/components/avatar'
import { updateAvatarIndex } from '@/lib/actions/profile'

export default function ProfileEditor({
  username,
  email,
  avatarIndex,
}: {
  username: string
  email: string
  avatarIndex: number | null
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const pick = async (index: number) => {
    setSaving(true)
    setSaved(false)
    try {
      await updateAvatarIndex(index)
      setSaved(true)
      router.refresh()
    } catch {
      // picker keeps local selection; failure is silent but harmless
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <div className="flex items-center gap-4">
          <Avatar username={username} avatarIndex={avatarIndex} size={56} />
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-medium text-black truncate">{username}</h2>
            <p className="truncate text-sm font-semibold text-ink-soft">{email}</p>
          </div>
        </div>
        <Link
          href="/auth/set-username"
          className="mt-4 inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-extrabold text-ink-soft min-h-[48px]"
        >
          Change username
        </Link>
      </div>

      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-medium text-black">Avatar</h3>
          {saving ? (
            <span className="text-xs font-bold text-gray-400">Saving...</span>
          ) : saved ? (
            <span className="text-xs font-extrabold text-emerald-600">Saved</span>
          ) : null}
        </div>
        <AvatarPicker currentIndex={avatarIndex ?? 0} onSelect={(i) => void pick(i)} />
      </div>
    </div>
  )
}
