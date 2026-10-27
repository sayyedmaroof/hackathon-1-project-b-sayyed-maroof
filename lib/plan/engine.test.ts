import { describe, expect, it } from 'vitest'
import type { UserWallet } from '@/lib/cards/types'
import { getTrip, TRIP_CATALOG } from '@/lib/trips/catalog'
import { allocateTowardTrip } from './allocate'
import { computeSpendPlan, rankTripsForUser } from './engine'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'

const today = new Date('2027-01-15T12:00:00Z')
const travelDate = '2027-08-01'
const jfkBiz = getTrip('mad-jfk-business-return')!
const lisEco = getTrip('mad-lis-economy-return')!
const jnbBiz = getTrip('mad-jnb-business-return')!

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

describe('allocateTowardTrip', () => {
  it('ranks cards by value toward the trip currency', () => {
    const result = allocateTowardTrip(
      [
        { cardId: 'iberia_icon', revolutPlan: null },
        { cardId: 'amex_gold', revolutPlan: null },
      ],
      SAMPLE_SPEND_PROFILE,
      'iberia_avios',
    )
    expect(result.assignments.find((a) => a.category === 'dining')?.cardId).toBe('amex_gold')
    expect(result.eurosAssigned).toBeLessThanOrEqual(
      SAMPLE_SPEND_PROFILE.groceriesEur +
        SAMPLE_SPEND_PROFILE.travelEur +
        SAMPLE_SPEND_PROFILE.diningEur +
        SAMPLE_SPEND_PROFILE.fuelEur +
        SAMPLE_SPEND_PROFILE.otherEur +
        0.01,
    )
  })

  it('excludes a currency that cannot transfer to the trip', () => {
    const result = allocateTowardTrip(
      [{ cardId: 'air_europa_bankinter', revolutPlan: null }],
      SAMPLE_SPEND_PROFILE,
      'iberia_avios',
    )
    expect(result.assignments).toHaveLength(0)
    expect(result.unusedCards[0]?.reason).toMatch(/does not help/)
  })

  it('overflows remaining spend to the next card when a cap is hit', () => {
    const spend = {
      monthlyTotalEur: 80000,
      groceriesEur: 0,
      travelEur: 80000,
      diningEur: 0,
      fuelEur: 0,
      otherEur: 0,
    }
    const result = allocateTowardTrip(
      [
        { cardId: 'vueling_up', revolutPlan: null },
        { cardId: 'iberia_icon', revolutPlan: null },
      ],
      spend,
      'iberia_avios',
    )
    const vuelingPts = result.assignments
      .filter((a) => a.cardId === 'vueling_up')
      .reduce((s, a) => s + a.pointsNative, 0)
    expect(vuelingPts).toBe(5000)
    expect(result.assignments.some((a) => a.cardId === 'iberia_icon')).toBe(true)
  })
})

describe('computeSpendPlan', () => {
  it('is ready_now when current balances cover the trip', () => {
    const plan = computeSpendPlan({
      trip: lisEco,
      wallet: {
        ...household,
        balances: [{ currency: 'iberia_avios', balance: 20000 }],
      },
      travelDate,
      today,
    })
    expect(plan.status).toBe('ready_now')
    expect(plan.shortfall).toBe(0)
  })

  it('is unreachable with no cards or a past date', () => {
    const none = computeSpendPlan({
      trip: jfkBiz,
      wallet: { cards: [], balances: [], spend: SAMPLE_SPEND_PROFILE },
      travelDate,
      today,
    })
    expect(none.status).toBe('unreachable')

    const past = computeSpendPlan({
      trip: jfkBiz,
      wallet: household,
      travelDate: '2020-01-01',
      today,
    })
    expect(past.status).toBe('unreachable')
  })

  it('never assigns more spend than the profile', () => {
    const plan = computeSpendPlan({ trip: jfkBiz, wallet: household, travelDate, today })
    const assigned = plan.assignments.reduce((s, a) => s + a.eur, 0)
    expect(assigned).toBeLessThanOrEqual(1500.05)
  })

  it('shows a negative net saving without clamping', () => {
    const plan = computeSpendPlan({
      trip: jfkBiz,
      wallet: household,
      travelDate,
      today,
      cashBaseline: { eur: 100, source: 'sample' },
    })
    expect(plan.netSavingEur).toBeLessThan(0)
    expect(plan.verdict).toBe('poor')
    expect(plan.suggestions.some((s) => s.kind === 'pay_cash')).toBe(true)
  })

  it('offers a welcome bonus when min spend is met on the user profile', () => {
    const plan = computeSpendPlan({
      trip: lisEco,
      wallet: {
        cards: [{ cardId: 'revolut', revolutPlan: 'premium' }],
        balances: [],
        spend: SAMPLE_SPEND_PROFILE,
      },
      travelDate,
      today,
    })
    expect(plan.suggestions.some((s) => s.kind === 'add_card')).toBe(true)
  })
})

