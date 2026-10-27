import { REVOLUT_PLAN_EARN, getCatalogCard } from '@/lib/cards/catalog'
import type {
  CatalogCard,
  CatalogCardId,
  PointCurrencyId,
  SpendCategory,
  UserCard,
  UserSpendProfile,
} from '@/lib/cards/types'
import { transferPathRatio } from './path'

const CATEGORIES: SpendCategory[] = ['groceries', 'travel', 'dining', 'fuel', 'other']

export function effectiveEarnRate(card: CatalogCard, userCard: UserCard, category: SpendCategory): number {
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

export type CategoryAssignment = {
  category: SpendCategory
  eur: number
  cardId: CatalogCardId
  cardName: string
  pointsNative: number
  pointsInTripCurrency: number
}

export type UnusedCard = {
  cardId: CatalogCardId
  name: string
  reason: string
}

export type TripAllocation = {
  assignments: CategoryAssignment[]
  unusedCards: UnusedCard[]
  monthlyEarnByCurrency: Map<PointCurrencyId, number>
  monthlyPointsInTrip: number
  eurosAssigned: number
  eurosProfile: number
  usedUnverifiedPath: boolean
}

export function allocateTowardTrip(
  userCards: UserCard[],
  spend: UserSpendProfile,
  tripCurrency: PointCurrencyId,
): TripAllocation {
  const unusedCards: UnusedCard[] = []
  const usable: {
    userCard: UserCard
    card: CatalogCard
    path: { ratio: number; verified: boolean }
  }[] = []

  for (const userCard of userCards) {
    const card = getCatalogCard(userCard.cardId)
    if (!card) continue
    const path = transferPathRatio(card.currency, tripCurrency)
    if (!path) {
      unusedCards.push({
        cardId: card.id,
        name: card.name,
        reason: 'does not help this trip',
      })
      continue
    }
    usable.push({ userCard, card, path })
  }

  const caps = new Map<string, number>()
  for (const { card } of usable) {
    if (card.monthlyCapPoints != null) caps.set(card.id, card.monthlyCapPoints)
  }

  const categorySpend: Record<SpendCategory, number> = {
    groceries: spend.groceriesEur,
    travel: spend.travelEur,
    dining: spend.diningEur,
    fuel: spend.fuelEur,
    other: spend.otherEur,
  }

  const assignments: CategoryAssignment[] = []
  const earned = new Map<PointCurrencyId, number>()
  const capUsed = new Map<string, number>()
  let eurosAssigned = 0
  let usedUnverifiedPath = false

  for (const category of CATEGORIES) {
    let eurosLeft = Math.max(0, categorySpend[category])
    if (eurosLeft <= 0) continue
    const ranked = [...usable].sort((a, b) => {
      const va = effectiveEarnRate(a.card, a.userCard, category) * a.path.ratio
      const vb = effectiveEarnRate(b.card, b.userCard, category) * b.path.ratio
      return vb - va
    })
    for (const { userCard, card, path } of ranked) {
      if (eurosLeft <= 0) break
      const rate = effectiveEarnRate(card, userCard, category)
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
      if (eurosUsed > eurosLeft + 1e-9) break
      eurosLeft -= eurosUsed
      eurosAssigned += eurosUsed
      earned.set(card.currency, (earned.get(card.currency) ?? 0) + pts)
      capUsed.set(card.id, (capUsed.get(card.id) ?? 0) + pts)
      if (!path.verified) usedUnverifiedPath = true
      assignments.push({
        category,
        eur: Math.round(eurosUsed * 100) / 100,
        cardId: card.id,
        cardName: card.name,
        pointsNative: pts,
        pointsInTripCurrency: Math.floor(pts * path.ratio),
      })
    }
  }

  const eurosProfile =
    spend.groceriesEur + spend.travelEur + spend.diningEur + spend.fuelEur + spend.otherEur

  const monthlyPointsInTrip = assignments.reduce((sum, a) => sum + a.pointsInTripCurrency, 0)

  return {
    assignments,
    unusedCards,
    monthlyEarnByCurrency: earned,
    monthlyPointsInTrip,
    eurosAssigned,
    eurosProfile,
    usedUnverifiedPath,
  }
}
