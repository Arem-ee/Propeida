import { ArrowUpRight, Briefcase, GraduationCap, Hammer } from 'lucide-react'
import { SceneCard } from '@/components/explore/opportunity/visual-card'
import type { CareerDetail } from '@/lib/explore/types'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import type { AccentKey } from '@/lib/explore/visual-scenes'
import type { CareerVisuals } from '@/lib/explore/visuals'
import { ACCENT_STYLES } from '@/lib/explore/visual-scenes'

interface EditorialProps {
  career: CareerDetail
  opportunity: CareerOpportunity
  accent: AccentKey
  visuals: CareerVisuals
}

const REALITY_ROWS = [
  {
    icon: GraduationCap,
    label: 'The degree',
    note: 'Opens the door at screening — most Nigerian employers list a degree as a minimum requirement.',
  },
  {
    icon: Hammer,
    label: 'The skills',
    note: 'What gets you through interviews: demonstrable, interviewable skill rather than titles alone.',
  },
  {
    icon: Briefcase,
    label: 'The experience',
    note: 'Internships, SIWES, projects and early roles are what employers actually weigh when choosing.',
  },
]

export function RealityCard({ opportunity, accent }: EditorialProps) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-slate-900 p-6 sm:p-10">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].icon}`}>
            How hiring actually works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Degree. Skills. Experience.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
            {opportunity.employability.intro}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {REALITY_ROWS.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <row.icon className={`h-6 w-6 ${ACCENT_STYLES[accent].icon} rounded-lg p-1`} aria-hidden />
                <h3 className="mt-3 text-sm font-bold text-white">{row.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{row.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm font-bold text-white">
            <span className="text-slate-400">Degree</span>
            <span className={ACCENT_STYLES[accent].deep}>+</span>
            <span className="text-slate-400">Skills</span>
            <span className={ACCENT_STYLES[accent].deep}>+</span>
            <span className="text-slate-400">Experience</span>
            <span className={ACCENT_STYLES[accent].deep}>=</span>
            <span>A stronger candidate</span>
          </p>
        </div>
      </div>
    </section>
  )
}

const PROJECT_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner builds',
  intermediate: 'Intermediate builds',
  advanced: 'Advanced builds',
}

export function ProjectGallery({ opportunity, accent, visuals }: EditorialProps) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_STYLES[accent].deep}`}>
          What could you build?
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Projects that speak louder than CVs
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          Nigerian employers increasingly ask what you have made. These build levels mirror the learning journey —
          start small, then climb. Beginner ideas need nothing more than a laptop and determination.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {opportunity.learningPath.projects.map((project) => (
            <SceneCard
              key={project.level}
              accent={accent}
              visual={visuals.projects[project.level]}
              className="flex flex-col"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {PROJECT_LEVEL_LABELS[project.level] ?? project.level}
              </p>
              <ul className="mt-3 flex-1 space-y-2">
                {project.ideas.map((idea) => (
                  <li key={idea} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                    <ArrowUpRight className={`mt-0.5 h-4 w-4 shrink-0 ${ACCENT_STYLES[accent].deep}`} aria-hidden />
                    {idea}
                  </li>
                ))}
              </ul>
            </SceneCard>
          ))}
        </div>
      </div>
    </section>
  )
}