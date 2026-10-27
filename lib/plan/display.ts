import type { CashBaselineSource } from './cash-baseline'
import type { PlanStatus, PlanVerdict } from './types'

export function cashSourceLabel(source: CashBaselineSource): string {
  if (source === 'duffel_live') return 'Live fare'
  if (source === 'duffel_test') return 'Sandbox fare, not used'
  return 'Sample estimate'
}

export function statusLabel(status: PlanStatus): string {
  if (status === 'ready_now') return 'Ready now'
  if (status === 'on_track') return 'On track'
  if (status === 'short') return 'Short'
  return 'Out of reach'
}

export function verdictLabel(verdict: PlanVerdict): string {
  if (verdict === 'great') return 'Great value'
  if (verdict === 'good') return 'Good value'
  return 'Pay cash may be better'
}
