const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 30

const hits = new Map<string, number[]>()

export function allowCashBaselineCall(ip: string, now = Date.now()): boolean {
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

export function resetCashBaselineRateLimit(): void {
  hits.clear()
}
