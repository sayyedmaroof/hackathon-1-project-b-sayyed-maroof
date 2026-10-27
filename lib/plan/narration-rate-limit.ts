const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 20

const hits = new Map<string, number[]>()

export function allowNarrationCall(ip: string, now = Date.now()): boolean {
  const key = ip || 'unknown'
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

export function resetNarrationRateLimit(): void {
  hits.clear()
}
