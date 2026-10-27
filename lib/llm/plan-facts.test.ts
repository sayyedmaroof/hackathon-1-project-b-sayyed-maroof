import { afterEach, describe, expect, it } from 'vitest'
import type { UserWallet } from '@/lib/cards/types'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import { computeSpendPlan } from '@/lib/plan/engine'
import { getTrip } from '@/lib/trips/catalog'
import { buildPlanFacts } from './plan-facts'

const today = new Date('2027-01-15T12:00:00Z')
const travelDate = '2027-08-01'
const trip = getTrip('mad-jfk-business-return')!

const household: UserWallet = {
  cards: [
    { cardId: 'iberia_icon', revolutPlan: null },
    { cardId: 'revolut', revolutPlan: 'metal' },
  ],
  balances: [
    { currency: 'iberia_avios', balance: 0 },
    { currency: 'revolut_revpoints', balance: 0 },
  ],
  spend: SAMPLE_SPEND_PROFILE,
}

describe('buildPlanFacts', () => {
  const env = process.env.GROQ_API_KEY

  afterEach(() => {
    if (env === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = env
  })

  it('includes net saving and suggestion reasons and omits the schedule and env', () => {
    process.env.GROQ_API_KEY = 'secret-should-not-appear'
    const plan = computeSpendPlan({
      trip,
      wallet: household,
      travelDate,
      today,
      cashBaseline: { eur: 100, source: 'sample' },
    })
    const facts = buildPlanFacts({
      plan,
      tripLabel: trip.label,
      origin: trip.origin,
      destination: trip.destination,
      cabin: trip.cabin,
      travelDate,
    })
    expect(facts.netSavingEur).toBe(plan.netSavingEur)
    expect(facts.reachableAtReadyBy).toBe(plan.reachableAtReadyBy)
    expect(facts.suggestions.length).toBeGreaterThan(0)
    expect(facts.suggestions.every((s) => s.reason.length > 0)).toBe(true)
    expect(facts.suggestions[0]?.kind).toBeTruthy()
    expect(facts.assignments.every((a) => a.cardName && typeof a.eur === 'number')).toBe(true)
    expect(facts).not.toHaveProperty('schedule')
    const blob = JSON.stringify(facts)
    expect(blob).not.toContain('secret-should-not-appear')
    expect(blob).not.toMatch(/GROQ_|DUFFEL_|process\.env/)
    expect(blob).not.toContain('"monthIndex"')
  })
})
