// Squad mark illustrations — geometric composures in the mascot's
// palette (navy / cream / coral / amber / teal). Keys and fallback logic
// live in lib/squad-identity.ts; this file only draws.

import { isSquadMarkKey, fallbackSquadMark } from '@/lib/squad-identity'

const NAVY = '#16294F'
const CREAM = '#F9F3E3'
const CORAL = '#FF5A3C'
const AMBER = '#FFB703'
const TEAL = '#12B5B0'

const stroke = {
  stroke: NAVY,
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Comet() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Comet">
      <path d="M4 12 Q 14 13.5 20 22" fill="none" {...stroke} />
      <path d="M4 23 Q 12 23 17 28" fill="none" {...stroke} />
      <circle cx="27" cy="31" r="11" fill={CORAL} {...stroke} />
      <circle cx="30" cy="28.5" r="3.2" fill={CREAM} />
      <polygon points="37 8 38.6 12 43 12.2 39.6 15.3 40.9 19.4 37 17 33.1 19.4 34.4 15.3 31 12.2 35.4 12" fill={AMBER} {...stroke} strokeWidth={1.6} />
    </svg>
  )
}

function Anvil() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Anvil">
      <rect x="8" y="16" width="30" height="8" rx="2.5" fill={CORAL} {...stroke} />
      <polygon points="38 17.5 46 20.5 38 23.5" fill={CREAM} {...stroke} />
      <rect x="12" y="24" width="22" height="9" fill={CREAM} {...stroke} />
      <rect x="9" y="33" width="28" height="7" rx="2.5" fill={TEAL} {...stroke} />
      <polygon points="25 4 26.6 8.2 31 8.4 27.6 11.2 28.8 15.4 25 13.2 21.2 15.4 22.4 11.2 19 8.4 23.4 8.2" fill={AMBER} {...stroke} strokeWidth={1.4} />
    </svg>
  )
}

function Kite() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Kite">
      <polygon points="24 4 37 19 24 34 11 19" fill={CORAL} {...stroke} />
      <line x1="24" y1="4" x2="24" y2="34" {...stroke} />
      <line x1="11" y1="19" x2="37" y2="19" {...stroke} />
      <path d="M24 34 Q 27 39 22 43" fill="none" {...stroke} />
      <path d="M22 41 l -4 4 M22 41 l 5 2.5" {...stroke} />
    </svg>
  )
}

function Bolt() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Bolt">
      <polygon points="27 3 13 27 22.5 27 18 45 36 20 25.5 20 33 3" fill={AMBER} {...stroke} />
      <circle cx="25" cy="24.5" r="2.4" fill={NAVY} />
    </svg>
  )
}

function Pinecone() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Pinecone">
      <path d="M24 44 C 12 40 9 24 24 10 C 39 24 36 40 24 44 Z" fill={TEAL} {...stroke} />
      <path d="M14 24 Q 24 29 34 24" fill="none" {...stroke} />
      <path d="M16 33 Q 24 38 32 33" fill="none" {...stroke} />
      <path d="M18.5 16 Q 24 19.5 29.5 16" fill="none" {...stroke} />
      <rect x="13" y="13" width="22" height="6" rx="3" fill={NAVY} />
      <line x1="24" y1="16" x2="35" y2="11" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

function Plane() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Paper plane">
      <path d="M6 41 Q 15 45.5 29 43.5" fill="none" {...stroke} strokeDasharray="3.5 3.5" strokeWidth={2.2} />
      <polygon points="5 26 44 8 31 40 23.5 29.5" fill={CREAM} {...stroke} />
      <line x1="23.5" y1="29.5" x2="44" y2="8" {...stroke} />
    </svg>
  )
}

function Hourglass() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Hourglass">
      <rect x="11" y="4" width="26" height="5" rx="2" fill={CREAM} {...stroke} />
      <polygon points="14,9 34,9 24,22.5" fill={CORAL} {...stroke} />
      <polygon points="14,39.5 34,39.5 24,26" fill={CORAL} {...stroke} />
      <circle cx="24" cy="24.4" r="1.3" fill={NAVY} />
      <circle cx="21" cy="31" r="1" fill={CREAM} />
      <circle cx="26.5" cy="34" r="1" fill={CREAM} />
      <rect x="11" y="39.5" width="26" height="5" rx="2" fill={CREAM} {...stroke} />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Moon">
      <path d="M33 6 A 18.5 18.5 0 1 0 33 42 A 14 14 0 1 1 33 6 Z" fill={CREAM} {...stroke} />
      <path d="M19 24 q 3.5 3.2 7 0" fill="none" {...stroke} strokeWidth={2.2} />
      <circle cx="16.5" cy="30" r="1.6" fill={CORAL} />
    </svg>
  )
}

