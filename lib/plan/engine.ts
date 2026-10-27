import { CARD_CATALOG, getCatalogCard } from '@/lib/cards/catalog'
import { convertBalances } from '@/lib/cards/convert'
import { TRANSFER_EDGES } from '@/lib/cards/transfers'
import { TOP_UP_EUR_PER_POINT, WELCOME_BONUS_MONTHS } from '@/lib/cards/constants'
import type { UserWallet } from '@/lib/cards/types'
import type { SampleTrip } from '@/lib/trips/catalog'
import { TRIP_CATALOG } from '@/lib/trips/catalog'
import { allocateTowardTrip } from './allocate'
import { cashBaselineForTrip, type CashBaseline } from './cash-baseline'
import {
  ALMOST_SHORTFALL_RATIO,
  READY_BY_DAYS_DEFAULT,
  READY_BY_DAYS_MAX,
  READY_BY_DAYS_MIN,
  TOP_UP_MAX_SHORTFALL_RATIO,
} from './constants'
import { addDaysYmd, parseYmd, utcYmd, wholeMonthsBetween } from './dates'
import { transferPathRatio } from './path'
import type { MonthRow, PlanStatus, PlanSuggestion, SpendPlan, TripRanking } from './types'
import { netSavingUnclamped, planWindowFeesEur, verdictFor } from './value'

export type BuildPlanInput = {
  trip: SampleTrip
  wallet: UserWallet
  travelDate: string
  today: Date
  readyByDaysBefore?: number
  cashBaseline?: CashBaseline
  cashBaselines?: Record<string, CashBaseline>
}

function clampReadyBy(days: number | undefined): number {
  const n = days ?? READY_BY_DAYS_DEFAULT
  return Math.min(READY_BY_DAYS_MAX, Math.max(READY_BY_DAYS_MIN, Math.round(n)))
}

function convertTo(wallet: UserWallet, currency: SampleTrip['awardCurrency']) {
  return convertBalances(wallet.balances, TRANSFER_EDGES, currency)
}

function monthDate(today: Date, index: number): string {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + index, 1))
  return utcYmd(d)
}

