const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
  spring: 3,
  summer: 6,
  autumn: 9,
  fall: 9,
  winter: 12,
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const time = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(time)) return false
  const date = new Date(time)
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
}

export function addDays(iso: string, days: number): string {
  const time = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000
  return new Date(time).toISOString().slice(0, 10)
}

export function formatDisplayDate(iso: string): string {
  if (!isIsoDate(iso)) return iso || '—'
  const date = new Date(`${iso}T00:00:00Z`)
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export function formatDayChip(iso: string): string {
  if (!isIsoDate(iso)) return iso
  const date = new Date(`${iso}T00:00:00Z`)
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`
}

export function formatRange(depart: string, returnDate: string): string {
  return `${formatDisplayDate(depart)} — ${formatDisplayDate(returnDate)}`
}

/** Month names and seasons become a week in 2027. */
export function datesFromWhen(when: string): { depart: string; returnDate: string } | null {
  const token = when.trim().toLowerCase()
  const month = MONTH_INDEX[token]
  if (!month) return null
  const mm = String(month).padStart(2, '0')
  return { depart: `2027-${mm}-12`, returnDate: `2027-${mm}-19` }
}