describe('rankTripsForUser', () => {
  const rich: UserWallet = {
    cards: [{ cardId: 'iberia_icon', revolutPlan: null }],
    balances: [
      { currency: 'iberia_avios', balance: 200000 },
      { currency: 'ba_avios', balance: 200000 },
    ],
    spend: SAMPLE_SPEND_PROFILE,
  }

  it('orders reachable trips by net saving', () => {
    const ranking = rankTripsForUser([jfkBiz, jnbBiz, lisEco], rich, travelDate, today)
    expect(ranking.best?.tripId).toBeTruthy()
    expect(ranking.reachable[0]?.netSavingEur).toBeGreaterThanOrEqual(
      ranking.reachable[1]?.netSavingEur ?? -Infinity,
    )
  })

  it('lets a live baseline change net saving and the best trip', () => {
    const sample = rankTripsForUser([jfkBiz, jnbBiz], rich, travelDate, today)
    expect(sample.best?.tripId).toBe('mad-jfk-business-return')
    const live = rankTripsForUser([jfkBiz, jnbBiz], rich, travelDate, today, {
      'mad-jfk-business-return': { eur: 1, source: 'duffel_live', fetchedAt: today.toISOString() },
    })
    const jfkLive = live.reachable.find((r) => r.tripId === jfkBiz.id)
    const jnbLive = live.reachable.find((r) => r.tripId === jnbBiz.id)
    expect(jfkLive?.netSavingEur).toBeLessThan(
      sample.reachable.find((r) => r.tripId === jfkBiz.id)!.netSavingEur,
    )
    expect(jnbLive?.status === 'ready_now' || jnbLive?.status === 'on_track').toBe(true)
    expect(jnbLive!.netSavingEur).toBeGreaterThan(jfkLive!.netSavingEur)
    expect(live.best?.tripId).toBe('mad-jnb-business-return')
  })

  it('does not let a sandbox baseline change eur or ranking', () => {
    const sample = rankTripsForUser([jfkBiz, jnbBiz], rich, travelDate, today)
    const sandbox = rankTripsForUser([jfkBiz, jnbBiz], rich, travelDate, today, {
      'mad-jfk-business-return': {
        eur: jfkBiz.typicalCashEur,
        source: 'duffel_test',
        note: 'Sandbox fare EUR 50 not used',
      },
    })
    expect(sandbox.best?.tripId).toBe(sample.best?.tripId)
    expect(sandbox.reachable.find((r) => r.tripId === jfkBiz.id)?.netSavingEur).toBe(
      sample.reachable.find((r) => r.tripId === jfkBiz.id)?.netSavingEur,
    )
  })
})

describe('trip catalog size used by ranking', () => {
  it('ranks the full catalog without calling network', () => {
    const ranking = rankTripsForUser(TRIP_CATALOG, household, travelDate, today)
    expect(ranking.reachable.length + ranking.almost.length + ranking.outOfReach.length).toBe(
      TRIP_CATALOG.length,
    )
  })
})
