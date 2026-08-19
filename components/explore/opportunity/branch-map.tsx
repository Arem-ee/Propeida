'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import { sectorNames } from '@/lib/explore/opportunity'
import type { AccentKey } from '@/lib/explore/visual-scenes'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

interface BranchMapProps {
  opportunity: CareerOpportunity
  accent: AccentKey
}

export function BranchMap({ opportunity, accent }: BranchMapProps) {
  const [active, setActive] = useState<string>(opportunity.learningPath.specializations[0]?.name ?? '')
  const specializations = opportunity.learningPath.specializations

  return (
    <div className="space-y-3">
      {specializations.map((spec) => {
        const expanded = active === spec.name
        return (
          <div
            key={spec.name}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
              expanded ? 'border-slate-300' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setActive(expanded ? '' : spec.name)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    expanded ? `${ACCENT_STYLES[accent].solid} text-white` : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {specializations.indexOf(spec) + 1}
                </span>
                <span className="text-sm font-bold text-slate-900">{spec.name}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {expanded ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                <ol className="flex flex-wrap items-center gap-2">
                  {spec.chain.map((step, index) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {step}
                      </span>
                      {index < spec.chain.length - 1 ? (
                        <ChevronRight className={`h-3.5 w-3.5 ${ACCENT_STYLES[accent].deep}`} aria-hidden />
                      ) : null}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Typical roles</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {spec.roles.map((role) => (
                        <span key={role} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Sectors</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {sectorNames(spec.sectors).map((name) => (
                        <span key={name} className={`rounded-full px-2.5 py-1 text-xs font-bold ${ACCENT_STYLES[accent].chip}`}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}