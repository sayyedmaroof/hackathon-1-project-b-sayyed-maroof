import { describe, expect, it } from 'vitest'
import { TRIP_CATALOG } from '@/lib/trips/catalog'
import { resolveCashBaseline, type LiveCashFare } from './cash-baseline'

const trip = TRIP_CATALOG[0]!
const today = new Date('2027-01-15T12:00:00Z')

function live(over: Partial<LiveCashFare> = {}): LiveCashFare {
  return {
    amount: 1800,
    currency: 'EUR',
    mode: 'live',
    cabin: trip.cabin,
    journey: trip.journey,
    fetchedAt: '2027-01-15T11:00:00Z',
    ...over,
  }
}

describe('resolveCashBaseline', () => {
  it('uses a live EUR fare that matches cabin and journey', () => {
    const result = resolveCashBaseline(trip, live(), today)
    expect(result.source).toBe('duffel_live')
    expect(result.eur).toBe(1800)
  })

  it('keeps sample eur for a test-mode fare', () => {
    const result = resolveCashBaseline(trip, live({ mode: 'test', amount: 99 }), today)
    expect(result.source).toBe('duffel_test')
    expect(result.eur).toBe(trip.typicalCashEur)
    expect(result.note).toContain('99')
  })

  it('ignores GBP and USD fares', () => {
    expect(resolveCashBaseline(trip, live({ currency: 'GBP' }), today).source).toBe('sample')
    expect(resolveCashBaseline(trip, live({ currency: 'USD' }), today).eur).toBe(trip.typicalCashEur)
  })

  it('ignores wrong cabin or journey', () => {
    expect(resolveCashBaseline(trip, live({ cabin: 'Economy' }), today).source).toBe('sample')
    expect(resolveCashBaseline(trip, live({ journey: 'one_way' }), today).source).toBe('sample')
  })

  it('ignores a stale fare', () => {
    const result = resolveCashBaseline(
      trip,
      live({ fetchedAt: '2027-01-13T11:00:00Z' }),
      today,
    )
    expect(result.source).toBe('sample')
    expect(result.eur).toBe(trip.typicalCashEur)
  })
})
