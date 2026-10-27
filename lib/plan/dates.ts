export function utcYmd(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return dt
}

export function addDaysYmd(ymd: string, days: number): string {
  const dt = parseYmd(ymd)
  if (!dt) return ymd
  dt.setUTCDate(dt.getUTCDate() + days)
  return utcYmd(dt)
}

export function formatPlanDate(ymd: string): string {
  const dt = parseYmd(ymd)
  if (!dt) return ymd
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function wholeMonthsBetween(from: Date, to: Date): number {
  if (to.getTime() <= from.getTime()) return 0
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth())
  if (to.getUTCDate() < from.getUTCDate()) months -= 1
  return Math.max(0, months)
}
