import { getPublicClient } from './supabase'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  FeedItem,
  FeedItemType,
  FeedEntityType,
  ExploreInteraction,
} from './feed-types'
import { INTEREST_CATEGORIES } from './feed-types'
import {
  OPPORTUNITIES,
  demandLabel,
  firstSentence,
  sectorNames,
} from './opportunity'
import type { CareerOpportunity } from './opportunity'
import type { SceneKey } from './visual-scenes'
import { CAREER_SCENES, SECTOR_SCENES } from './visual-scenes'

const TYPE_META: Record<FeedItemType, { label: string }> = {
  fact: { label: 'Career fact' },
  discovery: { label: 'What it really looks like' },
  myth: { label: 'Myth or truth?' },
  pathway: { label: 'Pathway' },
  comparison: { label: 'Comparison' },
  interactive: { label: 'Which one fits you?' },
  adjacent: { label: 'You might like' },
  course: { label: 'Course' },
  university: { label: 'University' },
  trending: { label: 'Trending now' },
  personalized: { label: 'For you' },
  sectors: { label: 'Where it is needed' },
  demand: { label: 'Demand check' },
  reality: { label: 'The Nigerian reality' },
}

const MAX_BODY = 180
const DAY_MS = 24 * 60 * 60 * 1000

const ACTION_WEIGHTS: Record<ExploreInteraction['action'], number> = {
  view: 0.3,
  click: 0.8,
  save: 2.0,
  follow: 2.5,
  share: 1.2,
  dismiss: -3.0,
}

export interface CareerRow {
  id: string
  slug: string
  name: string
  category: string
  short_description: string | null
  what_you_do: string[]
  skills: string[]
  misconceptions: string[]
  career_progression: string | null
  related_careers: string[]
}

export interface CourseRow {
  id: string
  slug: string
  name: string
  description: string | null
}

export interface UniversityRow {
  id: string
  slug: string
  name: string
  location: string | null
  type: string | null
  description: string | null
}

export interface Catalog {
  careers: CareerRow[]
  courses: CourseRow[]
  universities: UniversityRow[]
  careerCourses: { career_id: string; course_id: string }[]
  courseUniversities: { course_id: string; university_id: string }[]
  careersById: Map<string, CareerRow>
  coursesById: Map<string, CourseRow>
  universitiesById: Map<string, UniversityRow>
}

const CATALOG_LIMIT = 300

async function fetchCatalog(): Promise<Catalog> {
  const supabase = getPublicClient()
  const [careersRes, coursesRes, schoolsRes, ccRes, cuRes] = await Promise.all([
    supabase
      .from('careers')
      .select(
        'id, slug, name, category, short_description, what_you_do, skills, misconceptions, career_progression, related_careers'
      )
      .eq('published', true)
      .limit(CATALOG_LIMIT),
    supabase
      .from('courses')
      .select('id, slug, name, description')
      .eq('published', true)
      .limit(CATALOG_LIMIT),
    supabase
      .from('schools')
      .select('id, slug, name, location, type, description')
      .eq('published', true)
      .limit(CATALOG_LIMIT),
    supabase.from('career_courses').select('career_id, course_id').limit(5000),
    supabase.from('course_universities').select('course_id, university_id').limit(5000),
  ])

  const careers = (careersRes.data ?? []) as CareerRow[]
  const courses = (coursesRes.data ?? []) as CourseRow[]
  const universities = (schoolsRes.data ?? []) as UniversityRow[]

  return {
    careers,
    courses,
    universities,
    careerCourses: (ccRes.data ?? []) as { career_id: string; course_id: string }[],
    courseUniversities: (cuRes.data ?? []) as { course_id: string; university_id: string }[],
    careersById: new Map(careers.map((c) => [c.id, c])),
    coursesById: new Map(courses.map((c) => [c.id, c])),
    universitiesById: new Map(universities.map((u) => [u.id, u])),
  }
}

function clampBody(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ')
  if (t.length <= MAX_BODY) return t
  return t.slice(0, MAX_BODY - 1).trimEnd() + '…'
}

const careerHref = (slug: string) => `/explore/careers/${slug}`
const courseHref = (slug: string) => `/explore/courses/${slug}`
const universityHref = (slug: string) => `/explore/universities/${slug}`

