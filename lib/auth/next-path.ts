const FALLBACK = '/'

function hasControlChars(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value)
}

export function safeNextPath(raw: string | null | undefined, fallback = FALLBACK): string {
  if (!raw || typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback
  if (trimmed.includes('\\') || hasControlChars(trimmed)) return fallback
  if (trimmed.includes('://')) return fallback

  let decoded = trimmed
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    return fallback
  }
  if (decoded.startsWith('//') || decoded.includes('//') || decoded.includes('\\') || hasControlChars(decoded)) return fallback

  try {
    const url = new URL(trimmed, 'http://x.invalid')
    if (url.origin !== 'http://x.invalid') return fallback
    if (url.username || url.password || url.port) return fallback
  } catch {
    return fallback
  }
  return trimmed
}
