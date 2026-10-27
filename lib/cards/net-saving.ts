import { centsPerPointFor } from './currencies'
import type { PointCurrencyId } from './types'

/** Net EUR saved vs paying cash after taxes and cost to acquire missing points. */
export function netSavingEur(
  cashPriceEur: number,
  taxesEur: number,
  pointsRequired: number,
  pointsOwnedUsed: number,
  acquisitionCostEur: number,
  currency: PointCurrencyId,
): number {
  const cents = centsPerPointFor(currency)
  const ownedValue = (Math.min(pointsOwnedUsed, pointsRequired) * cents) / 100
  const raw = cashPriceEur - taxesEur - ownedValue - acquisitionCostEur
  return Math.max(0, Math.round(raw))
}

export function monthsToTarget(shortfallPts: number, pointsPerMonth: number): number {
  if (shortfallPts <= 0) return 0
  if (pointsPerMonth <= 0) return Infinity
  return Math.ceil(shortfallPts / pointsPerMonth)
}

export const SPEND_HORIZONS = [1, 3, 6, 12] as const