function makeItem(
  id: string,
  type: FeedItemType,
  headline: string,
  body: string,
  ctaLabel: string,
  href: string,
  entityType: FeedEntityType | null,
  entityId: string | null,
  category: string | null,
  scene?: SceneKey
): FeedItem {
  const meta = TYPE_META[type]
  return { id, type, label: meta.label, headline, body, ctaLabel, href, entityType, entityId, category, scene, score: 0 }
}

function pluralCareerName(name: string): string {
  if (name.toLowerCase().endsWith('s')) return name
  return `${name}s`
}

function careerScene(slug: string): SceneKey | undefined {
  return CAREER_SCENES[slug]
}

function sectorsCard(c: CareerRow, opp: CareerOpportunity): FeedItem | null {
  const names = sectorNames(opp.sectors).slice(0, 4)
  if (names.length === 0) return null
  return makeItem(
    `sectors:${c.id}`, 'sectors',
    `Where are ${pluralCareerName(c.name)} actually needed in Nigeria?`,
    clampBody(`${names.join(', ')} and more — ${c.name} skills spread across more sectors than most students expect.`),
    `See the opportunities`,
    careerHref(c.slug), 'career', c.id, c.category,
    SECTOR_SCENES[opp.sectors[0] ?? '']
  )
}

function demandCard(c: CareerRow, opp: CareerOpportunity): FeedItem | null {
  return makeItem(
    `demand:${c.id}`, 'demand',
    `Is ${c.name} still worth studying in 2026?`,
    clampBody(`${demandLabel(opp.demand.level)}. ${firstSentence(opp.demand.summary)}`),
    `See the Nigerian outlook`,
    careerHref(c.slug), 'career', c.id, c.category,
    opp.outlook.drivers?.[0]?.scene
  )
}

function realityCard(c: CareerRow, opp: CareerOpportunity): FeedItem | null {
  if (!opp.nigerianReality) return null
  return makeItem(
    `reality:${c.id}`, 'reality',
    `The Nigerian reality of studying ${c.name}`,
    clampBody(firstSentence(opp.nigerianReality)),
    'See what actually makes candidates employable',
    careerHref(c.slug), 'career', c.id, c.category,
    opp.dayInCareer?.[3]?.scene ?? careerScene(c.slug)
  )
}

function factCard(c: CareerRow): FeedItem | null {
  if (!c.short_description) return null
  return makeItem(
    `fact:${c.id}`, 'fact',
    `${c.name}: more than a job title`,
    clampBody(c.short_description),
    `Explore ${c.name}`,
    careerHref(c.slug), 'career', c.id, c.category,
    careerScene(c.slug)
  )
}

function discoveryCard(c: CareerRow): FeedItem | null {
  if (c.what_you_do.length === 0) return null
  const first = c.what_you_do[0] ?? ''
  const second = c.what_you_do[1]
  return makeItem(
    `discovery:${c.id}`, 'discovery',
    `What does a ${c.name} actually do?`,
    clampBody(second ? `${first}. ${second}.` : `${first}.`),
    `See what the work looks like`,
    careerHref(c.slug), 'career', c.id, c.category,
    careerScene(c.slug)
  )
}

function mythCard(c: CareerRow): FeedItem | null {
  const myth = c.misconceptions[0]
  if (!myth) return null
  const skill = c.skills[0] ?? 'real skills'
  return makeItem(
    `myth:${c.id}`, 'myth',
    `Myth: ${myth}`,
    clampBody(`Most people assume this. The reality: ${c.name} leans on ${skill} — and the door is wider than it looks.`),
    `See the real picture`,
    careerHref(c.slug), 'career', c.id, c.category,
    careerScene(c.slug)
  )
}

function pathwayCard(c: CareerRow): FeedItem | null {
  if (!c.career_progression) return null
  return makeItem(
    `pathway:${c.id}`, 'pathway',
    `From SS3 to ${c.name}`,
    clampBody(c.career_progression),
    `Map the journey`,
    careerHref(c.slug), 'career', c.id, c.category,
    careerScene(c.slug)
  )
}

function comparisonCard(a: CareerRow, b: CareerRow): FeedItem | null {
  const aDo = a.what_you_do[0] ?? 'working in their field'
  const bDo = b.what_you_do[0] ?? 'working in their field'
  return makeItem(
    `comparison:${a.id}:${b.id}`, 'comparison',
    `${a.name} vs ${b.name}: what's actually different?`,
    clampBody(`Both sit in ${a.category}. ${a.name} centres on ${aDo.toLowerCase()}. ${b.name} centres on ${bDo.toLowerCase()}.`),
    `Explore ${a.name}`,
    careerHref(a.slug), 'career', a.id, a.category,
    careerScene(a.slug)
  )
}

