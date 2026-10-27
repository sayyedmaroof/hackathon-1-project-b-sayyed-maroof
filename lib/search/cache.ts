import type { DuffelMode } from '@/lib/providers/types'
import type { Cabin } from '@/lib/types'
import type { TripJourney } from '@/lib/trips/catalog'
import type { CashBaseline } from '@/lib/plan/cash-baseline'

export type CashBaselineCacheKeyInput = {
  origin: string
  destination: string
  cabin: Cabin
  journey: TripJourney
  departDate: string
  returnDate?: string
  mode: DuffelMode | 'unknown'
}

type Entry = {
  expiresAt: number
  ok: boolean
  value: CashBaseline | null
}

const CACHE = new Map<string, Entry>()
export const SUCCESS_TTL_MS = 30 * 60 * 1000
export const FAILURE_TTL_MS = 2 * 60 * 1000

export function cashBaselineCacheKey(input: CashBaselineCacheKeyInput): string {
  return [
    input.origin,
    input.destination,
    input.cabin,
    input.journey,
    input.departDate,
    input.returnDate ?? '',
    input.mode,
  ].join('|')
}

export function getCachedCashBaseline(input: CashBaselineCacheKeyInput, now = Date.now()): CashBaseline | null | undefined {
  const key = cashBaselineCacheKey(input)
  const hit = CACHE.get(key)
  if (!hit || now > hit.expiresAt) {
    CACHE.delete(key)
    return undefined
  }
  return hit.value
}

export function setCachedCashBaseline(
  input: CashBaselineCacheKeyInput,
  value: CashBaseline,
  now = Date.now(),
): void {
  CACHE.set(cashBaselineCacheKey(input), { ok: true, value, expiresAt: now + SUCCESS_TTL_MS })
}

export function setCachedCashBaselineFailure(input: CashBaselineCacheKeyInput, now = Date.now()): void {
  CACHE.set(cashBaselineCacheKey(input), { ok: false, value: null, expiresAt: now + FAILURE_TTL_MS })
}

export function clearSearchCache(): void {
  CACHE.clear()
}

export function isCachedFailure(input: CashBaselineCacheKeyInput, now = Date.now()): boolean {
  const key = cashBaselineCacheKey(input)
  const hit = CACHE.get(key)
  if (!hit || now > hit.expiresAt) {
    CACHE.delete(key)
    return false
  }
  return !hit.ok
}