export function computeSpendPlan(input: BuildPlanInput): SpendPlan {
  const readyByDays = clampReadyBy(input.readyByDaysBefore)
  const cashBaseline =
    input.cashBaseline ?? cashBaselineForTrip(input.trip, input.cashBaselines)
  const travel = parseYmd(input.travelDate)
  const todayYmd = utcYmd(input.today)
  const allocation = allocateTowardTrip(
    input.wallet.cards,
    input.wallet.spend,
    input.trip.awardCurrency,
  )
  const converted = convertTo(input.wallet, input.trip.awardCurrency)
  const usedUnverifiedData =
    allocation.usedUnverifiedPath ||
    converted.usedUnverifiedTransfers ||
    input.wallet.cards.some((c) => getCatalogCard(c.cardId)?.verified === false)

  const empty = (
    status: PlanStatus,
    message: string,
    extra: Partial<SpendPlan> = {},
  ): SpendPlan => {
    const monthsAvailable = extra.monthsAvailable ?? 0
    const fees = planWindowFeesEur(input.wallet.cards, monthsAvailable)
    const netSavingEur = netSavingUnclamped({
      cashEur: cashBaseline.eur,
      taxesEur: input.trip.taxesEur,
      pointsRequired: input.trip.pointsRequired,
      currency: input.trip.awardCurrency,
      feesEur: fees,
    })
    return {
      tripId: input.trip.id,
      status,
      message,
      monthsAvailable,
      readyByDate: extra.readyByDate ?? todayYmd,
      shortfall: Math.max(0, input.trip.pointsRequired - converted.reachable),
      reachableAtReadyBy: extra.reachableAtReadyBy ?? converted.reachable,
      monthTargetReached: extra.monthTargetReached ?? null,
      assignments: allocation.assignments,
      unusedCards: allocation.unusedCards,
      schedule: extra.schedule ?? [],
      netSavingEur,
      verdict: verdictFor(netSavingEur, cashBaseline.eur),
      cashSource: cashBaseline.source,
      cashBaseline,
      suggestions: extra.suggestions ?? [],
      usedUnverifiedData,
      pointsRequired: input.trip.pointsRequired,
      awardCurrency: input.trip.awardCurrency,
    }
  }

  if (!travel) {
    return empty('unreachable', 'Enter a valid travel date.')
  }
  if (input.travelDate < todayYmd) {
    return empty('unreachable', 'That travel date is in the past.')
  }

  const readyByDate = addDaysYmd(input.travelDate, -readyByDays)
  const readyBy = parseYmd(readyByDate) ?? travel
  const monthsAvailable = wholeMonthsBetween(input.today, readyBy)

  if (converted.reachable >= input.trip.pointsRequired) {
    const fees = planWindowFeesEur(input.wallet.cards, monthsAvailable)
    const netSavingEur = netSavingUnclamped({
      cashEur: cashBaseline.eur,
      taxesEur: input.trip.taxesEur,
      pointsRequired: input.trip.pointsRequired,
      currency: input.trip.awardCurrency,
      feesEur: fees,
    })
    const suggestions = buildSuggestions({
      trip: input.trip,
      wallet: input.wallet,
      allocationMonthly: allocation.monthlyPointsInTrip,
      shortfall: 0,
      netSavingEur,
      monthsAvailable,
      status: 'ready_now',
    })
    return {
      tripId: input.trip.id,
      status: 'ready_now',
      message: 'You already have enough points for this trip.',
      monthsAvailable,
      readyByDate,
      shortfall: 0,
      reachableAtReadyBy: converted.reachable,
      monthTargetReached: 0,
      assignments: allocation.assignments,
      unusedCards: allocation.unusedCards,
      schedule: [],
      netSavingEur,
      verdict: verdictFor(netSavingEur, cashBaseline.eur),
      cashSource: cashBaseline.source,
      cashBaseline,
      suggestions,
      usedUnverifiedData,
      pointsRequired: input.trip.pointsRequired,
      awardCurrency: input.trip.awardCurrency,
    }
  }

  if (monthsAvailable === 0) {
    return empty('unreachable', 'The ready-by date is too close to earn more points.', {
      readyByDate,
      monthsAvailable: 0,
    })
  }

  if (input.wallet.cards.length === 0) {
    return empty('unreachable', 'Add at least one card to build a spend plan.', {
      readyByDate,
      monthsAvailable,
    })
  }

  const profileSpend =
    input.wallet.spend.groceriesEur +
    input.wallet.spend.travelEur +
    input.wallet.spend.diningEur +
    input.wallet.spend.fuelEur +
    input.wallet.spend.otherEur
  if (profileSpend <= 0 || allocation.monthlyPointsInTrip <= 0) {
    return empty('unreachable', 'There is no earning spend on cards that help this trip.', {
      readyByDate,
      monthsAvailable,
    })
  }

  const balances = input.wallet.balances.map((b) => ({ ...b }))
  const schedule: MonthRow[] = []
  let monthTargetReached: number | null = null
  let reachableAtReadyBy = converted.reachable

  for (let i = 0; i < monthsAvailable; i++) {
    for (const [currency, pts] of allocation.monthlyEarnByCurrency) {
      const existing = balances.find((b) => b.currency === currency)
      if (existing) existing.balance += pts
      else balances.push({ currency, balance: pts })
    }
    const { reachable } = convertBalances(balances, TRANSFER_EDGES, input.trip.awardCurrency)
    reachableAtReadyBy = reachable
    const byCard: Record<string, number> = {}
    for (const row of allocation.assignments) {
      byCard[row.cardId] = (byCard[row.cardId] ?? 0) + row.pointsInTripCurrency
    }
    schedule.push({
      monthIndex: i,
      date: monthDate(input.today, i),
      pointsEarnedByCard: byCard,
      cumulativePointsInTripCurrency: reachable,
    })
    if (monthTargetReached == null && reachable >= input.trip.pointsRequired) {
      monthTargetReached = i + 1
    }
  }

  const shortfall = Math.max(0, input.trip.pointsRequired - reachableAtReadyBy)
  let status: PlanStatus
  let message: string
  if (shortfall === 0) {
    status = 'on_track'
    message = `You can have ${input.trip.pointsRequired.toLocaleString('en-GB')} points by your ready-by date.`
  } else if (monthTargetReached != null) {
    status = 'on_track'
    message = `You reach the target in month ${monthTargetReached}.`
  } else {
    const extraMonths =
      allocation.monthlyPointsInTrip > 0
        ? Math.ceil(shortfall / allocation.monthlyPointsInTrip)
        : Infinity
    if (Number.isFinite(extraMonths) && extraMonths < 36) {
      status = 'short'
      message = `Short by ${shortfall.toLocaleString('en-GB')} points at the ready-by date.`
    } else {
      status = 'unreachable'
      message = 'This trip is out of reach with the current spend and cards.'
    }
  }

  const fees = planWindowFeesEur(input.wallet.cards, monthsAvailable)
  const netSavingEur = netSavingUnclamped({
    cashEur: cashBaseline.eur,
    taxesEur: input.trip.taxesEur,
    pointsRequired: input.trip.pointsRequired,
    currency: input.trip.awardCurrency,
    feesEur: fees,
  })

  const suggestions = buildSuggestions({
    trip: input.trip,
    wallet: input.wallet,
    allocationMonthly: allocation.monthlyPointsInTrip,
    shortfall,
    netSavingEur,
    monthsAvailable,
    status,
  })

  return {
    tripId: input.trip.id,
    status,
    message,
    monthsAvailable,
    readyByDate,
    shortfall,
    reachableAtReadyBy,
    monthTargetReached,
    assignments: allocation.assignments,
    unusedCards: allocation.unusedCards,
    schedule,
    netSavingEur,
    verdict: verdictFor(netSavingEur, cashBaseline.eur),
    cashSource: cashBaseline.source,
    cashBaseline,
    suggestions,
    usedUnverifiedData,
    pointsRequired: input.trip.pointsRequired,
    awardCurrency: input.trip.awardCurrency,
  }
}

