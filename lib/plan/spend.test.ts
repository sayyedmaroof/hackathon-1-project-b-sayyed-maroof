import { describe, expect, it } from 'vitest'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import {
  assignedSummary,
  parseSpendInput,
  putRestInOther,
  setMonthlyTotal,
  setSpendCategory,
} from './spend'

describe('spend reconciliation', () => {
  it('reports remainder when categories are under the total', () => {
    const spend = { ...SAMPLE_SPEND_PROFILE, monthlyTotalEur: 2000 }
    const summary = assignedSummary(spend)
    expect(summary.assigned).toBe(1500)
    expect(summary.remainder).toBe(500)
    expect(summary.exceeded).toBe(false)
  })

  it('puts the rest in Other', () => {
    const spend = putRestInOther({ ...SAMPLE_SPEND_PROFILE, monthlyTotalEur: 2000, otherEur: 500 })
    expect(spend.otherEur).toBe(1000)
    expect(assignedSummary(spend).remainder).toBe(0)
  })

  it('raises the total when categories exceed it', () => {
    const { spend, raisedTotal } = setSpendCategory(
      { ...SAMPLE_SPEND_PROFILE, monthlyTotalEur: 100 },
      'groceriesEur',
      400,
    )
    expect(raisedTotal).toBe(true)
    expect(spend.monthlyTotalEur).toBe(assignedSummary(spend).assigned)
  })

  it('does not lower categories when the total is reduced below assigned', () => {
    const next = setMonthlyTotal(SAMPLE_SPEND_PROFILE, 100)
    expect(next.monthlyTotalEur).toBe(1500)
  })

  it('parses typed amounts without leading zeros', () => {
    expect(parseSpendInput('01,500')).toBe(1500)
    expect(parseSpendInput('000')).toBe(0)
  })
})
