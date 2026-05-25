export function normalizeWorkTitle(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function normalizeWorkLine(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}
