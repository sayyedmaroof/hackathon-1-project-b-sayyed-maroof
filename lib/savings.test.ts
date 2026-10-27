import { describe, expect, it } from 'vitest'
import { calculateSavings, savingsLabel, whyThisWorks } from './savings'

describe('calculateSavings', () => {
  it('subtracts the points value instead of treating cash minus fees as the saving', () => {
    const result = calculateSavings({ cash: 2500, fees: 350, points: 100_000 })

    expect(result.cashAvoided).toBe(2150)
    expect(result.pointsValue).toBe(1200)
    expect(result.netSaving).toBe(950)
    expect(result.savingPct).toBeCloseTo(0.38)
    expect(result.valuePerPoint).toBeCloseTo(2.15)
    expect(result.verdict).toBe('use_points')
    expect(Math.round(result.savingPct * 100)).not.toBe(86)
  })

  it('uses use_points when value per point is at least 1.2¢ and net saving is positive', () => {
    expect(calculateSavings({ cash: 200, fees: 0, points: 10_000 }).verdict).toBe('use_points')
    expect(calculateSavings({ cash: 121, fees: 0, points: 10_000 }).verdict).toBe('use_points')
    expect(calculateSavings({ cash: 119, fees: 0, points: 10_000 }).verdict).toBe('pay_cash')
    expect(savingsLabel('use_points')).toBe('Use points')
    expect(savingsLabel('pay_cash')).toBe('Pay cash')
  })

  it('stays finite when cash or points are zero', () => {
    const result = calculateSavings({ cash: 0, fees: 40, points: 0 })
    expect(result.savingPct).toBe(0)
    expect(result.valuePerPoint).toBe(0)
    expect(result.netSaving).toBe(-40)
    expect(result.verdict).toBe('pay_cash')
  })

  it('can return a negative net saving when fees and points outrun the cash fare', () => {
    const result = calculateSavings({ cash: 980, fees: 310, points: 80_000 })
    expect(result.netSaving).toBe(-290)
    expect(result.savingPct).toBeLessThan(0)
    expect(result.verdict).toBe('pay_cash')
  })
})

describe('whyThisWorks', () => {
  it('explains a strong award from the net value, not from cash minus fees', () => {
    const line = whyThisWorks({
      cash: 2500,
      fees: 350,
      points: 100_000,
      cabin: 'Business',
      program: 'Avios',
    })

    expect(line).toContain('2.15¢')
    expect(line.includes('86%')).toBe(false)
  })

  it('tells you to pay cash when the redemption is poor', () => {
    const line = whyThisWorks({
      cash: 980,
      fees: 310,
      points: 80_000,
      cabin: 'Economy',
      program: 'Avios',
    })

    expect(line).toMatch(/pay cash/)
    expect(line).toMatch(/0\.84¢/)
  })
})
