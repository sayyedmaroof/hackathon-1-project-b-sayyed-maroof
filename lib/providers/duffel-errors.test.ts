import { describe, expect, it } from 'vitest'
import { parseDuffelError, userMessageForDuffel } from './duffel-errors'
import rateLimit from './__fixtures__/error-rate-limit.json'

describe('Duffel error parsing', () => {
  it('reads errors[], request_id and status', () => {
    const error = parseDuffelError(429, rateLimit, 'header-id')
    expect(error.status).toBe(429)
    expect(error.type).toBe('rate_limit_error')
    expect(error.code).toBe('rate_limit_exceeded')
    expect(error.requestId).toBe('req_test_429')
    expect(error.userMessage()).toBe('Too many searches right now. Try again shortly.')
  })

  it('falls back to the x-request-id header', () => {
    const error = parseDuffelError(500, {}, 'Fs1ffv5Q')
    expect(error.requestId).toBe('Fs1ffv5Q')
    expect(error.code).toBe('unknown')
  })

  it('maps documented codes to user-safe text', () => {
    expect(userMessageForDuffel({ status: 422, type: 'invalid_state_error', code: 'offer_expired' })).toMatch(/expired/)
    expect(userMessageForDuffel({ status: 422, type: 'invalid_state_error', code: 'offer_no_longer_available' })).toMatch(
      /no longer available/,
    )
    expect(userMessageForDuffel({ status: 422, type: 'validation_error', code: 'validation_error' })).toMatch(/passenger/)
    expect(userMessageForDuffel({ status: 422, type: 'invalid_state_error', code: 'insufficient_balance' })).toMatch(/balance/)
    expect(userMessageForDuffel({ status: 504, type: 'airline_error', code: 'airline_internal' })).toMatch(/timed out/)
  })
})
