import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetNarrationRateLimit } from '@/lib/plan/narration-rate-limit'
import type { PlanFacts } from '@/lib/llm/plan-facts'

const completeGroqText = vi.fn()
const groqConfigured = vi.fn(() => true)

vi.mock('@/lib/auth/session', () => ({
  getClientIp: async () => '203.0.113.9',
}))

vi.mock('@/lib/llm/groq', () => ({
  isGroqConfigured: () => groqConfigured(),
  completeGroqText: (...args: unknown[]) => completeGroqText(...args),
}))

const facts: PlanFacts = {
  tripLabel: 'Madrid to New York',
  origin: 'Madrid',
  destination: 'New York',
  cabin: 'Business',
  travelDate: '2027-08-01',
  status: 'on_track',
  message: 'On track',
  verdict: 'good',
  netSavingEur: 400,
  cashSource: 'sample',
  pointsRequired: 100000,
  reachableAtReadyBy: 100000,
  awardCurrency: 'iberia_avios',
  shortfall: 0,
  readyByDate: '2027-06-02',
  targetReachedDate: '2027-05-01',
  usedUnverifiedData: true,
  assignments: [{ category: 'dining', eur: 200, cardName: 'Iberia', points: 200 }],
  unusedCards: [{ name: 'Other card', reason: 'does not help this trip' }],
  suggestions: [
    { kind: 'pay_cash', reason: 'Cash is cheaper', delta: { statusImproved: false, netSavingEur: -10 } },
  ],
}

describe('plan narration actions', () => {
  beforeEach(() => {
    resetNarrationRateLimit()
    completeGroqText.mockReset()
    groqConfigured.mockReturnValue(true)
    completeGroqText.mockResolvedValue({ ok: true, text: 'A short summary.' })
  })

  it('returns unconfigured without calling Groq', async () => {
    groqConfigured.mockReturnValue(false)
    const { explainPlan } = await import('@/app/actions/plan-narration')
    const result = await explainPlan({ facts, locale: 'en' })
    expect(result).toEqual({ ok: false, reason: 'unconfigured' })
    expect(completeGroqText).not.toHaveBeenCalled()
  })

  it('rate-limits explain and ask together after the cap', async () => {
    const { explainPlan, askPlan } = await import('@/app/actions/plan-narration')
    for (let i = 0; i < 20; i++) {
      const result = await explainPlan({ facts, locale: 'en' })
      expect(result.ok).toBe(true)
    }
    const limited = await askPlan({
      facts,
      locale: 'en',
      messages: [{ role: 'user', text: 'Why this mix?' }],
    })
    expect(limited).toEqual({ ok: false, reason: 'rate_limited' })
    expect(completeGroqText).toHaveBeenCalledTimes(20)
  })

  it('rejects chat history that does not end on the user', async () => {
    const { askPlan } = await import('@/app/actions/plan-narration')
    const result = await askPlan({
      facts,
      locale: 'en',
      messages: [{ role: 'assistant', text: 'Hello' }],
    })
    expect(result).toEqual({ ok: false, reason: 'failed' })
    expect(completeGroqText).not.toHaveBeenCalled()
  })
})
