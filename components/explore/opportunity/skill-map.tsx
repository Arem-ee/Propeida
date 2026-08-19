'use client'

import { useState } from 'react'
import type { CareerOpportunity, SkillGroup, SkillImportance } from '@/lib/explore/opportunity'
import { SKILL_GROUP_LABELS, SKILL_IMPORTANCE_LABELS } from '@/lib/explore/opportunity'
import type { AccentKey } from '@/lib/explore/visual-scenes'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

const GROUP_ORDER: SkillGroup[] = ['core', 'practical', 'modern', 'professional']

function importanceStyle(importance: SkillImportance, accent: AccentKey): string {
  if (importance === 'essential') return 'bg-slate-900 text-white'
  if (importance === 'valuable') return ACCENT_STYLES[accent].chip
  if (importance === 'specialization') return 'bg-white text-slate-600 ring-1 ring-slate-200'
  return 'bg-slate-100 text-slate-500'
}

interface SkillMapProps {
  opportunity: CareerOpportunity
  accent: AccentKey
}

export function SkillMap({ opportunity, accent }: SkillMapProps) {
  const [group, setGroup] = useState<SkillGroup>('core')
  const skills = opportunity.employability.skills.filter((skill) => skill.group === group)

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Skill groups">
        {GROUP_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={group === key}
            onClick={() => setGroup(key)}
            className={`min-h-[40px] rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              group === key
                ? `${ACCENT_STYLES[accent].solid} text-white`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {SKILL_GROUP_LABELS[key]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Reading order:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" aria-hidden />
          {SKILL_IMPORTANCE_LABELS.essential}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${ACCENT_STYLES[accent].chip}`} aria-hidden />
          {SKILL_IMPORTANCE_LABELS.valuable}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white ring-1 ring-slate-300" aria-hidden />
          {SKILL_IMPORTANCE_LABELS.specialization}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" aria-hidden />
          {SKILL_IMPORTANCE_LABELS.bonus}
        </span>
        <span>— start with essentials; they are what employers screen for first.</span>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2" role="tabpanel">
        {skills.map((skill) => (
          <li
            key={skill.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{skill.name}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${importanceStyle(skill.importance, accent)}`}
              >
                {SKILL_IMPORTANCE_LABELS[skill.importance]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{skill.why}</p>
          </li>
        ))}
      </ul>
      {skills.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No skills listed for this group yet.</p>
      ) : null}
    </div>
  )
}