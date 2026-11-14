// Shared squad identity palette, mark catalog and deterministic fallback
// names. Pure module — importable from server actions and client components.
// Illustrations live in components/squad/squad-marks.tsx; this file holds
// the keys, labels and fallback logic only (kept JSX-free).

export const SQUAD_COLORS = [
  '#2563eb', // blue
  '#7c3aed', // violet
  '#059669', // emerald
  '#d97706', // amber
  '#e11d48', // rose
  '#0891b2', // cyan
  '#ea580c', // orange
  '#0f766e', // teal
] as const

export type GoalKind = 'questions' | 'secured'

export const GOAL_PRESETS: Record<GoalKind, { label: string; options: number[]; unit: string }> = {
  questions: { label: 'Questions answered together', options: [100, 250, 500, 1000], unit: 'questions' },
  secured: { label: 'Subjects secured together', options: [1, 2, 3, 5], unit: 'subjects' },
}

/**
 * Squad marks — deliberately NOT unicode emoji (those read as generic).
 * Keys index the illustrations in components/squad/squad-marks.tsx.
 * Stored on the squads.emoji column (the column keeps its name to avoid
 * renaming a live table; every stored value is a mark key from this list).
 */
export const SQUAD_MARKS = [
  { key: 'comet', label: 'Comet' },
  { key: 'anvil', label: 'Anvil' },
  { key: 'kite', label: 'Kite' },
  { key: 'bolt', label: 'Bolt' },
  { key: 'pinecone', label: 'Pinecone' },
  { key: 'plane', label: 'Paper plane' },
  { key: 'hourglass', label: 'Hourglass' },
  { key: 'moon', label: 'Moon' },
  { key: 'flag', label: 'Flag' },
  { key: 'compass', label: 'Compass' },
  { key: 'anchor', label: 'Anchor' },
  { key: 'bell', label: 'Bell' },
] as const

export const SQUAD_MARK_KEYS = SQUAD_MARKS.map((mark) => mark.key) as readonly string[]

export function isSquadMarkKey(value: string | null | undefined): value is string {
  return !!value && SQUAD_MARK_KEYS.includes(value)
}

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function fallbackSquadMark(seed: string): string {
  return SQUAD_MARKS[hashString(seed) % SQUAD_MARKS.length]!.key
}

export interface SquadIdentity {
  name: string
  /** Key into SQUAD_MARKS — an illustration, never an emoji codepoint. */
  mark: string
  color: string
}

const ADJECTIVES = [
  'Bright', 'Bold', 'Calm', 'Daring', 'Eager', 'Focused', 'Golden', 'Grand',
  'Keen', 'Lucky', 'Noble', 'Prime', 'Proud', 'Quick', 'Rising', 'Sharp',
  'Silent', 'Steady', 'Swift', 'Wise',
] as const

const NOUNS = [
  'Scholars', 'Stars', 'Minds', 'Sparks', 'Pioneers', 'Thinkers',
  'Seekers', 'Builders', 'Climbers', 'Lights', 'Trailblazers',
  'Achievers', 'Growers', 'Vanguards', 'Flyers', 'Echoes',
] as const

/** Deterministic fallback for squads created before identity existed. */
export function fallbackSquadIdentity(squadId: string): SquadIdentity {
  const hash = hashString(squadId)
  const name = `${ADJECTIVES[hash % ADJECTIVES.length]} ${NOUNS[Math.floor(hash / ADJECTIVES.length) % NOUNS.length]}`
  return {
    name,
    mark: fallbackSquadMark(squadId),
    color: SQUAD_COLORS[hash % SQUAD_COLORS.length] as string,
  }
}

/**
 * Resolve a squad row's stored identity, falling back to deterministic
 * defaults. Legacy rows may hold unicode emoji in the emoji column — those
 * are not mark keys, so they resolve to the default mark instead.
 */
export function resolveSquadIdentity(squad: {
  id: string
  name: string | null
  emoji: string | null
  color: string | null
}): SquadIdentity & { isDefault: boolean } {
  const fallback = fallbackSquadIdentity(squad.id)
  const storedMark = isSquadMarkKey(squad.emoji) ? squad.emoji : null
  const storedColor = squad.color && /^#[0-9a-fA-F]{6}$/.test(squad.color) ? squad.color : null
  const name = squad.name && squad.name.trim().length >= 2 ? squad.name : fallback.name
  return {
    name,
    mark: storedMark ?? fallback.mark,
    color: storedColor ?? fallback.color,
    isDefault: !(squad.name && storedMark && storedColor),
  }
}

/** Monday 00:00 UTC of the ISO week containing `date`, as YYYY-MM-DD. */
export function mondayUtc(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() // 0=Sunday .. 6=Saturday
  const offset = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

export function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function sanitizeSquadName(raw: string): string | null {
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length >= 2 && cleaned.length <= 40 ? cleaned : null
}
