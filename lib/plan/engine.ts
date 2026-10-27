import { CARD_CATALOG, getCatalogCard } from '@/lib/cards/catalog'
import { convertBalances } from '@/lib/cards/convert'
import { TRANSFER_EDGES } from '@/lib/cards/transfers'
import { TOP_UP_EUR_PER_POINT, WELCOME_BONUS_MONTHS } from '@/lib/cards/constants'
import type { CatalogCardId, UserBalance, UserWallet } from '@/lib/cards/types'
import type { SampleTrip } from '@/lib/trips/catalog'
import { getTrip, TRIP_CATALOG } from '@/lib/trips/catalog'
import { allocateTowardTrip } from './allocate'
import { cashBaselineForTrip, type CashBaseline } from './cash-baseline'
import {
  ALMOST_SHORTFALL_RATIO,
  READY_BY_DAYS_DEFAULT,
  READY_BY_DAYS_MAX,
  READY_BY_DAYS_MIN,
  TOP_UP_MAX_SHORTFALL_RATIO,
} from './constants'
import { addDaysYmd, formatPlanDate, parseYmd, utcYmd, wholeMonthsBetween } from './dates'
import { transferPathRatio } from './path'
import { categorySum } from './spend'
import type {
  MonthRow,
  PlanStatus,
  PlanSuggestion,
  SpendPlan,
  SuggestionAfter,
  TripRanking,
} from './types'
import { cardWindowFeeEur, netSavingUnclamped, planWindowFeesEur, verdictFor } from './value'

const MAX_EXTRA_MONTHS = 36

const STATUS_RANK: Record<PlanStatus, number> = {
  unreachable: 0,
  short: 1,
  on_track: 2,
  ready_now: 3,
}