function naiveMonthlyPoints(wallet: UserWallet, tripCurrency: SampleTrip['awardCurrency']): number {
  const first = wallet.cards[0]
  if (!first) return 0
  const only = allocateTowardTrip([first], wallet.spend, tripCurrency)
  return only.monthlyPointsInTrip
}

function buildSuggestions(input: {
  trip: SampleTrip
  wallet: UserWallet
  allocationMonthly: number
  shortfall: number
  netSavingEur: number
  monthsAvailable: number
  status: PlanStatus
}): PlanSuggestion[] {
  const suggestions: PlanSuggestion[] = []
  const naive = naiveMonthlyPoints(input.wallet, input.trip.awardCurrency)
  const extra = input.allocationMonthly - naive
  if (extra > 0 && input.wallet.cards.length > 1) {
    suggestions.push({
      kind: 'reallocate',
      reason: `Use the highest-value card per category for ${extra.toLocaleString('en-GB')} extra points a month.`,
      netSavingEur: input.netSavingEur,
      extraPoints: extra,
    })
  }

  const owned = new Set(input.wallet.cards.map((c) => c.cardId))
  const monthlyTotal = input.wallet.spend.monthlyTotalEur
  for (const card of CARD_CATALOG) {
    if (owned.has(card.id)) continue
    const path = transferPathRatio(card.currency, input.trip.awardCurrency)
    if (!path) continue
    if (card.welcomeBonusMinSpend > monthlyTotal * WELCOME_BONUS_MONTHS) continue
    const fee =
      (card.annualFeeEur ?? 0) +
      (card.monthlyFeeEur ?? 0) * Math.max(input.monthsAvailable, WELCOME_BONUS_MONTHS)
    const bonusInTrip = Math.floor(card.welcomeBonusPoints * path.ratio)
    const bonusValueEur = bonusInTrip * 0.012
    if (bonusValueEur < fee) continue
    const simulated = allocateTowardTrip(
      [...input.wallet.cards, { cardId: card.id, revolutPlan: card.id === 'revolut' ? 'premium' : null }],
      input.wallet.spend,
      input.trip.awardCurrency,
    )
    suggestions.push({
      kind: 'add_card',
      reason: `Add ${card.name}: welcome bonus is reachable on your own spend within ${WELCOME_BONUS_MONTHS} months.`,
      netSavingEur: input.netSavingEur - fee,
      extraPoints: bonusInTrip + Math.max(0, simulated.monthlyPointsInTrip - input.allocationMonthly),
      cardId: card.id,
    })
  }

  if (
    input.shortfall > 0 &&
    input.shortfall / input.trip.pointsRequired <= TOP_UP_MAX_SHORTFALL_RATIO
  ) {
    const cost = input.shortfall * TOP_UP_EUR_PER_POINT
    const saving = input.netSavingEur - cost
    if (saving > 0) {
      suggestions.push({
        kind: 'top_up',
        reason: `Top up ${input.shortfall.toLocaleString('en-GB')} points (shortfall under 15%).`,
        netSavingEur: saving,
      })
    }
  }

  const cheaper = TRIP_CATALOG.filter(
    (t) => t.id !== input.trip.id && t.typicalCashEur < input.trip.typicalCashEur,
  )[0]
  if (cheaper && (input.status === 'short' || input.status === 'unreachable')) {
    suggestions.push({
      kind: 'cheaper_trip',
      reason: `Consider ${cheaper.label} — a closer or cheaper sample trip.`,
      netSavingEur: input.netSavingEur,
      tripId: cheaper.id,
    })
  }

  if (input.netSavingEur <= 0) {
    suggestions.push({
      kind: 'pay_cash',
      reason: 'Points are not worth more than paying cash on this trip.',
      netSavingEur: input.netSavingEur,
    })
  }

  return suggestions.sort((a, b) => b.netSavingEur - a.netSavingEur)
}

