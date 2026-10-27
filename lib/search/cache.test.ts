import { afterEach, describe, expect, it } from 'vitest'
import {
  FAILURE_TTL_MS,
  SUCCESS_TTL_MS,
  clearSearchCache,
  getCachedCashBaseline,
  isCachedFailure,
  setCachedCashBaseline,
  setCachedCashBaselineFailure,
} from './cache'
import type { CashBaselineCacheKeyInput } from './cache'

const base: CashBaselineCacheKeyInput = {
  origin: 'MAD',
  destination: 'JFK',
  cabin: 'Business',
  journey: 'return',
  departDate: '2027-06-01',
  returnDate: '2027-06-08',
  mode: 'live',
}

describe('cash baseline cache', () => {
  afterEach(() => {
    clearSearchCache()
  })

  it('hits a success within TTL and misses after TTL', () => {
    const now = 1_000_000
    setCachedCashBaseline(base, { eur: 1999, source: 'duffel_live', fetchedAt: '2027-01-01T00:00:00Z' }, now)
    expect(getCachedCashBaseline(base, now + 1000)?.eur).toBe(1999)
    expect(getCachedCashBaseline(base, now + SUCCESS_TTL_MS + 1)).toBeUndefined()
  })

  it('separates keys by date and journey', () => {
    const now = 1_000_000
    setCachedCashBaseline(base, { eur: 1999, source: 'duffel_live' }, now)
    expect(
      getCachedCashBaseline({ ...base, departDate: '2027-06-02' }, now),
    ).toBeUndefined()
    expect(
      getCachedCashBaseline({ ...base, journey: 'one_way', returnDate: undefined }, now),
    ).toBeUndefined()
    expect(getCachedCashBaseline(base, now)?.eur).toBe(1999)
  })

  it('caches failures for a short TTL', () => {
    const now = 1_000_000
    setCachedCashBaselineFailure(base, now)
    expect(isCachedFailure(base, now + 1000)).toBe(true)
    expect(getCachedCashBaseline(base, now + 1000)).toBeNull()
    expect(isCachedFailure(base, now + FAILURE_TTL_MS + 1)).toBe(false)
  })
})
