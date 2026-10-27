import { afterEach, describe, expect, it } from 'vitest'
import { duffelModeFromToken, getDuffelMode, liveBookingAllowed } from './duffel-client'
import { getProviderStatus } from './duffel'

describe('duffel mode', () => {
  const env = { ...process.env }

  afterEach(() => {
    process.env = { ...env }
  })

  it('maps token prefixes without exposing the token', () => {
    expect(duffelModeFromToken('duffel_test_abc')).toBe('test')
    expect(duffelModeFromToken('duffel_live_abc')).toBe('live')
    expect(duffelModeFromToken('other')).toBe('unknown')
    expect(duffelModeFromToken(undefined)).toBe('unknown')
  })

  it('reports provider status from the env prefix only', () => {
    delete process.env.DUFFEL_API_KEY
    expect(getProviderStatus()).toEqual({ duffel: 'missing_key', mode: 'unknown' })
    process.env.DUFFEL_API_KEY = 'duffel_test_x'
    expect(getProviderStatus()).toEqual({ duffel: 'ok', mode: 'test' })
    process.env.DUFFEL_API_KEY = 'not-a-duffel-key'
    expect(getProviderStatus()).toEqual({ duffel: 'error', mode: 'unknown' })
    expect(getDuffelMode()).toBe('unknown')
  })

  it('requires an explicit live booking flag', () => {
    process.env.DUFFEL_ALLOW_LIVE_BOOKING = 'true'
    expect(liveBookingAllowed()).toBe(true)
    process.env.DUFFEL_ALLOW_LIVE_BOOKING = 'false'
    expect(liveBookingAllowed()).toBe(false)
  })
})
