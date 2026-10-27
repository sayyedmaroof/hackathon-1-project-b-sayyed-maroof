import { describe, expect, it } from 'vitest'
import { cabinToDuffel } from '@/lib/providers/cabin-map'
import {
  CUSTOM_TRIP_ID,
  DEFAULT_CUSTOM_TRIP,
  TRIP_CATALOG,
  buildCustomTrip,
  isCustomTripComplete,
} from './catalog'

describe('trip catalog', () => {
  it('has 6 to 8 Madrid trips with valid IATA, cabin and journey fields', () => {
    expect(TRIP_CATALOG.length).toBeGreaterThanOrEqual(6)
    expect(TRIP_CATALOG.length).toBeLessThanOrEqual(8)
    const iata = /^[A-Z]{3}$/
    for (const trip of TRIP_CATALOG) {
      expect(trip.originIata).toMatch(iata)
      expect(trip.destinationIata).toMatch(iata)
      expect(trip.originIata).toBe('MAD')
      const mapped = cabinToDuffel(trip.cabin)
      expect(['economy', 'premium_economy', 'business', 'first']).toContain(mapped)
      if (trip.journey === 'return') {
        expect(trip.tripLengthDays).toBeGreaterThan(0)
      } else {
        expect(trip.tripLengthDays).toBeUndefined()
      }
      expect(trip.pointsRequired).toBeGreaterThan(0)
      expect(trip.typicalCashEur).toBeGreaterThan(0)
      expect(trip.note.toLowerCase()).toContain('sample')
    }
    expect(TRIP_CATALOG.some((t) => t.destinationIata === 'JNB' && t.cabin === 'Business')).toBe(true)
  })

  it('builds a custom trip from airport codes without adding it to the catalog', () => {
    expect(TRIP_CATALOG.some((t) => t.id === CUSTOM_TRIP_ID)).toBe(false)
    expect(isCustomTripComplete(DEFAULT_CUSTOM_TRIP)).toBe(false)
    const trip = buildCustomTrip({
      ...DEFAULT_CUSTOM_TRIP,
      destination: 'Lisbon',
      destinationIata: 'lis',
    })
    expect(trip.id).toBe(CUSTOM_TRIP_ID)
    expect(trip.destinationIata).toBe('LIS')
    expect(trip.journey).toBe('return')
    expect(trip.tripLengthDays).toBe(7)
    expect(isCustomTripComplete({ ...DEFAULT_CUSTOM_TRIP, destinationIata: 'LIS' })).toBe(true)
  })
})