function interactiveCard(a: CareerRow, b: CareerRow, courseName: string): FeedItem | null {
  const skillA = a.skills[0] ?? 'practical skills'
  const skillB = b.skills[0] ?? 'practical skills'
  return makeItem(
    `interactive:${a.id}:${b.id}`, 'interactive',
    `Would you rather be a ${a.name} or a ${b.name}?`,
    clampBody(`Both can start from ${courseName}. ${a.name} leans on ${skillA}; ${b.name} leans on ${skillB}. Which feels more like you?`),
    `Explore ${a.name}`,
    careerHref(a.slug), 'career', a.id, a.category,
    careerScene(a.slug)
  )
}

function adjacentCard(c: CareerRow, related: CareerRow): FeedItem | null {
  return makeItem(
    `adjacent:${c.id}:${related.id}`, 'adjacent',
    `If you like ${c.name}, you might like ${related.name}`,
    clampBody(related.short_description ?? 'A related path that builds on similar interests.'),
    `Explore ${related.name}`,
    careerHref(related.slug), 'career', related.id, related.category,
    careerScene(related.slug)
  )
}

function courseCard(co: CourseRow, careerNames: string[]): FeedItem | null {
  const firstName = careerNames[0]
  return makeItem(
    `course:${co.id}`, 'course',
    firstName ? `${co.name}: a route to ${firstName}` : `${co.name}: the course behind a career`,
    clampBody(co.description ?? 'A university course that opens specific career paths.'),
    `See the course`,
    courseHref(co.slug), 'course', co.id, null
  )
}

function universityCard(u: UniversityRow, courseNames: string[]): FeedItem | null {
  const firstName = courseNames[0]
  return makeItem(
    `university:${u.id}`, 'university',
    firstName ? `${u.name} offers ${firstName}` : `${u.name}: where the course meets the campus`,
    clampBody(u.description ?? `${[u.type, u.location].filter(Boolean).join(' · ') || 'A Nigerian university.'}`),
    `See the university`,
    universityHref(u.slug), 'university', u.id, null
  )
}

function trendingCard(c: CareerRow): FeedItem {
  return makeItem(
    `trending:${c.id}`, 'trending',
    `Students are exploring ${c.name}`,
    clampBody(c.short_description ?? c.what_you_do[0] ?? ''),
    `Explore ${c.name}`,
    careerHref(c.slug), 'career', c.id, c.category,
    careerScene(c.slug)
  )
}

function personalizedCard(seed: CareerRow, rec: CareerRow): FeedItem {
  return makeItem(
    `personalized:${rec.id}`, 'personalized',
    `Because you explored ${seed.name}, try ${rec.name}`,
    clampBody(rec.short_description ?? 'A path that sits close to what you already like.'),
    `Explore ${rec.name}`,
    careerHref(rec.slug), 'career', rec.id, rec.category,
    careerScene(rec.slug)
  )
}

async function fetchTrendingCareers(catalog: Catalog): Promise<FeedItem[]> {
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - 7 * DAY_MS).toISOString()
    const { data } = await admin
      .from('analytics_events')
      .select('event_data')
      .eq('event_name', 'explore-card-click')
      .gte('created_at', since)
      .limit(2000)
    const counts = new Map<string, number>()
    for (const row of data ?? []) {
      const eventData = (row as { event_data?: Record<string, unknown> }).event_data
      if (eventData?.entityType === 'career' && typeof eventData.entityId === 'string') {
        counts.set(eventData.entityId, (counts.get(eventData.entityId) ?? 0) + 1)
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    const cards: FeedItem[] = []
    for (const [id] of top) {
      const c = catalog.careersById.get(id)
      if (c) cards.push(trendingCard(c))
    }
    return cards
  } catch {
    return []
  }
}

