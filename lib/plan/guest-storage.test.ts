import { describe, expect, it } from 'vitest'
import { parseGuestWallet } from './guest-storage'

describe('parseGuestWallet', () => {
  it('loads the current cards array shape', () => {
    const wallet = parseGuestWallet({
      cards: [
        { cardId: 'iberia_icon', revolutPlan: null },
        { cardId: 'revolut', revolutPlan: 'metal' },
      ],
      balances: [{ currency: 'iberia_avios', balance: 1200 }],
      spend: {
        monthlyTotalEur: 1500,
        groceriesEur: 400,
        travelEur: 200,
        diningEur: 300,
        fuelEur: 100,
        otherEur: 500,
      },
    })
    expect(wallet?.cards).toHaveLength(2)
    expect(wallet?.cards[1]).toEqual({ cardId: 'revolut', revolutPlan: 'metal' })
    expect(wallet?.balances[0]?.balance).toBe(1200)
  })

  it('loads the old single-card shape without crashing', () => {
    const wallet = parseGuestWallet({
      cardId: 'iberia_icon',
      revolutPlan: null,
      spend: {
        monthlyTotalEur: 800,
        groceriesEur: 800,
        travelEur: 0,
        diningEur: 0,
        fuelEur: 0,
        otherEur: 0,
      },
    })
    expect(wallet).not.toBeNull()
    expect(wallet?.cards).toEqual([{ cardId: 'iberia_icon', revolutPlan: null }])
    expect(wallet?.balances).toEqual([])
  })

  it('returns null for invalid JSON objects', () => {
    expect(parseGuestWallet(null)).toBeNull()
    expect(parseGuestWallet({ spend: {} })).toBeNull()
    expect(parseGuestWallet({ cardId: 'not-a-card', spend: {} })).toBeNull()
  })
})
