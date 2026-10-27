import { describe, expect, it } from 'vitest'
import { planHeadline, planWindowSchedule } from './display'
import type { MonthRow, SpendPlan } from './types'

function row(over: Partial<MonthRow> & Pick<MonthRow, 'date' | 'monthIndex'>): MonthRow {
  return {
    pointsEarnedByCard: {},
    cumulativePointsInTripCurrency: 1000,
    ...over,
  }
}

describe('planWindowSchedule', () => {
  it('keeps only months up to ready-by and drops the 36-month tail', () => {
    const schedule = [
      row({ monthIndex: 0, date: '2026-10-01' }),
      row({ monthIndex: 1, date: '2026-11-01' }),
      row({ monthIndex: 8, date: '2027-05-01' }),
      row({ monthIndex: 9, date: '2027-06-01', projected: true }),
      row({ monthIndex: 40, date: '2030-04-01', projected: true }),
    ]
    const window = planWindowSchedule(schedule)
    expect(window.map((r) => r.date)).toEqual(['2026-10-01', '2026-11-01', '2027-05-01'])
    expect(window.every((r) => !r.projected)).toBe(true)
  })
})

describe('planHeadline', () => {
  it('names the ready-by shortfall instead of a vague out-of-reach line', () => {
    const plan = {
      status: 'unreachable',
      pointsRequired: 15000,
      reachableAtReadyBy: 2143,
      shortfall: 12857,
      readyByDate: '2027-05-12',
      targetReachedDate: null,
    } as SpendPlan
    expect(planHeadline(plan, 'Iberia Avios')).toBe(
      'You’ll have 2,143 of 15,000 Iberia Avios by 12 May 2027 — 12,857 short.',
    )
  })
})
