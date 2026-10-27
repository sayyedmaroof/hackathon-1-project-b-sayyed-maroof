import { CARD_CATALOG, getCatalogCard } from '@/lib/cards/catalog'
import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import type {
  CatalogCardId,
  PointCurrencyId,
  RevolutPlanId,
  UserCard,
} from '@/lib/cards/types'

export function toggleCardId(selected: CatalogCardId[], id: CatalogCardId): CatalogCardId[] {
  return selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]
}

export function walletCardsFromSelection(
  selected: CatalogCardId[],
  revolutPlan: RevolutPlanId,
): UserCard[] {
  return selected.map((cardId) => ({
    cardId,
    revolutPlan: cardId === 'revolut' ? revolutPlan : null,
  }))
}

export type ProgramBalanceRow = {
  currency: PointCurrencyId
  programName: string
  cardNames: string[]
}

export function programBalanceRows(selected: CatalogCardId[]): ProgramBalanceRow[] {
  const byCurrency = new Map<PointCurrencyId, string[]>()
  for (const id of selected) {
    const card = getCatalogCard(id)
    if (!card) continue
    const names = byCurrency.get(card.currency) ?? []
    names.push(card.name)
    byCurrency.set(card.currency, names)
  }
  return [...byCurrency.entries()].map(([currency, cardNames]) => ({
    currency,
    programName: POINT_CURRENCIES[currency].displayName,
    cardNames,
  }))
}

export function catalogCardIds(): CatalogCardId[] {
  return CARD_CATALOG.map((c) => c.id)
}

export function cardsStepComplete(selected: CatalogCardId[]): boolean {
  return selected.length > 0
}
