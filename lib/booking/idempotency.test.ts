import { describe, expect, it } from 'vitest'
import { reuseExistingBooking } from './idempotency'

describe('idempotent booking lookup', () => {
  it('returns a confirmed or pending row for the same offer', () => {
    expect(reuseExistingBooking({ id: 'b1', status: 'confirmed', providerRef: 'ABC' })).toEqual({
      id: 'b1',
      status: 'confirmed',
      providerRef: 'ABC',
    })
    expect(reuseExistingBooking({ id: 'b2', status: 'pending', providerRef: 'off_1' })?.id).toBe('b2')
  })

  it('ignores missing or failed rows so a new attempt can run', () => {
    expect(reuseExistingBooking(null)).toBeNull()
    expect(reuseExistingBooking({ id: 'b3', status: 'failed', providerRef: 'x' })).toBeNull()
  })
})
