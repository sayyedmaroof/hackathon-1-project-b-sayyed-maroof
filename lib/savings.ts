export type Verdict = 'great' | 'good' | 'poor'

export type SavingsInput = {
  cash: number
  fees: number
  points: number
  centsPerPoint?: number
}

export type SavingsResult = {
  cashAvoided: number
  pointsValue: number
  netSaving: number
  savingPct: number
  valuePerPoint: number
  verdict: Verdict
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
  const verdict: Verdict = valuePerPoint >= 2 ? 'great' : valuePerPoint >= 1.2 ? 'good' : 'poor'

  return { cashAvoided, pointsValue, netSaving, savingPct, valuePerPoint, verdict }
}

export function savingsLabel(verdict: Verdict): 'Use points' | 'Pay cash' {
  return verdict === 'poor' ? 'Pay cash' : 'Use points'
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

  if (savings.verdict === 'great') {
    return `${label} on ${chart} is cheaper than cash at this price (${cents} per point).`
  }
  if (savings.verdict === 'good') {
    return `${label} on ${chart} still beats paying cash after fees, at ${cents} per point.`
  }
  return `${label} on ${chart} returns ${cents} per point after fees, below a 1.2¢ cash value — pay cash.`
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
