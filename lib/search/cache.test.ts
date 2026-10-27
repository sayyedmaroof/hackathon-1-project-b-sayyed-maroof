import { afterEach, describe, expect, it } from 'vitest'
import type { FlightOffer, SearchFlightsResult } from '@/lib/providers/types'
import { clearSearchCache, getCachedSearch, setCachedSearch } from './cache'
import { clearOfferSnapshots, getOfferSnapshot } from './offer-snapshot'
import type { ParsedSearchQuery } from './query-schema'

const query: ParsedSearchQuery = {
  origin: 'London (LHR)',
  destination: 'New York (JFK)',
  depart: '2027-06-01',
  returnDate: '2027-06-10',
  cabin: 'Economy',
  flexible: false,
  adults: 1,
  originCode: 'LHR',
  destinationCode: 'JFK',
}

function cashOffer(expiresAt: string): FlightOffer {
  return {
    id: 'duffel-off_1',
    kind: 'cash',
    source: 'duffel',
    airline: 'BA',
    airlineCode: 'BA',
    origin: 'LHR',
    destination: 'JFK',
    departTime: '09:00',
    arriveTime: '12:00',
    duration: '7h',
    stops: 'Nonstop',
    cabin: 'Economy',
    cashPrice: 200,
    points: 0,
    fees: 0,
    tone: '',
    whyThisWorks: '',
    isSampleAward: false,
    duffelOfferId: 'off_1',
    expiresAt,
    currency: 'EUR',
    totalAmountRaw: '200.00',
    dataMode: 'test',
  }
}

function result(offer: FlightOffer): SearchFlightsResult {
  return {
    normalPrice: 200,
    best: offer,
    savings: { amount: 0, pct: 0 },
    alternatives: [offer],
    dataMode: 'test',
    displayCurrency: 'EUR',
  }
}

describe('search cache', () => {
  afterEach(() => {
    clearSearchCache()
    clearOfferSnapshots()
  })

  it('returns a live cache hit and remembers the offer snapshot', () => {
    const offer = cashOffer('2099-01-01T00:00:00Z')
    setCachedSearch(query, result(offer))
    const hit = getCachedSearch(query)
    expect(hit?.alternatives).toHaveLength(1)
    expect(getOfferSnapshot('off_1')?.amount).toBe('200.00')
  })

  it('evicts expired offers and misses when the baseline cash fare is gone', () => {
    setCachedSearch(query, result(cashOffer('2000-01-01T00:00:00Z')))
    expect(getCachedSearch(query)).toBeNull()
  })
})