export type BuildPlanInput = {
  trip: SampleTrip
  wallet: UserWallet
  travelDate: string
  today: Date
  readyByDaysBefore?: number
  cashBaseline?: CashBaseline
  cashBaselines?: Record<string, CashBaseline>
  includeSuggestions?: boolean
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

function usedCardIds(assignments: SpendPlan['assignments']): CatalogCardId[] {
  return [...new Set(assignments.filter((a) => a.eur > 0).map((a) => a.cardId))]
}

function mergeUnused(
  wallet: UserWallet,
  unusedFromAlloc: SpendPlan['unusedCards'],
  used: CatalogCardId[],
  months: number,
): SpendPlan['unusedCards'] {
  const usedSet = new Set(used)
  const byId = new Map(unusedFromAlloc.map((u) => [u.cardId, { ...u }]))
  for (const uc of wallet.cards) {
    if (usedSet.has(uc.cardId)) continue
    const existing = byId.get(uc.cardId)
    const fee = cardWindowFeeEur(uc, months)
    const feeNote =
      fee > 0 ? 'not counted, card not used for this trip' : 'not counted, card not used for this trip'
    if (existing) {
      if (!existing.reason.includes('does not help')) existing.reason = feeNote
      else if (!existing.reason.includes('not counted')) {
        existing.reason = `${existing.reason}; ${feeNote}`
      }
    } else {
      const card = getCatalogCard(uc.cardId)
      byId.set(uc.cardId, {
        cardId: uc.cardId,
        name: card?.name ?? uc.cardId,
        reason: feeNote,
      })
    }
  }
  return [...byId.values()]
}

function month0(today: Date, starting: number): MonthRow {
  return {
    monthIndex: 0,
    date: monthDate(today, 0),
    pointsEarnedByCard: {},
    cumulativePointsInTripCurrency: starting,
    projected: false,
  }
}

function finishPlan(
  input: BuildPlanInput,
  base: Omit<SpendPlan, 'suggestions' | 'verdict' | 'cashSource' | 'cashBaseline' | 'netSavingEur'> & {
    netSavingEur?: number
  },
  cashBaseline: CashBaseline,
  withSuggestions: boolean,
): SpendPlan {
  const used = usedCardIds(base.assignments)
  const fees = planWindowFeesEur(input.wallet.cards, base.monthsAvailable, used)
  const netSavingEur = netSavingUnclamped({
    cashEur: cashBaseline.eur,
    taxesEur: input.trip.taxesEur,
    pointsRequired: input.trip.pointsRequired,
    currency: input.trip.awardCurrency,
    feesEur: fees,
  })
  const unusedCards = mergeUnused(input.wallet, base.unusedCards, used, base.monthsAvailable)
  const plan: SpendPlan = {
    ...base,
    unusedCards,
    netSavingEur,
    verdict: verdictFor(netSavingEur, cashBaseline.eur),
    cashSource: cashBaseline.source,
    cashBaseline,
    suggestions: [],
  }
  if (withSuggestions) {
    plan.suggestions = buildSuggestions(input, plan)
  }
  return plan
}

export function computeSpendPlan(input: BuildPlanInput): SpendPlan {
  const withSuggestions = input.includeSuggestions !== false
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

  const empty = (status: PlanStatus, message: string, extra: Partial<SpendPlan> = {}): SpendPlan => {
    const monthsAvailable = extra.monthsAvailable ?? 0
    return finishPlan(
      input,
      {
        tripId: input.trip.id,
        status,
        message,
        monthsAvailable,
        readyByDate: extra.readyByDate ?? todayYmd,
        shortfall: Math.max(0, input.trip.pointsRequired - converted.reachable),
        reachableAtReadyBy: extra.reachableAtReadyBy ?? converted.reachable,
        monthTargetReached: extra.monthTargetReached ?? null,
        targetReachedDate: extra.targetReachedDate ?? null,
        monthsLate: extra.monthsLate ?? null,
        assignments: allocation.assignments,
        unusedCards: allocation.unusedCards,
        schedule: extra.schedule ?? [month0(input.today, converted.reachable)],
        usedUnverifiedData,
        pointsRequired: input.trip.pointsRequired,
        awardCurrency: input.trip.awardCurrency,
      },
      cashBaseline,
      withSuggestions,
    )
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
  const startRow = month0(input.today, converted.reachable)

  if (converted.reachable >= input.trip.pointsRequired) {
    return finishPlan(
      input,
      {
        tripId: input.trip.id,
        status: 'ready_now',
        message: 'You already have enough points for this trip.',
        monthsAvailable,
        readyByDate,
        shortfall: 0,
        reachableAtReadyBy: converted.reachable,
        monthTargetReached: 0,
        targetReachedDate: startRow.date,
        monthsLate: 0,
        assignments: allocation.assignments,
        unusedCards: allocation.unusedCards,
        schedule: [startRow],
        usedUnverifiedData,
        pointsRequired: input.trip.pointsRequired,
        awardCurrency: input.trip.awardCurrency,
      },
      cashBaseline,
      withSuggestions,
    )
  }

  if (monthsAvailable === 0) {
    return empty('unreachable', 'The ready-by date is too close to earn more points.', {
      readyByDate,
      monthsAvailable: 0,
      schedule: [startRow],
    })
  }

  if (input.wallet.cards.length === 0) {
    return empty('unreachable', 'Add at least one card to build a spend plan.', {
      readyByDate,
      monthsAvailable,
      schedule: [startRow],
    })
  }

  const profileSpend = categorySum(input.wallet.spend)
  if (profileSpend <= 0 || allocation.monthlyPointsInTrip <= 0) {
    return empty('unreachable', 'There is no earning spend on cards that help this trip.', {
      readyByDate,
      monthsAvailable,
      schedule: [startRow],
    })
  }

  const balances: UserBalance[] = input.wallet.balances.map((b) => ({ ...b }))
  const schedule: MonthRow[] = [startRow]
  let monthTargetReached: number | null = null
  let targetReachedDate: string | null = null
  let reachableAtReadyBy = converted.reachable
  const byCardEarn: Record<string, number> = {}
  for (const row of allocation.assignments) {
    byCardEarn[row.cardId] = (byCardEarn[row.cardId] ?? 0) + row.pointsInTripCurrency
  }

  const totalMonths = monthsAvailable + MAX_EXTRA_MONTHS
  for (let i = 0; i < totalMonths; i++) {
    for (const [currency, pts] of allocation.monthlyEarnByCurrency) {
      const existing = balances.find((b) => b.currency === currency)
      if (existing) existing.balance += pts
      else balances.push({ currency, balance: pts })
    }
    const { reachable } = convertBalances(balances, TRANSFER_EDGES, input.trip.awardCurrency)
    const projected = i >= monthsAvailable
    if (!projected) reachableAtReadyBy = reachable
    const date = monthDate(input.today, i + 1)
    schedule.push({
      monthIndex: i + 1,
      date,
      pointsEarnedByCard: { ...byCardEarn },
      cumulativePointsInTripCurrency: reachable,
      projected,
    })
    if (monthTargetReached == null && reachable >= input.trip.pointsRequired) {
      monthTargetReached = i + 1
      targetReachedDate = date
      if (projected) break
    }
  }

  const shortfall = Math.max(0, input.trip.pointsRequired - reachableAtReadyBy)
  let status: PlanStatus
  let message: string
  let monthsLate: number | null = null

  if (shortfall === 0 || (monthTargetReached != null && monthTargetReached <= monthsAvailable)) {
    status = 'on_track'
    message =
      monthTargetReached != null
        ? `You reach the target in month ${monthTargetReached}.`
        : `You can have ${input.trip.pointsRequired.toLocaleString('en-GB')} points by your ready-by date.`
    monthsLate = 0
  } else if (monthTargetReached != null && targetReachedDate) {
    monthsLate = Math.max(0, monthTargetReached - monthsAvailable)
    status = 'short'
    const lateLabel = monthsLate === 1 ? '1 month' : `${monthsLate} months`
    message = `You would reach it on ${formatPlanDate(targetReachedDate)}, ${lateLabel} after your ready-by date`
  } else {
    status = 'unreachable'
    message = 'This trip is out of reach with the current spend and cards.'
  }

  return finishPlan(
    input,
    {
      tripId: input.trip.id,
      status,
      message,
      monthsAvailable,
      readyByDate,
      shortfall,
      reachableAtReadyBy,
      monthTargetReached,
      targetReachedDate,
      monthsLate,
      assignments: allocation.assignments,
      unusedCards: allocation.unusedCards,
      schedule,
      usedUnverifiedData,
      pointsRequired: input.trip.pointsRequired,
      awardCurrency: input.trip.awardCurrency,
    },
    cashBaseline,
    withSuggestions,
  )
}

function suggestionAfter(plan: SpendPlan, extras?: Partial<SuggestionAfter>): SuggestionAfter {
  return {
    status: plan.status,
    netSavingEur: plan.netSavingEur,
    targetDate: plan.targetReachedDate ?? undefined,
    extraPointsPerMonth: extras?.extraPointsPerMonth,
    extraPointsOneOff: extras?.extraPointsOneOff,
    monthsSaved: extras?.monthsSaved,
  }
}

function improves(current: SpendPlan, after: SpendPlan): boolean {
  return (
    STATUS_RANK[after.status] > STATUS_RANK[current.status] || after.netSavingEur > current.netSavingEur + 0.005
  )
}

function simulated(input: BuildPlanInput, patch: Partial<BuildPlanInput>): SpendPlan {
  return computeSpendPlan({ ...input, ...patch, includeSuggestions: false })
}

function naiveMonthlyPoints(wallet: UserWallet, tripCurrency: SampleTrip['awardCurrency']): number {
  const first = wallet.cards[0]
  if (!first) return 0
  return allocateTowardTrip([first], wallet.spend, tripCurrency).monthlyPointsInTrip
}

function buildSuggestions(input: BuildPlanInput, current: SpendPlan): PlanSuggestion[] {
  const suggestions: PlanSuggestion[] = []
  const naive = naiveMonthlyPoints(input.wallet, input.trip.awardCurrency)
  const extra = current.assignments.length
    ? allocateTowardTrip(input.wallet.cards, input.wallet.spend, input.trip.awardCurrency)
        .monthlyPointsInTrip - naive
    : 0
  if (extra > 0 && input.wallet.cards.length > 1) {
    const firstOnly = simulated(input, {
      wallet: { ...input.wallet, cards: [input.wallet.cards[0]!] },
    })
    if (improves(firstOnly, current)) {
      suggestions.push({
        kind: 'reallocate',
        reason: `Use the highest-value card per category for ${extra.toLocaleString('en-GB')} extra points a month.`,
        after: suggestionAfter(current, { extraPointsPerMonth: extra }),
        delta: {
          statusImproved: STATUS_RANK[current.status] > STATUS_RANK[firstOnly.status],
          netSavingEur: current.netSavingEur - firstOnly.netSavingEur,
        },
        apply: { kind: 'reallocate' },
      })
    }
  }

  const owned = new Set(input.wallet.cards.map((c) => c.cardId))
  const monthlySpend = categorySum(input.wallet.spend)
  for (const card of CARD_CATALOG) {
    if (owned.has(card.id)) continue
    const path = transferPathRatio(card.currency, input.trip.awardCurrency)
    if (!path) continue
    if (card.welcomeBonusMinSpend > monthlySpend * WELCOME_BONUS_MONTHS) continue
    const addedCard = {
      cardId: card.id,
      revolutPlan: card.id === 'revolut' ? ('premium' as const) : null,
    }
    const bonusBalances =
      monthlySpend * WELCOME_BONUS_MONTHS >= card.welcomeBonusMinSpend
        ? [
            ...input.wallet.balances,
            { currency: card.currency, balance: card.welcomeBonusPoints },
          ]
        : input.wallet.balances
    const after = simulated(input, {
      wallet: {
        ...input.wallet,
        cards: [...input.wallet.cards, addedCard],
        balances: bonusBalances,
      },
    })
    if (!improves(current, after)) continue
    const bonusInTrip = Math.floor(card.welcomeBonusPoints * path.ratio)
    suggestions.push({
      kind: 'add_card',
      reason: `Add ${card.name}: welcome bonus is reachable on your own spend within ${WELCOME_BONUS_MONTHS} months.`,
      after: suggestionAfter(after, { extraPointsOneOff: bonusInTrip }),
      delta: {
        statusImproved: STATUS_RANK[after.status] > STATUS_RANK[current.status],
        netSavingEur: after.netSavingEur - current.netSavingEur,
      },
      apply: { kind: 'add_card', cardId: card.id },
    })
  }

  if (
    current.shortfall > 0 &&
    current.shortfall / input.trip.pointsRequired <= TOP_UP_MAX_SHORTFALL_RATIO
  ) {
    const cost = current.shortfall * TOP_UP_EUR_PER_POINT
    const toppedBalances = [
      ...input.wallet.balances,
      { currency: input.trip.awardCurrency, balance: current.shortfall },
    ]
    const afterRaw = simulated(input, {
      wallet: { ...input.wallet, balances: toppedBalances },
    })
    const after: SpendPlan = {
      ...afterRaw,
      netSavingEur: afterRaw.netSavingEur - cost,
      verdict: verdictFor(afterRaw.netSavingEur - cost, afterRaw.cashBaseline.eur),
    }
    if (improves(current, after)) {
      suggestions.push({
        kind: 'top_up',
        reason: `Top up ${current.shortfall.toLocaleString('en-GB')} points (shortfall under 15%).`,
        after: suggestionAfter(after, { extraPointsOneOff: current.shortfall }),
        delta: {
          statusImproved: STATUS_RANK[after.status] > STATUS_RANK[current.status],
          netSavingEur: after.netSavingEur - current.netSavingEur,
        },
        apply: { kind: 'top_up', points: current.shortfall },
      })
    }
  }

  const ranking = rankTripsForUser(
    TRIP_CATALOG,
    input.wallet,
    input.travelDate,
    input.today,
    input.cashBaselines,
    input.readyByDaysBefore,
  )
  const cheaper = ranking.best ?? ranking.reachable[0] ?? ranking.almost[0]
  if (cheaper && cheaper.tripId !== input.trip.id) {
    const trip = getTrip(cheaper.tripId)
    if (trip) {
      const after = simulated(input, { trip })
      if (improves(current, after)) {
        suggestions.push({
          kind: 'cheaper_trip',
          reason: `Consider ${trip.label} — a closer or cheaper sample trip.`,
          after: suggestionAfter(after),
          delta: {
            statusImproved: STATUS_RANK[after.status] > STATUS_RANK[current.status],
            netSavingEur: after.netSavingEur - current.netSavingEur,
          },
          apply: { kind: 'switch_trip', tripId: trip.id },
        })
      }
    }
  }

  if (current.netSavingEur <= 0) {
    suggestions.push({
      kind: 'pay_cash',
      reason: 'Points are not worth more than paying cash on this trip.',
      after: suggestionAfter(current),
      delta: { statusImproved: false, netSavingEur: 0 },
      apply: { kind: 'pay_cash' },
    })
  }

  return suggestions.sort((a, b) => {
    if (a.delta.statusImproved !== b.delta.statusImproved) {
      return a.delta.statusImproved ? -1 : 1
    }
    return b.after.netSavingEur - a.after.netSavingEur
  })
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
      includeSuggestions: false,
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
  const outOfReach = ranked.filter((r) => !reachable.includes(r) && !almost.includes(r))
  const best = reachable.find((r) => r.netSavingEur > 0) ?? null
  return {
    best,
    reachable,
    almost,
    outOfReach,
  }
}

