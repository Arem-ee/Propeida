import { getAvatar, deterministicAvatarIndex } from '@/lib/avatars'

export function Avatar({ username, avatarIndex, size = 36 }: { username: string; avatarIndex?: number | null; size?: number }) {
  const index = avatarIndex ?? deterministicAvatarIndex(username, 24)
  return <>{getAvatar(index, size)}</>
}
