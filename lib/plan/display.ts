import type { CashBaselineSource } from './cash-baseline'
import { formatPlanDate } from './dates'
import type { MonthRow, PlanStatus, PlanVerdict, SpendPlan } from './types'

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

export function formatPoints(n: number): string {
  return Math.round(n).toLocaleString('en-GB')
}

/** Months that count toward the trip. Extra projection after ready-by is omitted. */
export function planWindowSchedule(schedule: MonthRow[]): MonthRow[] {
  const window = schedule.filter((row) => !row.projected)
  return window.length ? window : schedule.slice(0, 1)
}

export function planHeadline(plan: SpendPlan, program: string): string {
  const have = formatPoints(plan.reachableAtReadyBy)
  const need = formatPoints(plan.pointsRequired)
  const ready = formatPlanDate(plan.readyByDate)
  if (plan.status === 'ready_now') return `You already have ${need} ${program}.`
  if (plan.status === 'on_track') {
    return `You’ll have ${have} ${program} by ${ready} — enough for this trip.`
  }
  const short = formatPoints(plan.shortfall)
  return `You’ll have ${have} of ${need} ${program} by ${ready} — ${short} short.`
}
