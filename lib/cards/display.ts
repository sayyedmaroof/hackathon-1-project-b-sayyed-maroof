import type { CatalogCard } from './types'
import { POINT_CURRENCIES } from './currencies'

export function formatEarnPerEur(rate: number): string {
  if (rate <= 0) return '—'
  if (rate >= 1) return `${rate === Math.floor(rate) ? rate : rate.toFixed(1)} pt / €1`
  const euros = Math.round(1 / rate)
  return `1 pt / €${euros}`
}

export function cardEarnSummary(card: CatalogCard): string {
  return formatEarnPerEur(card.baseEarnPerEur)
}

export function currencyShortName(currencyId: CatalogCard['currency']): string {
  return POINT_CURRENCIES[currencyId].displayName.replace(/ Avios| RevPoints| Membership Rewards/g, '')
}
