export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function splitList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter(Boolean)
}
