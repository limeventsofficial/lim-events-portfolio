/** Mongoose `required` on strings rejects `''`; use placeholders for drafts. */

export function normalizeWorkTitle(value: unknown): string {
  if (typeof value !== 'string') return 'New event'
  const t = value.trim()
  return t || 'New event'
}

export function normalizeWorkLine(value: unknown): string {
  if (typeof value !== 'string') return 'TBC'
  const t = value.trim()
  return t || 'TBC'
}
