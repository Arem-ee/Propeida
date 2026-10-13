export function Avatar({ username, size = 36 }: { username: string; size?: number }) {
  const initial = (username.trim().charAt(0) || 'S').toUpperCase()
  return (
    <span
      role="img"
      aria-label={username}
      className="flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-display font-semibold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
    >
      {initial}
    </span>
  )
}