function buildPersonalizedCard(
  catalog: Catalog,
  interactions: ExploreInteraction[]
): FeedItem | null {
  const boosts = new Map<string, number>()
  for (const it of interactions) {
    if (it.entityType !== 'career') continue
    const weight = ACTION_WEIGHTS[it.action] ?? 0
    if (weight <= 0) continue
    boosts.set(it.entityId, (boosts.get(it.entityId) ?? 0) + weight)
  }
  const topId = [...boosts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  if (!topId) return null
  const seed = catalog.careersById.get(topId)
  if (!seed) return null
  for (const slug of seed.related_careers) {
    const rec = catalog.careers.find((x) => x.slug === slug)
    if (rec && rec.id !== seed.id) return personalizedCard(seed, rec)
  }
  const sameCategory = catalog.careers.find((x) => x.category === seed.category && x.id !== seed.id)
  if (sameCategory) return personalizedCard(seed, sameCategory)
  return null
}

interface SignalEntry {
  boost: number
  seenRecently: boolean
}

function computeSignals(interactions: ExploreInteraction[]): Map<string, SignalEntry> {
  const byEntity = new Map<string, SignalEntry>()
  for (const it of interactions) {
    const days = (Date.now() - new Date(it.createdAt).getTime()) / DAY_MS
    const decay = Math.pow(0.9, Math.max(0, days))
    const weight = (ACTION_WEIGHTS[it.action] ?? 0) * decay
    const key = `${it.entityType}:${it.entityId}`
    const cur = byEntity.get(key)
    if (cur) {
      cur.boost += weight
      if (it.action === 'view' || it.action === 'click') cur.seenRecently = true
    } else {
      byEntity.set(key, {
        boost: weight,
        seenRecently: it.action === 'view' || it.action === 'click',
      })
    }
  }
  return byEntity
}

function scoreItem(
  item: FeedItem,
  signals: Map<string, SignalEntry>,
  interestCategories: Set<string>,
  seenSet: Set<string>
): number {
  let score = 0.6
  if (item.category && interestCategories.has(item.category)) score += 1.2
  if (item.entityId && item.entityType) {
    const signal = signals.get(`${item.entityType}:${item.entityId}`)
    if (signal) {
      score += signal.boost
      if (signal.seenRecently) score -= 0.6
    }
  }
  const entityKey = item.entityId && item.entityType ? `${item.entityType}:${item.entityId}` : null
  if ((entityKey && seenSet.has(entityKey)) || seenSet.has(item.id)) score -= 1.5
  if (item.body.length > 40) score += 0.15
  return score
}

function buildSerendipityPool(cards: FeedItem[], boostedCategories: Set<string>): FeedItem[] {
  const sorted = [...cards].sort((a, b) => b.score - a.score)
  const top = new Set(sorted.slice(0, Math.ceil(sorted.length * 0.6)).map((c) => c.id))
  const others = cards.filter(
    (c) => !top.has(c.id) && !(c.category && boostedCategories.has(c.category))
  )
  const byCategory = new Map<string, FeedItem[]>()
  for (const item of others) {
    const cat = item.category ?? 'other'
    const list = byCategory.get(cat) ?? []
    list.push(item)
    byCategory.set(cat, list)
  }
  const pool: FeedItem[] = []
  let added = true
  while (added) {
    added = false
    for (const list of byCategory.values()) {
      const item = list.shift()
      if (item) {
        pool.push(item)
        added = true
      }
    }
  }
  return pool
}

function selectItems(sorted: FeedItem[], serendipity: FeedItem[], limit: number): FeedItem[] {
  const selected: FeedItem[] = []
  const recentEntities: string[] = []
  let si = 0
  let ci = 0
  while (selected.length < limit) {
    const isSerendipity = (selected.length + 1) % 4 === 0
    let item: FeedItem | undefined
    if (isSerendipity && ci < serendipity.length) item = serendipity[ci++]
    else if (si < sorted.length) item = sorted[si++]
    else if (ci < serendipity.length) item = serendipity[ci++]
    else break
    if (!item) continue
    if (item.entityId && recentEntities.includes(item.entityId)) continue
    const last5 = selected.slice(-5)
    if (last5.length === 5 && last5.filter((x) => x.type === item.type).length >= 2) continue
    selected.push(item)
    if (item.entityId) {
      recentEntities.push(item.entityId)
      if (recentEntities.length > 4) recentEntities.shift()
    }
  }
  return selected
}

export interface BuildFeedOptions {
  interests?: string[]
  interactions?: ExploreInteraction[]
  seenIds?: string[]
  limit?: number
}

export async function buildExploreFeed(
  options: BuildFeedOptions = {}
): Promise<{ items: FeedItem[]; seenIds: string[] }> {
  const catalog = await fetchCatalog()
  const limit = Math.min(Math.max(Math.floor(options.limit ?? 10), 3), 20)

  const cards: FeedItem[] = []

  for (const c of catalog.careers) {
    const fact = factCard(c)
    if (fact) cards.push(fact)
    const discovery = discoveryCard(c)
    if (discovery) cards.push(discovery)
    const myth = mythCard(c)
    if (myth) cards.push(myth)
    const pathway = pathwayCard(c)
    if (pathway) cards.push(pathway)

    const opp = OPPORTUNITIES[c.slug]
    if (opp) {
      const sectors = sectorsCard(c, opp)
      if (sectors) cards.push(sectors)
      const demand = demandCard(c, opp)
      if (demand) cards.push(demand)
      const reality = realityCard(c, opp)
      if (reality) cards.push(reality)
    }
  }

  const careersByCategory = new Map<string, CareerRow[]>()
  for (const c of catalog.careers) {
    const list = careersByCategory.get(c.category) ?? []
    list.push(c)
    careersByCategory.set(c.category, list)
  }
  for (const list of careersByCategory.values()) {
    let made = 0
    for (let i = 0; i < list.length - 1 && made < 2; i++) {
      const a = list[i]
      const b = list[i + 1]
      if (a && b) {
        const card = comparisonCard(a, b)
        if (card) cards.push(card)
        made++
      }
    }
  }

  const careersByCourse = new Map<string, CareerRow[]>()
  for (const row of catalog.careerCourses) {
    const career = catalog.careersById.get(row.career_id)
    const course = catalog.coursesById.get(row.course_id)
    if (!career || !course) continue
    const list = careersByCourse.get(row.course_id) ?? []
    list.push(career)
    careersByCourse.set(row.course_id, list)
  }
  for (const [courseId, list] of careersByCourse) {
    const a = list[0]
    const b = list[1]
    const course = catalog.coursesById.get(courseId)
    if (a && b && course) {
      const card = interactiveCard(a, b, course.name)
      if (card) cards.push(card)
    }
  }

  for (const c of catalog.careers) {
    for (const slug of c.related_careers) {
      const related = catalog.careers.find((x) => x.slug === slug)
      if (related && related.id !== c.id) {
        const card = adjacentCard(c, related)
        if (card) cards.push(card)
        break
      }
    }
  }

  const courseCareers = new Map<string, string[]>()
  for (const row of catalog.careerCourses) {
    const names = courseCareers.get(row.course_id) ?? []
    names.push(row.career_id)
    courseCareers.set(row.course_id, names)
  }
  for (const co of catalog.courses) {
    const careerNames = (courseCareers.get(co.id) ?? [])
      .map((id) => catalog.careersById.get(id)?.name)
      .filter((name): name is string => Boolean(name))
    const card = courseCard(co, careerNames)
    if (card) cards.push(card)
  }

  const universityCourses = new Map<string, string[]>()
  for (const row of catalog.courseUniversities) {
    const names = universityCourses.get(row.university_id) ?? []
    names.push(row.course_id)
    universityCourses.set(row.university_id, names)
  }
  for (const u of catalog.universities) {
    const courseNames = (universityCourses.get(u.id) ?? [])
      .map((id) => catalog.coursesById.get(id)?.name)
      .filter((name): name is string => Boolean(name))
    const card = universityCard(u, courseNames)
    if (card) cards.push(card)
  }

  const trending = await fetchTrendingCareers(catalog)
  cards.push(...trending)

  const personalized = buildPersonalizedCard(catalog, options.interactions ?? [])
  if (personalized) cards.push(personalized)

  const interestCategories = new Set<string>()
  for (const label of options.interests ?? []) {
    for (const cat of INTEREST_CATEGORIES[label] ?? []) interestCategories.add(cat)
  }

  const signals = computeSignals(options.interactions ?? [])
  const seenSet = new Set(options.seenIds ?? [])
  for (const card of cards) card.score = scoreItem(card, signals, interestCategories, seenSet)

  const sorted = [...cards].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  const serendipity = buildSerendipityPool(cards, interestCategories)
  const items = selectItems(sorted, serendipity, limit)

  const seenIds = new Set(seenSet)
  for (const item of items) {
    seenIds.add(item.id)
    if (item.entityId && item.entityType) seenIds.add(`${item.entityType}:${item.entityId}`)
  }

  return { items, seenIds: [...seenIds] }
}