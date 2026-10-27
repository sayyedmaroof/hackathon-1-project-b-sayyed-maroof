import { describe, expect, it, vi } from 'vitest'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import { computeSpendPlan } from '@/lib/plan/engine'
import { getTrip } from '@/lib/trips/catalog'

const insertValues = vi.fn()
insertValues.mockReturnValue({
  returning: vi.fn(async () => [{ id: 'plan-1' }]),
})

vi.mock('@/lib/auth/session', () => ({
  requireVerifiedUser: vi.fn(async () => ({
    id: 'user-abc',
    email: 'a@b.com',
    name: 'Test',
    emailVerifiedAt: new Date(),
  })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: insertValues })),
    select: vi.fn(),
    delete: vi.fn(),
  },
}))

const wallet = {
  cards: [{ cardId: 'iberia_icon' as const, revolutPlan: null }],
  balances: [],
  spend: SAMPLE_SPEND_PROFILE,
}

vi.mock('@/lib/cards/wallet-db', () => ({
  loadWalletForUser: vi.fn(async () => wallet),
}))

describe('savePlan', () => {
  it('stores the server-computed net saving, not the client figure', async () => {
    const { savePlan } = await import('@/app/actions/saved-plans')
    const trip = getTrip('mad-lis-economy-return')!
    const expected = computeSpendPlan({
      trip,
      wallet,
      travelDate: '2027-08-01',
      today: new Date(),
      readyByDaysBefore: 60,
    })
    const res = await savePlan({
      tripId: trip.id,
      travelDate: '2027-08-01',
      readyByDays: 60,
      netSavingEur: 99999,
      cashSource: 'sample',
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.netSavingEur).toBeCloseTo(expected.netSavingEur, 2)
    expect(res.netSavingEur).not.toBe(99999)
    const stored = insertValues.mock.calls[0]?.[0]
    expect(Number(stored.netSavingEur)).toBeCloseTo(expected.netSavingEur, 2)
    expect(stored.inputs.cardIds).toEqual(['iberia_icon'])
  })
})
