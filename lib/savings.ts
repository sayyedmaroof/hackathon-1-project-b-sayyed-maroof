export type SavingsVerdict = 'use_points' | 'pay_cash'

export type SavingsInput = {
  cash: number
  fees: number
  points: number
  centsPerPoint?: number
}

export type SavingsResult = {
  netSaving: number
  savingPct: number
  centsPerPoint: number
  verdict: SavingsVerdict
  /** @deprecated internal display helpers */
  cashAvoided: number
  pointsValue: number
  valuePerPoint: number
}

export const DEFAULT_CENTS_PER_POINT = 1.2

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

export function calculateSavings({
  cash,
  fees,
  points,
  centsPerPoint = DEFAULT_CENTS_PER_POINT,
}: SavingsInput): SavingsResult {
  const safeCash = finite(cash)
  const safeFees = finite(fees)
  const safePoints = finite(points)
  const cents = finite(centsPerPoint, DEFAULT_CENTS_PER_POINT)

  const cashAvoided = safeCash - safeFees
  const pointsValue = (safePoints * cents) / 100
  const netSaving = safeCash - safeFees - pointsValue
  const savingPct = safeCash === 0 ? 0 : netSaving / safeCash
  const valuePerPoint = safePoints === 0 ? 0 : (cashAvoided / safePoints) * 100
  const verdict: SavingsVerdict = valuePerPoint >= 1.2 && netSaving > 0 ? 'use_points' : 'pay_cash'

  return { netSaving, savingPct, centsPerPoint: cents, verdict, cashAvoided, pointsValue, valuePerPoint }
}

export function savingsLabel(verdict: SavingsVerdict): 'Use points' | 'Pay cash' {
  return verdict === 'use_points' ? 'Use points' : 'Pay cash'
}

export type ExplanationInput = SavingsInput & {
  cabin?: string
  program?: string
}

function cabinPhrase(cabin: string) {
  if (cabin === 'Business') return 'Business class'
  if (cabin === 'First') return 'First class'
  if (cabin === 'Premium Economy') return 'Premium economy'
  if (cabin === 'Economy') return 'Economy'
  return cabin
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

export function whyThisWorks({
  cabin = 'This cabin',
  program = 'Avios',
  ...input
}: ExplanationInput): string {
  const savings = calculateSavings(input)
  const label = cabinPhrase(cabin)
  const cents = formatCents(savings.valuePerPoint)
  const chart = `${article(program)} ${program} chart`

  if (savings.verdict === 'use_points') {
    return `${label} on ${chart} beats paying cash after fees (${cents} per point).`
  }
  return `${label} on ${chart} returns ${cents} per point after fees — pay cash.`
}

export function formatEuro(value: number): string {
  const rounded = Math.round(finite(value))
  const sign = rounded < 0 ? '-' : ''
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}€${digits}`
}

export function formatPoints(value: number): string {
  return Math.round(finite(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatPointsCompact(value: number): string {
  const amount = finite(value)
  if (Math.abs(amount) >= 1000) {
    const thousands = amount / 1000
    const label = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1)
    return `${label}k`
  }
  return formatPoints(amount)
}

export function formatPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '0%'
  return `${Math.round(ratio * 100)}%`
}

export function formatCents(value: number): string {
  if (!Number.isFinite(value)) return '0.00¢'
  return `${value.toFixed(2)}¢`
}

/** Effective out-of-pocket cost for ranking (cash or points valued). */
export function effectiveCost(cash: number, fees: number, points: number, centsPerPoint = DEFAULT_CENTS_PER_POINT): number {
  if (points <= 0) return cash
  const { netSaving, verdict } = calculateSavings({ cash, fees, points, centsPerPoint })
  if (verdict === 'pay_cash') return cash
  return cash - netSaving
}
