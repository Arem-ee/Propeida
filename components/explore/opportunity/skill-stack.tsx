import { ArrowRight, BookOpen, GraduationCap, Users, Wrench, Zap } from 'lucide-react'
import type {
  CareerOpportunity,
  SkillGroup,
  SkillImportance,
} from '@/lib/explore/opportunity'
import {
  SKILL_GROUP_LABELS,
  SKILL_IMPORTANCE_LABELS,
  STAGE_LABELS,
} from '@/lib/explore/opportunity'

const GROUP_ICONS: Record<SkillGroup, typeof BookOpen> = {
  core: BookOpen,
  practical: Wrench,
  modern: Zap,
  professional: Users,
}

const IMPORTANCE_STYLES: Record<SkillImportance, string> = {
  essential: 'bg-blue-50 text-blue-700',
  valuable: 'bg-emerald-50 text-emerald-700',
  specialization: 'bg-violet-50 text-violet-700',
  bonus: 'bg-amber-50 text-amber-700',
}

const GROUP_ORDER: SkillGroup[] = ['core', 'practical', 'modern', 'professional']

export function SkillStackSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const { employability } = opportunity
  if (employability.skills.length === 0) return null
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-gray-900">
          What makes you employable?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{employability.intro}</p>
      </div>
      <div className="space-y-6">
        {GROUP_ORDER.map((group) => {
          const entries = employability.skills.filter((s) => s.group === group)
          if (entries.length === 0) return null
          const Icon = GROUP_ICONS[group]
          return (
            <div key={group}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gray-700">
                <Icon className="h-4 w-4 text-blue-600" />
                {SKILL_GROUP_LABELS[group]}
              </h3>
              <ul className="space-y-2.5">
                {entries.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{skill.name}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${IMPORTANCE_STYLES[skill.importance]}`}
                      >
                        {SKILL_IMPORTANCE_LABELS[skill.importance]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{skill.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function LearningPathSection({ opportunity }: { opportunity: CareerOpportunity }) {
  const { learningPath } = opportunity
  if (learningPath.stages.length === 0) return null
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Your learning path</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{learningPath.intro}</p>
      </div>

      <ol className="flex flex-wrap items-stretch gap-2">
        {learningPath.stages.map((stage, i) => {
          const stageKey = stage.stage
          return (
            <li key={stage.stage} className="flex flex-1 items-stretch gap-2">
              <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-blue-600">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    {i + 1}
                  </span>
                  {STAGE_LABELS[stageKey]}
                </p>
                <h3 className="mt-2 text-sm font-bold text-gray-900">{stage.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{stage.whatToDo}</p>
                <p className="mt-2 text-xs font-medium text-gray-500">{stage.skills.join(' - ')}</p>
              </div>
              {i < learningPath.stages.length - 1 && (
                <span className="flex items-center text-gray-300" aria-hidden="true">
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {learningPath.specializations.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-gray-700">
            Specialisation paths
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {learningPath.specializations.map((path) => (
              <div key={path.name} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="text-sm font-bold text-gray-900">{path.name}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                  {path.chain.map((step, i) => (
                    <span key={step} className="inline-flex items-center gap-1">
                      <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-gray-700 ring-1 ring-gray-200">
                        {step}
                      </span>
                      {i < path.chain.length - 1 && <ArrowRight className="h-3 w-3" />}
                    </span>
                  ))}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-semibold text-gray-600">Typical roles: </span>
                  {path.roles.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {learningPath.startHere.length > 0 && (
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-blue-900">
            <GraduationCap className="h-4 w-4" />
            If you're starting from zero
          </h3>
          <ul className="space-y-1.5">
            {learningPath.startHere.map((tip) => (
              <li key={tip} className="flex gap-2 text-sm leading-relaxed text-blue-900/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {learningPath.projects.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-gray-700">
            Projects to prove you can do it
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {learningPath.projects.map((project) => (
              <div key={project.level} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="text-sm font-bold capitalize text-gray-900">{project.level}</p>
                <ul className="mt-2 space-y-1.5">
                  {project.ideas.map((idea) => (
                    <li key={idea} className="text-sm leading-relaxed text-gray-600">
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}