import type { FlightOffer, SearchFlightsResult } from '@/lib/providers/types'
import type { ParsedSearchQuery } from './query-schema'
import { rememberOfferSnapshot } from './offer-snapshot'

type Entry = { expiresAt: number; value: SearchFlightsResult }

const CACHE = new Map<string, Entry>()
const TTL_MS = 10 * 60 * 1000

export function cacheKey(parsed: ParsedSearchQuery): string {
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

function offerExpired(offer: FlightOffer, now: number): boolean {
  if (!offer.expiresAt) return false
  const at = Date.parse(offer.expiresAt)
  return Number.isFinite(at) && at <= now
}

function pruneResult(value: SearchFlightsResult, now = Date.now()): SearchFlightsResult | null {
  const alternatives = value.alternatives.filter((offer) => !offerExpired(offer, now))
  const best = value.best && !offerExpired(value.best, now) ? alternatives.find((o) => o.id === value.best?.id) ?? alternatives[0] ?? null : alternatives[0] ?? null
  const baselineGone = value.normalPrice > 0 && !alternatives.some((o) => o.kind === 'cash' && o.cashPrice === value.normalPrice)
  if (baselineGone) return null
  return { ...value, alternatives, best }
}

function remember(result: SearchFlightsResult): void {
  for (const offer of result.alternatives) {
    if (!offer.duffelOfferId || !offer.totalAmountRaw || !offer.currency) continue
    rememberOfferSnapshot({
      offerId: offer.duffelOfferId,
      amount: offer.totalAmountRaw,
      currency: offer.currency,
      expiresAt: offer.expiresAt,
      baselineAmount: result.normalPrice,
      baselineCurrency: result.displayCurrency,
    })
  }
}

export function getCachedSearch(parsed: ParsedSearchQuery): SearchFlightsResult | null {
  const key = cacheKey(parsed)
  const hit = CACHE.get(key)
  if (!hit || Date.now() > hit.expiresAt) {
    CACHE.delete(key)
    return null
  }
  const pruned = pruneResult(hit.value)
  if (!pruned) {
    CACHE.delete(key)
    return null
  }
  CACHE.set(key, { ...hit, value: pruned })
  return pruned
}

export function setCachedSearch(parsed: ParsedSearchQuery, value: SearchFlightsResult): void {
  remember(value)
  CACHE.set(cacheKey(parsed), { value, expiresAt: Date.now() + TTL_MS })
}

export function clearSearchCache(): void {
  CACHE.clear()
}

export { pruneResult as pruneCachedResult }