function Flag() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Flag">
      <line x1="12" y1="7" x2="12" y2="44" {...stroke} strokeWidth={3} />
      <circle cx="12" cy="5.5" r="2.6" fill={AMBER} {...stroke} strokeWidth={1.8} />
      <path d="M12 11 C 18 8.5 23.5 12.5 29.5 9.5 C 33.5 7.5 37 9 39.5 10.5 L39.5 22 C 37 20.5 33.5 19 29.5 21 C 23.5 24 18 20 12 22.5 Z" fill={CORAL} {...stroke} />
      <line x1="16.5" y1="13.5" x2="16.5" y2="19.5" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

function Compass() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Compass">
      <circle cx="24" cy="24" r="17.5" fill={CREAM} {...stroke} />
      <line x1="24" y1="8.5" x2="24" y2="12.5" {...stroke} strokeWidth={2.2} />
      <line x1="24" y1="35.5" x2="24" y2="39.5" {...stroke} strokeWidth={2.2} />
      <line x1="8.5" y1="24" x2="12.5" y2="24" {...stroke} strokeWidth={2.2} />
      <line x1="35.5" y1="24" x2="39.5" y2="24" {...stroke} strokeWidth={2.2} />
      <polygon points="24,11.5 28.4,26.5 24,30.5" fill={CORAL} {...stroke} strokeWidth={1.8} />
      <polygon points="24,11.5 19.6,26.5 24,30.5" fill={AMBER} {...stroke} strokeWidth={1.8} />
      <circle cx="24" cy="29" r="2.1" fill={NAVY} />
    </svg>
  )
}

function Anchor() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Anchor">
      <circle cx="24" cy="7" r="3.4" fill={CREAM} {...stroke} />
      <line x1="24" y1="10.5" x2="24" y2="37" {...stroke} strokeWidth={3} />
      <line x1="14.5" y1="16.5" x2="33.5" y2="16.5" {...stroke} strokeWidth={2.6} />
      <path d="M9 27 Q 24 42.5 39 27" fill="none" {...stroke} strokeWidth={3} />
      <polygon points="9,27 7,32 13.5,31" fill={CORAL} {...stroke} strokeWidth={1.8} />
      <polygon points="39,27 41,32 34.5,31" fill={CORAL} {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

function Bell() {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label="Bell">
      <path d="M24 8.5 C 16.5 8.5 13.5 15.5 13.5 22 L13.5 28 C 13.5 33 10.5 35.5 7.5 38 L40.5 38 C 37.5 35.5 34.5 33 34.5 28 L34.5 22 C 34.5 15.5 31.5 8.5 24 8.5 Z" fill={CREAM} {...stroke} />
      <circle cx="24" cy="42.5" r="2.7" fill={CORAL} {...stroke} strokeWidth={1.8} />
      <line x1="7" y1="16" x2="4" y2="12.5" {...stroke} strokeWidth={2} />
      <line x1="41" y1="16" x2="44" y2="12.5" {...stroke} strokeWidth={2} />
    </svg>
  )
}

const MARK_ICONS: Record<string, () => React.ReactElement> = {
  comet: Comet,
  anvil: Anvil,
  kite: Kite,
  bolt: Bolt,
  pinecone: Pinecone,
  plane: Plane,
  hourglass: Hourglass,
  moon: Moon,
  flag: Flag,
  compass: Compass,
  anchor: Anchor,
  bell: Bell,
}

export function SquadMarkIcon({
  mark,
  seedFallback,
  className = 'h-full w-full',
}: {
  /** Stored mark key — an illustration key, never a unicode emoji. */
  mark: string | null | undefined
  /** Squad id (or any stable seed) — deterministic pick when `mark` is unknown. */
  seedFallback?: string
  className?: string
}) {
  const key = isSquadMarkKey(mark)
    ? mark
    : fallbackSquadMark(seedFallback ?? mark ?? 'squad')
  const Icon = MARK_ICONS[key]!
  return (
    <span className={className} aria-hidden="true" style={{ display: 'inline-flex' }}>
      <Icon />
    </span>
  )
}
