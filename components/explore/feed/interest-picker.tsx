'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { EXPLORE_INTEREST_LABELS } from '@/lib/explore/feed-types'
import { track } from '@/lib/analytics'

interface InterestPickerProps {
  onDone: (interests: string[]) => void
}

export default function InterestPicker({ onDone }: InterestPickerProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    )
  }

  const done = () => {
    void track('explore-interests-selected', { count: selected.length })
    onDone(selected)
  }

  const skip = () => {
    void track('explore-interests-skipped')
    onDone([])
  }

  return (
    <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5" aria-label="Choose your interests">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
        <Sparkles className="h-4 w-4 text-blue-600" />
        What sounds interesting?
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Pick a few — we&apos;ll fill your feed with careers that fit. You can skip this.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {EXPLORE_INTEREST_LABELS.map((label) => {
          const active = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              aria-pressed={active}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={skip}
          className="min-h-[44px] px-2 text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={done}
          disabled={selected.length === 0}
          className="min-h-[44px] rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Show me things
        </button>
      </div>
    </section>
  )
}