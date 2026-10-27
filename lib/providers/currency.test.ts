import { describe, expect, it } from 'vitest'
import { formatMoney } from '@/lib/savings'

describe('currency display', () => {
  it('keeps Duffel amounts in their original currency', () => {
    expect(formatMoney(80, 'GBP')).toBe('GBP 80')
    expect(formatMoney(120, 'EUR')).toBe('€120')
    expect(formatMoney(100, 'USD')).toBe('USD 100')
  })
})
