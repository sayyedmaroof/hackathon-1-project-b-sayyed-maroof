import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateSavings, savingsLabel, whyThisWorks } from './savings.ts'

describe('calculateSavings', () => {
  it('subtracts the points value instead of treating cash minus fees as the saving', () => {
    const result = calculateSavings({ cash: 2500, fees: 350, points: 100_000 })

    assert.equal(result.cashAvoided, 2150)
    assert.equal(result.pointsValue, 1200)
    assert.equal(result.netSaving, 950)
    assert.equal(result.savingPct, 0.38)
    assert.equal(result.valuePerPoint, 2.15)
    assert.equal(result.verdict, 'great')
    assert.notEqual(Math.round(result.savingPct * 100), 86)
  })

  it('uses the 2.0¢ and 1.2¢ boundaries for the verdict', () => {
    assert.equal(calculateSavings({ cash: 200, fees: 0, points: 10_000 }).verdict, 'great')
    assert.equal(calculateSavings({ cash: 120, fees: 0, points: 10_000 }).verdict, 'good')
    assert.equal(calculateSavings({ cash: 119, fees: 0, points: 10_000 }).verdict, 'poor')
    assert.equal(savingsLabel('great'), 'Use points')
    assert.equal(savingsLabel('good'), 'Use points')
    assert.equal(savingsLabel('poor'), 'Pay cash')
  })

  it('stays finite when cash or points are zero', () => {
    const result = calculateSavings({ cash: 0, fees: 40, points: 0 })
    assert.equal(result.savingPct, 0)
    assert.equal(result.valuePerPoint, 0)
    assert.equal(result.netSaving, -40)
    assert.equal(result.verdict, 'poor')
  })

  it('can return a negative net saving when fees and points outrun the cash fare', () => {
    const result = calculateSavings({ cash: 980, fees: 310, points: 80_000 })
    assert.equal(result.netSaving, -290)
    assert.ok(result.savingPct < 0)
    assert.equal(result.verdict, 'poor')
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

    assert.equal(
      line,
      'Business class on an Avios chart is cheaper than cash at this price (2.15¢ per point).',
    )
    assert.equal(line.includes('86%'), false)
  })

  it('tells you to pay cash when the redemption is poor', () => {
    const line = whyThisWorks({
      cash: 980,
      fees: 310,
      points: 80_000,
      cabin: 'Economy',
      program: 'Avios',
    })

    assert.match(line, /pay cash/)
    assert.match(line, /0\.84¢/)
  })
})
