import { describe, expect, it } from 'vitest'
import { saveBalancesSchema, saveSpendProfileSchema, saveWalletSchema } from './schemas'

describe('wallet zod schemas', () => {
  it('rejects balance above 10_000_000', () => {
    const result = saveBalancesSchema.safeParse({
      balances: [{ currency: 'iberia_avios', balance: 10_000_001 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects spend above 100_000', () => {
    const result = saveSpendProfileSchema.safeParse({
      monthlyTotalEur: 100_001,
      groceriesEur: 0,
      travelEur: 0,
      diningEur: 0,
      fuelEur: 0,
      otherEur: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid wallet cards', () => {
    const result = saveWalletSchema.safeParse({
      cards: [{ cardId: 'revolut', revolutPlan: 'metal' }],
    })
    expect(result.success).toBe(true)
  })
})
