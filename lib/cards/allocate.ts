import { REVOLUT_PLAN_EARN, getCatalogCard } from './catalog'
import type {
  CatalogCard,
  PointCurrencyId,
  SpendCategory,
  UserCard,
  UserSpendProfile,
} from './types'

const CATEGORIES: SpendCategory[] = ['groceries', 'travel', 'dining', 'fuel', 'other']

export type EarnRate = {
  card: CatalogCard
  userCard: UserCard
  rate: number
}

function effectiveCard(card: CatalogCard, userCard: UserCard, category: SpendCategory): number {
  if (card.id === 'revolut' && userCard.revolutPlan) {
    const plan = REVOLUT_PLAN_EARN[userCard.revolutPlan]
    const base = plan.baseEarnPerEur
    if (userCard.revolutPlan === 'ultra' && category === 'other') {
      return Math.max(base, card.categoryEarn?.other ?? base)
    }
    return base
  }
  return card.categoryEarn?.[category] ?? card.baseEarnPerEur
}

function rankedCards(userCards: UserCard[], category: SpendCategory): EarnRate[] {
  const rates: EarnRate[] = []
  for (const uc of userCards) {
    const card = getCatalogCard(uc.cardId)
    if (!card) continue
    rates.push({ card, userCard: uc, rate: effectiveCard(card, uc, category) })
  }
  return rates.sort((a, b) => b.rate - a.rate)
}

export type MonthlyEarnByCurrency = Map<PointCurrencyId, number>

export function allocateSpend(userCards: UserCard[], spend: UserSpendProfile): MonthlyEarnByCurrency {
  const caps = new Map<string, number>()
  for (const uc of userCards) {
    const card = getCatalogCard(uc.cardId)
    if (card?.monthlyCapPoints != null) caps.set(card.id, card.monthlyCapPoints)
  }

  const earned = new Map<PointCurrencyId, number>()
  const capUsed = new Map<string, number>()

  const categorySpend: Record<SpendCategory, number> = {
    groceries: spend.groceriesEur,
    travel: spend.travelEur,
    dining: spend.diningEur,
    fuel: spend.fuelEur,
    other: spend.otherEur,
  }

  for (const category of CATEGORIES) {
    let eurosLeft = Math.max(0, categorySpend[category])
    if (eurosLeft <= 0) continue
    const ranked = rankedCards(userCards, category)
    for (const { card, userCard, rate } of ranked) {
      if (eurosLeft <= 0) break
      if (rate <= 0) continue
      let capLeft = Infinity
      if (card.monthlyCapPoints != null) {
        const used = capUsed.get(card.id) ?? 0
        capLeft = Math.max(0, card.monthlyCapPoints - used)
      }
      if (capLeft <= 0) continue
      const maxPtsFromEuros = Math.floor(eurosLeft * rate)
      const pts = Math.min(maxPtsFromEuros, capLeft)
      if (pts <= 0) continue
      const eurosUsed = pts / rate
      eurosLeft -= eurosUsed
      earned.set(card.currency, (earned.get(card.currency) ?? 0) + pts)
      capUsed.set(card.id, (capUsed.get(card.id) ?? 0) + pts)
    }
  }

  return earned
}

export function earnPerMonthInTarget(
  userCards: UserCard[],
  spend: UserSpendProfile,
  target: PointCurrencyId,
  convertFn: (balances: { currency: PointCurrencyId; balance: number }[]) => number,
): number {
  const byCurrency = allocateSpend(userCards, spend)
  const asBalances = [...byCurrency.entries()].map(([currency, balance]) => ({ currency, balance }))
  return convertFn(asBalances)
}
