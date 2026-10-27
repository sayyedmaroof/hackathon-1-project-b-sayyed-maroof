import { describe, expect, it } from 'vitest'
import { allocateSpend } from './allocate'
import { convertBalances } from './convert'
import { buildPlan } from './plan'
import { TRANSFER_EDGES } from './transfers'
import { TOP_UP_EUR_PER_POINT } from './constants'
import type { AwardTarget, UserWallet } from './types'

const baseTarget: AwardTarget = {
  currency: 'iberia_avios',
  pointsRequired: 10_000,
  taxesEur: 80,
  cashPriceEur: 500,
}

const emptyWallet: UserWallet = {
  cards: [],
  balances: [],
  spend: {
    monthlyTotalEur: 1500,
    groceriesEur: 400,
    travelEur: 200,
    diningEur: 250,
    fuelEur: 150,
    otherEur: 500,
  },
}

describe('buildPlan', () => {
  it('recommends book_now when balances cover the award', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'iberia_avios', balance: 12_000 }],
    }
    const plan = buildPlan(baseTarget, wallet)
    expect(plan.shortfall).toBe(0)
    expect(plan.recommended.kind).toBe('book_now')
  })

  it('uses BA bridge to reach Iberia Avios from BA balance', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'ba_avios', balance: 10_000 }],
    }
    const converted = convertBalances(wallet.balances, TRANSFER_EDGES, 'iberia_avios')
    expect(converted.reachable).toBeGreaterThanOrEqual(10_000)
    expect(converted.usedUnverifiedTransfers).toBe(false)
  })

  it('respects monthly cap overflow to next card', () => {
    const wallet: UserWallet = {
      cards: [
        { cardId: 'vueling_up', revolutPlan: null },
        { cardId: 'iberia_icon', revolutPlan: null },
      ],
      balances: [],
      spend: {
        monthlyTotalEur: 25_000,
        groceriesEur: 0,
        travelEur: 25_000,
        diningEur: 0,
        fuelEur: 0,
        otherEur: 0,
      },
    }
    const earned = allocateSpend(wallet.cards, wallet.spend)
    expect(earned.get('vueling_avios')).toBe(5000)
    expect((earned.get('iberia_avios') ?? 0)).toBeGreaterThan(0)
  })

  it('skips welcome bonus when spend cannot meet min spend in window', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      spend: { ...emptyWallet.spend, monthlyTotalEur: 100 },
    }
    const plan = buildPlan(
      { ...baseTarget, pointsRequired: 50_000, cashPriceEur: 2000 },
      wallet,
    )
    const newCards = plan.options.filter((o) => o.kind === 'new_card_or_plan')
    expect(newCards.every((o) => /Revolut/i.test(o.description))).toBe(true)
  })

  it('omits top-up when shortfall is 15% or more of requirement', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'iberia_avios', balance: 8000 }],
    }
    const plan = buildPlan(baseTarget, wallet)
    expect(plan.shortfall).toBe(2000)
    expect(plan.options.some((o) => o.kind === 'top_up')).toBe(false)
  })

  it('flags unverified transfers when Revolut balance needs Avios path', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'revolut_revpoints', balance: 15_000 }],
    }
    const converted = convertBalances(wallet.balances, TRANSFER_EDGES, 'iberia_avios')
    expect(converted.reachable).toBeGreaterThan(0)
    expect(converted.usedUnverifiedTransfers).toBe(true)
  })

  it('recommends pay_cash when points are not worth it', () => {
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'iberia_avios', balance: 100_000 }],
    }
    const plan = buildPlan(
      {
        currency: 'iberia_avios',
        pointsRequired: 100_000,
        taxesEur: 400,
        cashPriceEur: 450,
      },
      wallet,
    )
    expect(plan.recommended.kind).toBe('pay_cash')
  })

  it('rejects top-up when net saving would be negative', () => {
    const target: AwardTarget = {
      currency: 'iberia_avios',
      pointsRequired: 10_000,
      taxesEur: 350,
      cashPriceEur: 400,
    }
    const wallet: UserWallet = {
      ...emptyWallet,
      balances: [{ currency: 'iberia_avios', balance: 9500 }],
    }
    const plan = buildPlan(target, wallet)
    const top = plan.options.find((o) => o.kind === 'top_up')
    if (top) {
      expect(top.warnings.length).toBeGreaterThan(0)
      expect(top.netSavingEur).toBe(0)
    }
    expect(TOP_UP_EUR_PER_POINT).toBe(0.02)
  })
})