export function rankTripsForUser(
  trips: SampleTrip[],
  wallet: UserWallet,
  travelDate: string,
  today: Date,
  cashBaselines?: Record<string, CashBaseline>,
  readyByDaysBefore?: number,
): TripRanking {
  const ranked = trips.map((trip) => {
    const plan = computeSpendPlan({
      trip,
      wallet,
      travelDate,
      today,
      readyByDaysBefore,
      cashBaselines,
    })
    return {
      tripId: trip.id,
      status: plan.status,
      netSavingEur: plan.netSavingEur,
      shortfall: plan.shortfall,
      pointsRequired: trip.pointsRequired,
      cashSource: plan.cashSource,
    }
  })

  const reachable = ranked
    .filter((r) => r.status === 'on_track' || r.status === 'ready_now')
    .sort((a, b) => b.netSavingEur - a.netSavingEur)
  const almost = ranked
    .filter(
      (r) =>
        r.status === 'short' &&
        r.pointsRequired > 0 &&
        r.shortfall / r.pointsRequired <= ALMOST_SHORTFALL_RATIO,
    )
    .sort((a, b) => a.shortfall - b.shortfall)
  const outOfReach = ranked.filter(
    (r) => !reachable.includes(r) && !almost.includes(r),
  )
  return {
    best: reachable[0] ?? null,
    reachable,
    almost,
    outOfReach,
  }
}
