import { formatPoints } from './savings.ts'
import type { LoyaltyProgram, RevolutPlan } from './types.ts'

/** Euros of spend required for one RevPoint. */
export const REVOLUT_EURO_PER_POINT: Record<RevolutPlan, number> = {
  Premium: 4,
  Metal: 2,
  Ultra: 1,
}

export const LOYALTY_CATALOG: LoyaltyProgram[] = [
  { id: 'iberia', name: 'Iberia Avios', balance: 0, unit: 'Avios', note: 'Pooled with British Airways' },
  { id: 'ba', name: 'British Airways Avios', balance: 0, unit: 'Avios', note: 'Pooled with Iberia' },
  { id: 'qatar', name: 'Qatar Privilege Club', balance: 0, unit: 'Avios', note: 'Kept separate from Iberia and British Airways' },
  { id: 'revolut', name: 'Revolut RevPoints', balance: 0, unit: 'RevPoints', note: 'Earned on card spend' },
  { id: 'amex', name: 'Amex Membership Rewards', balance: 0, unit: 'points', note: 'Membership Rewards' },
]

export const AWARD_STEPS = [
  { id: 'space', label: 'Check that the award seat is still available' },
  { id: 'transfer', label: 'Transfer the points and wait for them to arrive' },
  { id: 'details', label: 'Confirm the passenger name matches the loyalty account' },
  { id: 'book', label: 'Book the award and keep the confirmation' },
] as const

export type AwardCurrency = 'avios' | 'qatar'

export function revolutRateLabel(plan: RevolutPlan): string {
  return `1 pt / €${REVOLUT_EURO_PER_POINT[plan]}`
}

export function revolutPointsForSpend(euros: number, plan: RevolutPlan): number {
  if (!Number.isFinite(euros) || euros <= 0) return 0
  return Math.floor(euros / REVOLUT_EURO_PER_POINT[plan])
}

export function revolutEarn(monthlySpend: number, plan: RevolutPlan): { perMonth: number; perYear: number } {
  const perMonth = revolutPointsForSpend(monthlySpend, plan)
  return { perMonth, perYear: perMonth * 12 }
}

export function programForAirline(airline: string): AwardCurrency {
  return /qatar/i.test(airline) ? 'qatar' : 'avios'
}

export function pooledBalance(programs: LoyaltyProgram[], currency: AwardCurrency): number {
  const ids = currency === 'qatar' ? ['qatar'] : ['iberia', 'ba']
  return programs.filter((program) => ids.includes(program.id)).reduce((sum, program) => sum + program.balance, 0)
}

export type Shortfall = {
  balance: number
  short: number
  canBook: boolean
  message: string
  buyNote: boolean
}

export function aviosShortfall(pointsNeeded: number, programs: LoyaltyProgram[], currency: AwardCurrency = 'avios'): Shortfall {
  const needed = Number.isFinite(pointsNeeded) ? Math.max(0, Math.round(pointsNeeded)) : 0
  const balance = pooledBalance(programs, currency)
  const short = Math.max(0, needed - balance)
  return {
    balance,
    short,
    canBook: short === 0,
    message: short === 0 ? 'You can book this today' : `You are short ${formatPoints(short)} Avios`,
    buyNote: short > 0 && short <= 5000,
  }
}
