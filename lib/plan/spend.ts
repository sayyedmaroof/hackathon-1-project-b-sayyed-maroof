import type { UserSpendProfile } from '@/lib/cards/types'

export const SPEND_CATEGORY_KEYS = [
  'groceriesEur',
  'travelEur',
  'diningEur',
  'fuelEur',
  'otherEur',
] as const

export type SpendCategoryField = (typeof SPEND_CATEGORY_KEYS)[number]

export function categorySum(spend: Pick<UserSpendProfile, SpendCategoryField>): number {
  return (
    spend.groceriesEur + spend.travelEur + spend.diningEur + spend.fuelEur + spend.otherEur
  )
}

export function assignedSummary(spend: UserSpendProfile): {
  assigned: number
  total: number
  remainder: number
  exceeded: boolean
} {
  const assigned = categorySum(spend)
  const total = Math.max(0, spend.monthlyTotalEur)
  return {
    assigned,
    total,
    remainder: Math.max(0, total - assigned),
    exceeded: assigned > total + 0.005,
  }
}

export function setMonthlyTotal(spend: UserSpendProfile, total: number): UserSpendProfile {
  const monthlyTotalEur = Math.max(0, total)
  const assigned = categorySum(spend)
  if (assigned > monthlyTotalEur) {
    return { ...spend, monthlyTotalEur: assigned }
  }
  return { ...spend, monthlyTotalEur }
}

export function setSpendCategory(
  spend: UserSpendProfile,
  key: SpendCategoryField,
  value: number,
): { spend: UserSpendProfile; raisedTotal: boolean } {
  const next = { ...spend, [key]: Math.max(0, value) }
  const assigned = categorySum(next)
  if (assigned > next.monthlyTotalEur) {
    return { spend: { ...next, monthlyTotalEur: assigned }, raisedTotal: true }
  }
  return { spend: next, raisedTotal: false }
}

export function putRestInOther(spend: UserSpendProfile): UserSpendProfile {
  const { remainder } = assignedSummary(spend)
  if (remainder <= 0) return spend
  return { ...spend, otherEur: spend.otherEur + remainder }
}

export function formatThousands(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return Math.round(value).toLocaleString('en-GB')
}

export function parseSpendInput(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return 0
  return Number(cleaned.replace(/^0+(?=\d)/, ''))
}
