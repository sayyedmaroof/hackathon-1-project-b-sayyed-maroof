import { CARD_CATALOG, REVOLUT_PLAN_EARN } from './catalog'
import { TOP_UP_EUR_PER_POINT, WELCOME_BONUS_MONTHS } from './constants'
import { centsPerPointFor } from './currencies'
import { earnPerMonthInTarget } from './allocate'
import { monthsToTarget, netSavingEur } from './net-saving'
import type {
  AwardTarget,
  CatalogCard,
  PlanOption,
  PointCurrencyId,
  RevolutPlanId,
  UserCard,
  UserWallet,
} from './types'

function monthlyFee(card: CatalogCard, revolutPlan: RevolutPlanId | null): number {
  if (card.id === 'revolut' && revolutPlan) return REVOLUT_PLAN_EARN[revolutPlan].monthlyFeeEur
  if (card.monthlyFeeEur != null) return card.monthlyFeeEur
  if (card.annualFeeEur != null) return card.annualFeeEur / 12
  return 0
}

function welcomeEligible(card: CatalogCard, monthlyTotal: number): boolean {
  if (card.welcomeBonusPoints <= 0) return true
  if (card.welcomeBonusMinSpend <= 0) return true
  return monthlyTotal * WELCOME_BONUS_MONTHS >= card.welcomeBonusMinSpend
}

function bookNowOption(target: AwardTarget, reachable: number): PlanOption {
  const ownedUsed = Math.min(reachable, target.pointsRequired)
  const saving = netSavingEur(
    target.cashPriceEur,
    target.taxesEur,
    target.pointsRequired,
    ownedUsed,
    0,
    target.currency,
  )
  return {
    kind: 'book_now',
    description: 'Book now with your current balances',
    pointsAcquired: 0,
    costEur: target.taxesEur,
    months: 0,
    netSavingEur: saving,
    warnings: [],
  }
}

function earnOption(
  target: AwardTarget,
  wallet: UserWallet,
  shortfallPts: number,
  reachable: number,
  convertToTarget: (balances: { currency: PointCurrencyId; balance: number }[]) => number,
): PlanOption | null {
  const ppm = earnPerMonthInTarget(wallet.cards, wallet.spend, target.currency, convertToTarget)
  const months = monthsToTarget(shortfallPts, ppm)
  if (!Number.isFinite(months) || months <= 0) return null
  const ownedUsed = Math.min(reachable, target.pointsRequired)
  const saving = netSavingEur(
    target.cashPriceEur,
    target.taxesEur,
    target.pointsRequired,
    ownedUsed,
    0,
    target.currency,
  )
  return {
    kind: 'earn_with_current_cards',
    description: `Earn with your current cards in about ${months} month${months === 1 ? '' : 's'} (existing spend only)`,
    pointsAcquired: shortfallPts,
    costEur: target.taxesEur,
    months,
    netSavingEur: saving,
    warnings: [],
  }
}

function topUpOption(target: AwardTarget, shortfallPts: number, reachable: number): PlanOption | null {
  if (shortfallPts <= 0) return null
  if (shortfallPts >= target.pointsRequired * 0.15) return null
  const cost = shortfallPts * TOP_UP_EUR_PER_POINT
  const ownedUsed = Math.min(reachable, target.pointsRequired)
  const saving = netSavingEur(
    target.cashPriceEur,
    target.taxesEur,
    target.pointsRequired,
    ownedUsed,
    cost,
    target.currency,
  )
  const warnings: string[] = []
  if (saving <= 0) warnings.push('Top-up is not recommended at this price')
  return {
    kind: 'top_up',
    description: `Buy ${shortfallPts.toLocaleString()} points to cover the gap`,
    pointsAcquired: shortfallPts,
    costEur: target.taxesEur + cost,
    months: 0,
    netSavingEur: saving,
    warnings,
  }
}

function newCardOptions(
  target: AwardTarget,
  wallet: UserWallet,
  shortfallPts: number,
  reachable: number,
  convertToTarget: (balances: { currency: PointCurrencyId; balance: number }[]) => number,
): PlanOption[] {
  const ownedIds = new Set(wallet.cards.map((c) => c.cardId))
  const out: PlanOption[] = []
  const monthlyTotal = wallet.spend.monthlyTotalEur

  for (const card of CARD_CATALOG) {
    if (ownedIds.has(card.id)) continue
    if (card.welcomeBonusPoints > 0 && !welcomeEligible(card, monthlyTotal)) continue
    const plans: (RevolutPlanId | null)[] = card.id === 'revolut' ? ['premium', 'metal', 'ultra'] : [null]
    for (const plan of plans) {
      const hypothetical: UserCard = { cardId: card.id, revolutPlan: plan }
      const ppm = earnPerMonthInTarget([...wallet.cards, hypothetical], wallet.spend, target.currency, convertToTarget)
      let bonus = welcomeEligible(card, monthlyTotal) ? card.welcomeBonusPoints : 0
      if (card.currency !== target.currency) {
        bonus = convertToTarget([{ currency: card.currency, balance: bonus }])
      }
      const effectivePpm = ppm + bonus / Math.max(1, monthsToTarget(shortfallPts - bonus, ppm))
      const months = monthsToTarget(Math.max(0, shortfallPts - bonus), ppm)
      const fee = monthlyFee(card, plan) * Math.max(1, months)
      const ownedUsed = Math.min(reachable, target.pointsRequired)
      const saving = netSavingEur(
        target.cashPriceEur,
        target.taxesEur,
        target.pointsRequired,
        ownedUsed,
        fee,
        target.currency,
      )
      const name = plan ? `${card.name} (${plan})` : card.name
      out.push({
        kind: 'new_card_or_plan',
        description: `Add ${name} — welcome bonus and earn over ~${months} months`,
        pointsAcquired: shortfallPts,
        costEur: target.taxesEur + fee,
        months: Math.max(1, months),
        netSavingEur: saving,
        warnings: card.verified ? [] : ['Illustrative earn rates for this card'],
      })
      void effectivePpm
    }
  }
  return out
}

function payCashOption(): PlanOption {
  return {
    kind: 'pay_cash',
    description: 'Pay the cash fare',
    pointsAcquired: 0,
    costEur: 0,
    months: 0,
    netSavingEur: 0,
    warnings: [],
  }
}

export function buildOptions(
  target: AwardTarget,
  wallet: UserWallet,
  reachable: number,
  shortfallPts: number,
  convertToTarget: (balances: { currency: PointCurrencyId; balance: number }[]) => number,
): PlanOption[] {
  const options: PlanOption[] = []
  if (shortfallPts <= 0) options.push(bookNowOption(target, reachable))
  else {
    const earn = earnOption(target, wallet, shortfallPts, reachable, convertToTarget)
    if (earn) options.push(earn)
    const top = topUpOption(target, shortfallPts, reachable)
    if (top) options.push(top)
    options.push(...newCardOptions(target, wallet, shortfallPts, reachable, convertToTarget))
  }
  options.push(payCashOption())
  return options
}

export function rankOptions(options: PlanOption[]): PlanOption[] {
  const sorted = [...options].sort((a, b) => {
    if (b.netSavingEur !== a.netSavingEur) return b.netSavingEur - a.netSavingEur
    return a.months - b.months
  })
  return sorted.map((o, i) => ({ ...o, recommended: i === 0 }))
}

export function pointsWorthAward(target: AwardTarget): boolean {
  const cents = centsPerPointFor(target.currency)
  const value = (target.pointsRequired * cents) / 100
  return target.cashPriceEur - target.taxesEur - value > 0
}
