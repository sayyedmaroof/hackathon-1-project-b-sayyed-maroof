import { describe, expect, it } from 'vitest'
import { mapPlaceSuggestions, searchLocalPlaces } from './places'

describe('place search', () => {
  it('finds London airports in the sample list', () => {
    const hits = searchLocalPlaces('london')
    expect(hits.some((h) => h.iata === 'LHR')).toBe(true)
    expect(hits.every((h) => h.city.toLowerCase() === 'london' || h.name.toLowerCase().includes('london'))).toBe(true)
  })

  it('maps Duffel suggestions without leaking place ids', () => {
    const hits = mapPlaceSuggestions([
      {
        id: 'arp_lhr_gb',
        type: 'airport',
        name: 'Heathrow',
        iata_code: 'lhr',
        iata_country_code: 'GB',
        city_name: 'London',
      },
      { id: 'cit_lon_gb', type: 'city', name: 'London', iata_code: 'LON' },
    ])
    expect(hits).toEqual([
      { iata: 'LHR', city: 'London', name: 'Heathrow', country: 'GB', kind: 'airport' },
    ])
    expect(JSON.stringify(hits)).not.toContain('arp_')
  })
})
