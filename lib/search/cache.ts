import type { SearchFlightsResult } from '@/lib/providers/types'
import type { ParsedSearchQuery } from './query-schema'

type Entry = { expiresAt: number; value: SearchFlightsResult }

const CACHE = new Map<string, Entry>()
const TTL_MS = 10 * 60 * 1000

function cacheKey(parsed: ParsedSearchQuery): string {
  return JSON.stringify({
    o: parsed.originCode,
    d: parsed.destinationCode,
    dep: parsed.depart,
    ret: parsed.returnDate,
    c: parsed.cabin,
    f: parsed.flexible,
    a: parsed.adults,
  })
}

export function getCachedSearch(parsed: ParsedSearchQuery): SearchFlightsResult | null {
  const key = cacheKey(parsed)
  const hit = CACHE.get(key)
  if (!hit || Date.now() > hit.expiresAt) {
    CACHE.delete(key)
    return null
  }
  return hit.value
}

export function setCachedSearch(parsed: ParsedSearchQuery, value: SearchFlightsResult): void {
  CACHE.set(cacheKey(parsed), { value, expiresAt: Date.now() + TTL_MS })
}
