import { describe, expect, it } from 'vitest'
import { cashVersusHacked } from './value'

describe('cashVersusHacked', () => {
  it('sets hacked cost to taxes plus fees and the gap to cash minus that', () => {
    const result = cashVersusHacked({ cashEur: 410, taxesEur: 80, feesEur: 15 })
    expect(result.realCostEur).toBe(410)
    expect(result.hackedCostEur).toBe(95)
    expect(result.youSaveEur).toBe(315)
  })
})
