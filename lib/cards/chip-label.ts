import { formatPoints } from '@/lib/savings'
import type { PointsPlan } from './types'
import { POINT_CURRENCIES } from './currencies'

export function awardChipLabel(plan: PointsPlan | null | undefined, currencyId?: string): string | null {
  if (!plan) return null
  if (plan.recommended.kind === 'pay_cash') return 'Not worth it vs cash'
  if (plan.shortfall <= 0 || plan.recommended.kind === 'book_now') return 'You can book this today'
  const unit = currencyId ? POINT_CURRENCIES[currencyId as keyof typeof POINT_CURRENCIES]?.displayName.split(' ').pop() : 'points'
  return `Short ${formatPoints(plan.shortfall)} ${unit ?? 'points'}`
}
