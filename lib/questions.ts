export function normalizeOptions(options: unknown): { key: string; text: string }[] {
  if (Array.isArray(options)) return options as { key: string; text: string }[]
  if (options && typeof options === 'object') {
    const obj = options as Record<string, string>
    const keys = ['a', 'b', 'c', 'd']
    return keys.filter((k) => k in obj).map((k) => ({ key: k, text: obj[k] ?? '' }))
  }
  return []
}


