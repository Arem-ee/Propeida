import fs from 'fs'
import path from 'path'
import type { CareerOpportunity } from '@/lib/explore/opportunity'
import type { AccentKey, ResolvedVisual, SceneKey } from '@/lib/explore/visual-scenes'
import {
  CAREER_ACCENTS,
  CAREER_SCENES,
  CATEGORY_ACCENTS,
  CATEGORY_SCENES,
  DEFAULT_ACCENT,
  DEFAULT_SCENE,
  PROJECT_SCENES,
  SECTOR_SCENES,
  STAGE_SCENES,
} from '@/lib/explore/visual-scenes'

function kebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function careerAssetDir(slug: string): string {
  return path.join(process.cwd(), 'public', 'images', 'careers', slug)
}

function assetExists(slug: string, fileName: string): boolean {
  try {
    return fs.existsSync(path.join(careerAssetDir(slug), fileName))
  } catch {
    return false
  }
}

function assetUrl(slug: string, fileName: string): string | null {
  return assetExists(slug, fileName) ? `/images/careers/${slug}/${fileName}` : null
}

export function careerAccent(
  slug: string,
  category: string | null | undefined,
): AccentKey {
  return CAREER_ACCENTS[slug] ?? CATEGORY_ACCENTS[category ?? ''] ?? DEFAULT_ACCENT
}

export interface CareerVisuals {
  accent: AccentKey
  hero: ResolvedVisual
  sectors: Record<string, ResolvedVisual>
  specializations: Record<string, ResolvedVisual>
  projects: Record<string, ResolvedVisual>
  stages: Record<string, ResolvedVisual>
}

export function resolveCareerVisual(
  slug: string,
  sectors: string[],
  category: string | null | undefined,
  role: 'hero' | 'sector' | 'specialization' | 'project' | 'stage',
  key: string,
  title?: string,
): ResolvedVisual {
  const name = title ?? slug
  const careerScene: SceneKey | undefined = CAREER_SCENES[slug]
  const categoryScene: SceneKey | undefined = category ? CATEGORY_SCENES[category] : undefined
  const fallback: SceneKey = careerScene ?? categoryScene ?? DEFAULT_SCENE

  if (role === 'hero') {
    const src = assetUrl(slug, 'hero.webp')
    if (src) return { kind: 'asset', src, alt: `Illustration of a day in the life of a ${name}` }
    return { kind: 'scene', scene: fallback, alt: `Illustration for ${name}` }
  }

  if (role === 'sector') {
    const src = assetUrl(slug, `sector-${key}.webp`)
    if (src) return { kind: 'asset', src, alt: `Illustration for the ${key} sector within ${name}` }
    const scene = SECTOR_SCENES[key] ?? fallback
    return { kind: 'scene', scene, alt: `Illustration for the ${key} sector within ${name}` }
  }

  if (role === 'specialization') {
    const src = assetUrl(slug, `specialization-${kebabCase(key)}.webp`)
    if (src) return { kind: 'asset', src, alt: `Illustration for the ${key} path in ${name}` }
    const firstSector: string | undefined = sectors[0]
    const scene: SceneKey = (firstSector ? SECTOR_SCENES[firstSector] : undefined) ?? fallback
    return { kind: 'scene', scene, alt: `Illustration for the ${key} path in ${name}` }
  }

  if (role === 'project') {
    const src = assetUrl(slug, `project-${key}.webp`)
    if (src) return { kind: 'asset', src, alt: `Illustration for the ${key} project level in ${name}` }
    const scene = PROJECT_SCENES[key as keyof typeof PROJECT_SCENES] ?? fallback
    return { kind: 'scene', scene, alt: `Illustration for the ${key} project level in ${name}` }
  }

  const src = assetUrl(slug, `stage-${key}.webp`)
  if (src) return { kind: 'asset', src, alt: `Illustration for the ${key} stage in ${name}` }
  const scene = STAGE_SCENES[key as keyof typeof STAGE_SCENES] ?? fallback
  return { kind: 'scene', scene, alt: `Illustration for the ${key} stage in ${name}` }
}

export function getCareerVisuals(
  career: { slug: string; name: string },
  opportunity: CareerOpportunity | null,
  category: string | null | undefined,
  title?: string,
): CareerVisuals {
  const slug = career.slug
  const accent = careerAccent(slug, category)
  const hero = resolveCareerVisual(slug, [], category, 'hero', '', title)
  const sectors: Record<string, ResolvedVisual> = {}
  if (opportunity) {
    for (const sector of opportunity.sectors) {
      sectors[sector] = resolveCareerVisual(slug, opportunity.sectors, category, 'sector', sector, title)
    }
  }
  const specializations: Record<string, ResolvedVisual> = {}
  if (opportunity) {
    for (const spec of opportunity.learningPath.specializations) {
      specializations[spec.name] = resolveCareerVisual(slug, opportunity.sectors, category, 'specialization', spec.name, title)
    }
  }
  const projects: Record<string, ResolvedVisual> = {}
  if (opportunity) {
    for (const project of opportunity.learningPath.projects) {
      projects[project.level] = resolveCareerVisual(slug, opportunity.sectors, category, 'project', project.level, title)
    }
  }
  const stages: Record<string, ResolvedVisual> = {}
  if (opportunity) {
    for (const stage of opportunity.learningPath.stages) {
      stages[stage.stage] = resolveCareerVisual(slug, opportunity.sectors, category, 'stage', stage.stage, title)
    }
  }
  return { accent, hero, sectors, specializations, projects, stages }
}