'use client'

import { Landmark } from 'lucide-react'
import { INSTITUTIONS, type InstitutionId } from '@/lib/notes'

export default function InstitutionSelector({
  selected,
  onSelect,
}: {
  selected: InstitutionId
  onSelect: (institution: InstitutionId) => void
}) {
  return (
    <div className="mb-6">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <Landmark className="h-3.5 w-3.5" />
        Institution
      </p>
      <div className="flex flex-wrap gap-2">
        {INSTITUTIONS.map((institution) => {
          const active = institution.available && institution.id === selected
          return (
            <button
              key={institution.id}
              onClick={() => institution.available && onSelect(institution.id)}
              disabled={!institution.available}
              className={`rounded-xl px-4 py-2 text-sm font-bold min-h-[44px] transition-colors ${
                active
                  ? 'bg-blue-600 text-white cursor-pointer'
                  : 'bg-white text-gray-600 border border-gray-200 cursor-pointer'
              }`}
            >
              {institution.label}
            </button>
          )
        })}
        <span className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-400">
          More institutions coming soon
        </span>
      </div>
    </div>
  )
}
