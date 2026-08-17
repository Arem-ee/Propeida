import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { CAREER_CATEGORIES, UNIVERSITY_TYPES } from '@/lib/explore/constants'
import { slugify, splitList } from '@/lib/explore/slug'

const ENTITY_TYPES = ['careers', 'courses', 'universities', 'career_courses', 'course_universities'] as const
type EntityType = (typeof ENTITY_TYPES)[number]

function parsePublished(value: unknown): boolean {
  return ['true', 'yes', '1', 'y'].includes(String(value ?? '').trim().toLowerCase())
}

function toNullableText(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text || null
}

function resolveCareerRow(row: Record<string, unknown>) {
  const name = toNullableText(row.name)
  if (!name) return null
  const category = toNullableText(row.category)
  return {
    slug: toNullableText(row.slug) ?? slugify(name),
    name,
    category: category && CAREER_CATEGORIES.includes(category as (typeof CAREER_CATEGORIES)[number]) ? category : '',
    short_description: toNullableText(row.short_description),
    description: toNullableText(row.description),
    what_you_do: splitList(String(row.what_you_do ?? '')),
    work_environments: splitList(String(row.work_environments ?? '')),
    industries: splitList(String(row.industries ?? '')),
    common_job_titles: splitList(String(row.common_job_titles ?? '')),
    skills: splitList(String(row.skills ?? '')),
    misconceptions: splitList(String(row.misconceptions ?? '')),
    career_progression: toNullableText(row.career_progression),
    related_careers: splitList(String(row.related_careers ?? '')),
    published: parsePublished(row.published),
  }
}

function resolveCourseRow(row: Record<string, unknown>) {
  const name = toNullableText(row.name)
  if (!name) return null
  return {
    slug: toNullableText(row.slug) ?? slugify(name),
    name,
    description: toNullableText(row.description),
    published: parsePublished(row.published),
  }
}

function resolveUniversityRow(row: Record<string, unknown>) {
  const name = toNullableText(row.name)
  if (!name) return null
  const type = toNullableText(row.type)
  return {
    slug: toNullableText(row.slug) ?? slugify(name),
    name,
    location: toNullableText(row.location),
    type: type && UNIVERSITY_TYPES.includes(type as (typeof UNIVERSITY_TYPES)[number]) ? type : null,
    description: toNullableText(row.description),
    website: toNullableText(row.website),
    published: parsePublished(row.published),
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const type = String(body.type ?? '') as EntityType
    if (!ENTITY_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Unknown import type' }, { status: 400 })
    }
    const rows: Record<string, unknown>[] = Array.isArray(body.rows) ? body.rows : []
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows to import' }, { status: 400 })
    }
    if (rows.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 })
    }
    const dryRun = Boolean(body.dryRun)

    const report = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; reason: string }[],
    }

    if (type === 'careers') {
      const mapped = rows.map(resolveCareerRow)
      if (dryRun) return NextResponse.json({ report })
      for (let i = 0; i < mapped.length; i++) {
        const row = mapped[i]
        if (!row) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: 'Missing name' })
          continue
        }
        const { error } = await supabase
          .from('careers')
          .upsert(row, { onConflict: 'slug' })
          .select('id')
        if (error) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: error.message })
        } else {
          report.imported++
        }
      }
    } else if (type === 'courses') {
      const mapped = rows.map(resolveCourseRow)
      if (dryRun) return NextResponse.json({ report })
      for (let i = 0; i < mapped.length; i++) {
        const row = mapped[i]
        if (!row) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: 'Missing name' })
          continue
        }
        const { error } = await supabase
          .from('courses')
          .upsert(row, { onConflict: 'slug' })
          .select('id')
        if (error) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: error.message })
        } else {
          report.imported++
        }
      }
    } else if (type === 'universities') {
      const mapped = rows.map(resolveUniversityRow)
      if (dryRun) return NextResponse.json({ report })
      for (let i = 0; i < mapped.length; i++) {
        const row = mapped[i]
        if (!row) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: 'Missing name' })
          continue
        }
        const { error } = await supabase
          .from('schools')
          .upsert(row, { onConflict: 'slug' })
          .select('id')
        if (error) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: error.message })
        } else {
          report.imported++
        }
      }
    } else {
      const isCareerLink = type === 'career_courses'
      const fromTable = isCareerLink ? 'careers' : 'courses'
      const toTable = isCareerLink ? 'courses' : 'schools'
      const fromSlug = isCareerLink ? 'career_slug' : 'course_slug'
      const toSlug = isCareerLink ? 'course_slug' : 'university_slug'
      const tableName = isCareerLink ? 'career_courses' : 'course_universities'

      const slugs = new Set<string>()
      rows.forEach((row) => {
        const from = toNullableText(row[fromSlug])
        const to = toNullableText(row[toSlug])
        if (from) slugs.add(from)
        if (to) slugs.add(to)
      })
      const [fromRes, toRes] = await Promise.all([
        supabase.from(fromTable).select('id, slug').in('slug', [...slugs]),
        supabase.from(toTable).select('id, slug').in('slug', [...slugs]),
      ])
      const fromById = new Map((fromRes.data ?? []).map((item) => [item.slug, item.id]))
      const toById = new Map((toRes.data ?? []).map((item) => [item.slug, item.id]))

      if (dryRun) return NextResponse.json({ report })
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (!row) continue
        const from = toNullableText(row[fromSlug])
        const to = toNullableText(row[toSlug])
        const fromId = from ? fromById.get(from) : undefined
        const toId = to ? toById.get(to) : undefined
        if (!from || !to) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: 'Missing slug pair' })
          continue
        }
        if (!fromId || !toId) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: `Unknown ${toSlug}: ${to}` })
          continue
        }
        const link = isCareerLink
          ? { career_id: fromId, course_id: toId }
          : { course_id: fromId, university_id: toId }
        const { error } = await supabase
          .from(tableName as 'career_courses')
          .upsert(link as { career_id: string; course_id: string }, {
            onConflict: isCareerLink ? 'career_id,course_id' : 'course_id,university_id',
            ignoreDuplicates: true,
          })
        if (error) {
          report.skipped++
          report.errors.push({ row: i + 1, reason: error.message })
        } else {
          report.imported++
        }
      }
    }

    return NextResponse.json({ report })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}