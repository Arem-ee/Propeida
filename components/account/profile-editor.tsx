'use client'

import Link from 'next/link'
import { Avatar } from '@/components/avatar'

export default function ProfileEditor({
  username,
  email,
}: {
  username: string
  email: string
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-6 shadow-[0_2px_12px_-6px_rgba(16,28,51,0.12)]">
        <div className="flex items-center gap-4">
          <Avatar username={username} size={56} />
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
    </div>
  )
}
