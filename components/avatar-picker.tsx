'use client'

import { useState } from 'react'
import { getAllAvatars, getAvatar } from '@/lib/avatars'

export function AvatarPicker({
  currentIndex,
  onSelect,
}: {
  currentIndex: number
  onSelect: (index: number) => void
}) {
  const [selected, setSelected] = useState(currentIndex)
  const avatars = getAllAvatars()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16">{getAvatar(selected, 64)}</div>
        <div>
          <p className="text-sm font-bold text-gray-900">Current avatar</p>
          <p className="text-xs text-gray-400">Pick a new one below</p>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {avatars.map((av) => (
          <button
            key={av.id}
            onClick={() => {
              setSelected(av.id)
              onSelect(av.id)
            }}
            className={`rounded-xl border-2 p-2 transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
              selected === av.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            {av.render(32)}
          </button>
        ))}
      </div>
    </div>
  )
}
