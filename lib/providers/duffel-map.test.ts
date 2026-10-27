import { describe, expect, it } from 'vitest'
import offerList from './__fixtures__/offer-list.json'
import offerMinimal from './__fixtures__/offer-minimal.json'
import { mapDuffelOffer, mapDuffelOffers } from './duffel-map'
import type { ProviderSearchQuery } from './types'

const query: ProviderSearchQuery = {
  origin: 'LHR',
  destination: 'JFK',
  departDate: '2027-06-01',
  returnDate: '2027-06-10',
  cabin: 'Economy',
  adults: 1,
}

const meta = { kind: 'cash' as const, why: 'test', dataMode: 'test' as const }

describe('mapDuffelOffers', () => {
  it('maps a complete offer including slices, baggage and conditions', () => {
    const [offer] = mapDuffelOffers(offerList.data, query, meta)
    expect(offer.duffelOfferId).toBe('off_test_cheapest')
    expect(offer.cashPrice).toBe(120.5)
    expect(offer.currency).toBe('EUR')
    expect(offer.airlineCode).toBe('BA')
    expect(offer.slices).toHaveLength(2)
    expect(offer.slices?.[0]?.segments[0]?.flightNumber).toBe('BA117')
    expect(offer.changeable).toBe(true)
    expect(offer.refundable).toBe(false)
    expect(offer.baggage).toBe('1 checked bag')
    expect(offer.passengerIds).toEqual(['pas_test_1'])
    expect(offer.stops).toBe('Nonstop')
  })

  it('keeps unknown fields optional when the payload is sparse', () => {
    const offer = mapDuffelOffer(offerMinimal, query, meta)
    expect(offer?.airlineCode).toBe('XX')
    expect(offer?.duration).toBe('—')
    expect(offer?.slices).toEqual([])
    expect(offer?.baggage).toBeUndefined()
    expect(offer?.changeable).toBeUndefined()
    expect(offer?.currency).toBe('GBP')
    expect(offer?.cashPrice).toBe(80)
  })

  it('does not convert a non-EUR amount into euros', () => {
    const offer = mapDuffelOffer({ id: 'off_usd', total_amount: '100.00', total_currency: 'USD' }, query, meta)
    expect(offer?.cashPrice).toBe(100)
    expect(offer?.currency).toBe('USD')
  })
})
