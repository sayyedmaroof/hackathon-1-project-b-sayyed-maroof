import { describe, expect, it, vi } from 'vitest'
import { TRIP_CATALOG } from '@/lib/trips/catalog'
import type { FlightOffer } from '@/lib/providers/types'
import { DATE_NOTE, fetchResolvedCashBaseline } from './fetch-cash-baseline'

const trip = TRIP_CATALOG[0]!
const today = new Date('2027-01-15T12:00:00Z')
const travelDate = '2027-03-01'

function offer(over: Partial<FlightOffer> = {}): FlightOffer {
  return {
    id: 'o1',
    kind: 'cash',
    source: 'duffel',
    airline: 'IB',
    airlineCode: 'IB',
    origin: 'MAD',
    destination: 'JFK',
    departTime: '',
    arriveTime: '',
    duration: '',
    stops: '',
    cabin: trip.cabin,
    cashPrice: 1999,
    points: 0,
    fees: 0,
    tone: '',
    whyThisWorks: '',
    isSampleAward: false,
    currency: 'EUR',
    ...over,
  }
}

describe('fetchResolvedCashBaseline', () => {
  it('replaces the sample with a live EUR fare', async () => {
    const search = vi.fn().mockResolvedValue([offer()])
    const result = await fetchResolvedCashBaseline({
      trip,
      travelDate,
      today,
      mode: 'live',
      hasKey: true,
      search,
    })
    expect(result.source).toBe('duffel_live')
    expect(result.eur).toBe(1999)
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'MAD',
        destination: 'JFK',
        cabin: 'Business',
        adults: 1,
        departDate: travelDate,
        returnDate: '2027-03-08',
      }),
    )
  })

  it('does not change eur for a test-mode fare', async () => {
    const search = vi.fn().mockResolvedValue([offer({ cashPrice: 50 })])
    const result = await fetchResolvedCashBaseline({
      trip,
      travelDate,
      today,
      mode: 'test',
      hasKey: true,
      search,
    })
    expect(result.source).toBe('duffel_test')
    expect(result.eur).toBe(trip.typicalCashEur)
  })

  it('falls back when there is no key, a timeout, or empty offers', async () => {
    const noKey = await fetchResolvedCashBaseline({
      trip,
      travelDate,
      today,
      mode: 'unknown',
      hasKey: false,
      search: vi.fn(),
    })
    expect(noKey.source).toBe('sample')
    expect(noKey.eur).toBe(trip.typicalCashEur)

    const timeout = await fetchResolvedCashBaseline({
      trip,
      travelDate,
      today,
      mode: 'live',
      hasKey: true,
      search: vi.fn().mockRejectedValue(new Error('timeout')),
    })
    expect(timeout.source).toBe('sample')

    const empty = await fetchResolvedCashBaseline({
      trip,
      travelDate,
      today,
      mode: 'live',
      hasKey: true,
      search: vi.fn().mockResolvedValue([]),
    })
    expect(empty.source).toBe('sample')
  })

  it('skips Duffel for dates outside tomorrow..330 days', async () => {
    const search = vi.fn()
    const past = await fetchResolvedCashBaseline({
      trip,
      travelDate: '2027-01-15',
      today,
      mode: 'live',
      hasKey: true,
      search,
    })
    expect(past.note).toBe(DATE_NOTE)
    expect(search).not.toHaveBeenCalled()

    const far = await fetchResolvedCashBaseline({
      trip,
      travelDate: '2028-12-01',
      today,
      mode: 'live',
      hasKey: true,
      search,
    })
    expect(far.note).toBe(DATE_NOTE)
    expect(search).not.toHaveBeenCalled()
  })
})
