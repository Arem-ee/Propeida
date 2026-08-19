'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { VisualBox } from '@/components/explore/visuals/visual-box'
import type { CareerOpportunity, LearningStage } from '@/lib/explore/opportunity'
import { STAGE_LABELS } from '@/lib/explore/opportunity'
import type { AccentKey } from '@/lib/explore/visual-scenes'
import type { CareerVisuals } from '@/lib/explore/visuals'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

interface LearningJourneyProps {
  opportunity: CareerOpportunity
  accent: AccentKey
  visuals: CareerVisuals
}

export function LearningJourney({ opportunity, accent, visuals }: LearningJourneyProps) {
  const stages = opportunity.learningPath.stages
  const [open, setOpen] = useState<LearningStage['stage'] | ''>(stages[0]?.stage ?? 'foundation')

  return (
    <div>
      {opportunity.learningPath.startHere.length > 0 ? (
        <div className={`rounded-2xl bg-white p-5 shadow-sm ring-2 ${ACCENT_STYLES[accent].ring} sm:p-6`}>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
            Your first step
          </p>
          <h3 className="mt-2 font-serif text-xl font-semibold text-slate-900">Start here</h3>
          <ul className="mt-3 space-y-2">
            {opportunity.learningPath.startHere.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${ACCENT_STYLES[accent].deep}`} aria-hidden />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ol className="mt-6 space-y-3">
        {stages.map((stage) => {
          const expanded = open === stage.stage
          return (
            <li
              key={stage.stage}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
                expanded ? 'border-slate-300' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? '' : stage.stage)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 px-4 py-3 text-left sm:px-5"
              >
                <span className={`relative w-20 shrink-0 overflow-hidden rounded-xl ${ACCENT_STYLES[accent].soft}`}>
                  <VisualBox
                    visual={visuals.stages[stage.stage] ?? visuals.hero}
                    className="aspect-[4/3] w-full"
                    decorative
                  />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                    {STAGE_LABELS[stage.stage]}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-slate-900">{stage.title}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {expanded ? (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
                  <p className="text-sm leading-relaxed text-slate-600">{stage.whatToDo}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {stage.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${ACCENT_STYLES[accent].chip}`}
                      >
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}