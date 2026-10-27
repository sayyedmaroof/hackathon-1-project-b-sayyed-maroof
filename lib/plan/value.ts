import { centsPerPointFor } from '@/lib/cards/currencies'
import { getCatalogCard } from '@/lib/cards/catalog'
import { REVOLUT_PLAN_EARN } from '@/lib/cards/catalog'
import type { CatalogCardId, PointCurrencyId, UserCard } from '@/lib/cards/types'
import { GREAT_MIN_EUR, GREAT_MIN_RATIO } from './constants'
import type { PlanVerdict } from './types'

export function cardWindowFeeEur(userCard: UserCard, months: number): number {
  if (months <= 0) return 0
  const card = getCatalogCard(userCard.cardId)
  if (!card) return 0
  let fees = 0
  if (card.id === 'revolut' && userCard.revolutPlan) {
    fees += REVOLUT_PLAN_EARN[userCard.revolutPlan].monthlyFeeEur * months
  } else if (card.monthlyFeeEur != null) {
    fees += card.monthlyFeeEur * months
  }
  if (card.annualFeeEur != null) {
    fees += (card.annualFeeEur * months) / 12
  }
  return fees
}

export function planWindowFeesEur(
  userCards: UserCard[],
  months: number,
  usedCardIds?: Iterable<CatalogCardId>,
): number {
  const used = usedCardIds ? new Set(usedCardIds) : null
  let fees = 0
  for (const uc of userCards) {
    if (used && !used.has(uc.cardId)) continue
    fees += cardWindowFeeEur(uc, months)
  }
  return fees
}

export function netSavingUnclamped(input: {
  cashEur: number
  taxesEur: number
  pointsRequired: number
  currency: PointCurrencyId
  feesEur: number
}): number {
  const pointsValue = (input.pointsRequired * centsPerPointFor(input.currency)) / 100
  return input.cashEur - input.taxesEur - pointsValue - input.feesEur
}

export function verdictFor(netSavingEur: number, cashEur: number): PlanVerdict {
  if (netSavingEur >= GREAT_MIN_EUR && cashEur > 0 && netSavingEur >= cashEur * GREAT_MIN_RATIO) {
    return 'great'
  }
  if (netSavingEur > 0) return 'good'
  return 'poor'
}
