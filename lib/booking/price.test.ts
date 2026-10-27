import { describe, expect, it } from 'vitest'
import { computeSaving, offerExpired, priceChangedMessage, pricesEqual } from './price'

describe('booking price checks', () => {
  it('treats any amount or currency change as a change (tolerance 0)', () => {
    expect(pricesEqual({ amount: '120.50', currency: 'EUR' }, { amount: '120.50', currency: 'EUR' })).toBe(true)
    expect(pricesEqual({ amount: '120.50', currency: 'EUR' }, { amount: '121.50', currency: 'EUR' })).toBe(false)
    expect(pricesEqual({ amount: '120.50', currency: 'EUR' }, { amount: '120.50', currency: 'GBP' })).toBe(false)
    expect(priceChangedMessage({ amount: '130.00', currency: 'GBP' })).toBe(
      'The price changed to 130.00 GBP, confirm to continue',
    )
  })

  it('detects expired offers', () => {
    expect(offerExpired('2000-01-01T00:00:00Z')).toBe(true)
    expect(offerExpired('2099-01-01T00:00:00Z')).toBe(false)
  })

  it('does not add savings across currencies', () => {
    expect(computeSaving(200, 150, true)).toBe(50)
    expect(computeSaving(200, 150, false)).toBe(0)
  })
})
