import type { ReactNode } from 'react'

const B = '#2563eb'
const B2 = '#dbeafe'
const B3 = '#bfdbfe'
const B4 = '#1e40af'
const G = '#f1f5f9'
const G2 = '#e2e8f0'
const G3 = '#cbd5e1'
const W = '#ffffff'

function hashUsername(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function deterministicAvatarIndex(username: string, total: number): number {
  return hashUsername(username) % total
}

export interface AvatarDef {
  id: number
  render: (size: number) => ReactNode
  thumbnail: ReactNode
}

const s = (size: number) => ({ width: size, height: size, viewBox: '0 0 36 36' } as const)

const avatars: AvatarDef[] = [
  {
    id: 0,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B2} />
        <circle cx="18" cy="18" r="10" fill={B} />
        <rect x="13" y="13" width="10" height="10" rx="2" fill={W} opacity="0.8" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 1,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <polygon points="18,6 30,26 6,26" fill={B} />
        <polygon points="18,11 26,24 10,24" fill={W} opacity="0.7" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 2,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B4} />
        <rect x="8" y="8" width="20" height="20" rx="4" fill={B} />
        <rect x="12" y="12" width="12" height="12" rx="2" fill={B3} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 3,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G2} />
        <circle cx="12" cy="14" r="6" fill={B} />
        <circle cx="24" cy="14" r="6" fill={B} opacity="0.6" />
        <circle cx="18" cy="24" r="6" fill={B} opacity="0.3" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 4,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B} />
        <rect x="4" y="4" width="28" height="28" rx="14" fill={B4} />
        <rect x="9" y="9" width="18" height="18" rx="9" fill={B2} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 5,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <polygon points="10,10 26,10 18,26" fill={B} />
        <polygon points="14,14 22,14 18,22" fill={W} opacity="0.8" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 6,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G3} />
        <rect x="6" y="14" width="24" height="8" rx="2" fill={B} />
        <rect x="10" y="10" width="16" height="16" rx="3" fill={B4} opacity="0.5" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 7,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B2} />
        <circle cx="18" cy="14" r="7" fill={B} />
        <rect x="11" y="19" width="14" height="10" rx="2" fill={B4} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 8,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={W} />
        <rect width="18" height="36" fill={B} />
        <rect x="4" y="8" width="10" height="20" rx="3" fill={W} opacity="0.8" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 9,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <polygon points="18,4 32,18 18,32 4,18" fill={B2} />
        <polygon points="18,8 28,18 18,28 8,18" fill={B} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 10,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B} />
        <circle cx="18" cy="18" r="10" fill={B2} />
        <circle cx="18" cy="18" r="5" fill={B4} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 11,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G2} />
        <rect x="6" y="6" width="24" height="8" rx="2" fill={B} />
        <rect x="14" y="6" width="8" height="24" rx="2" fill={B} opacity="0.5" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 12,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B4} />
        <polygon points="18,6 30,18 18,30 6,18" fill={B} />
        <polygon points="18,10 26,18 18,26 10,18" fill={B3} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 13,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <circle cx="12" cy="18" r="8" fill={B} />
        <circle cx="24" cy="18" r="8" fill={B2} />
        <circle cx="18" cy="18" r="4" fill={W} opacity="0.9" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 14,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B2} />
        <rect x="8" y="8" width="20" height="20" rx="10" fill={W} opacity="0.6" />
        <polygon points="18,10 26,22 10,22" fill={B} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 15,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G3} />
        <rect x="4" y="4" width="12" height="12" rx="3" fill={B} />
        <rect x="20" y="4" width="12" height="12" rx="3" fill={B} opacity="0.6" />
        <rect x="4" y="20" width="12" height="12" rx="3" fill={B} opacity="0.4" />
        <rect x="20" y="20" width="12" height="12" rx="3" fill={B} opacity="0.2" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 16,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B} />
        <circle cx="18" cy="18" r="12" fill={W} opacity="0.15" />
        <rect x="13" y="9" width="10" height="18" rx="2" fill={W} opacity="0.8" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 17,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <polygon points="18,4 32,18 18,32 4,18" fill={W} opacity="0.5" />
        <circle cx="18" cy="18" r="6" fill={B} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 18,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B4} />
        <rect x="6" y="6" width="24" height="24" rx="12" fill={B} opacity="0.7" />
        <rect x="10" y="10" width="16" height="16" rx="8" fill={B2} />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 19,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G2} />
        <polygon points="18,4 26,12 26,24 18,32 10,24 10,12" fill={B} />
        <polygon points="18,10 22,14 22,22 18,26 14,22 14,14" fill={W} opacity="0.7" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 20,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B} />
        <circle cx="18" cy="12" r="6" fill={B2} />
        <rect x="12" y="18" width="12" height="12" rx="2" fill={B2} opacity="0.6" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 21,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={W} />
        <rect x="4" y="4" width="28" height="6" rx="3" fill={B4} opacity="0.3" />
        <rect x="4" y="15" width="28" height="6" rx="3" fill={B} />
        <rect x="4" y="26" width="28" height="6" rx="3" fill={B4} opacity="0.5" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 22,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={G} />
        <circle cx="18" cy="18" r="11" fill={B} opacity="0.15" />
        <rect x="8" y="14" width="20" height="8" rx="2" fill={B} />
        <rect x="14" y="8" width="8" height="20" rx="2" fill={B} opacity="0.5" />
      </svg>
    ),
    thumbnail: null!,
  },
  {
    id: 23,
    render: (sz) => (
      <svg {...s(sz)}>
        <rect width="36" height="36" rx="18" fill={B4} />
        <polygon points="6,6 30,6 18,30" fill={B3} />
        <polygon points="10,10 26,10 18,26" fill={W} opacity="0.8" />
      </svg>
    ),
    thumbnail: null!,
  },
]

for (const av of avatars) {
  av.thumbnail = av.render(36)
}

export const AVATAR_COUNT = avatars.length

export function getAvatar(index: number, size: number = 36): ReactNode {
  const av = avatars[Math.max(0, Math.min(index, avatars.length - 1))]
  if (!av) return avatars[0]!.render(size)
  return av.render(size)
}

export function getAllAvatars(): AvatarDef[] {
  return avatars
}
