import { describe, expect, it } from 'vitest'
import { nearbySearchAirports } from './nearby'

describe('nearbySearchAirports', () => {
  it('drops a nearby airport that is the other end of the trip', () => {
    expect(nearbySearchAirports('MAD', 'BCN')).toEqual(['VLC'])
    expect(nearbySearchAirports('BCN', 'MAD')).toEqual([])
    expect(nearbySearchAirports('LHR', 'JFK')).toEqual(['LGW'])
  })
})
