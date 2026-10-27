import { airports } from './airports.ts'
import type { Cabin } from './types.ts'

export type IntentField = 'destination' | 'cabin' | 'budgetEuro' | 'when' | 'pointsBalance'

export type TripIntent = {
  destination: string | null
  cabin: Cabin | null
  budgetEuro: number | null
  when: string | null
  pointsBalance: number | null
  missing: IntentField[]
}

const REQUIRED: IntentField[] = ['destination', 'cabin', 'budgetEuro', 'when', 'pointsBalance']

/** Extra phrases. Shared city names such as Tokyo are listed on one airport only. */
const ALIASES: Record<string, string[]> = {
  JFK: ['new york', 'nyc', 'kennedy'],
  NRT: ['narita'],
  HND: ['haneda', 'tokyo'],
  CPT: ['cape town'],
  JNB: ['johannesburg', 'joburg'],
  LHR: ['london', 'heathrow'],
  CDG: ['paris'],
  DOH: ['doha'],
  LIS: ['lisbon'],
  MAD: ['madrid'],
  BCN: ['barcelona'],
}

const MONTHS: Array<[RegExp, string]> = [
  [/\bjanuary\b|\bjan\b/i, 'January'],
  [/\bfebruary\b|\bfeb\b/i, 'February'],
  [/\bmarch\b|\bmar\b/i, 'March'],
  [/\bapril\b|\bapr\b/i, 'April'],
  [/\bmay\b/i, 'May'],
  [/\bjune\b|\bjun\b/i, 'June'],
  [/\bjuly\b|\bjul\b/i, 'July'],
  [/\baugust\b|\baug\b/i, 'August'],
  [/\bseptember\b|\bsept\b|\bsep\b/i, 'September'],
  [/\boctober\b|\boct\b/i, 'October'],
  [/\bnovember\b|\bnov\b/i, 'November'],
  [/\bdecember\b|\bdec\b/i, 'December'],
  [/\bautumn\b|\bfall\b/i, 'autumn'],
  [/\bspring\b/i, 'spring'],
  [/\bsummer\b/i, 'summer'],
  [/\bwinter\b/i, 'winter'],
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const cityCounts = new Map<string, number>()
for (const airport of airports) {
  const city = airport.city.toLowerCase()
  cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1)
}

const PLACE_PATTERNS = airports.flatMap((airport) => {
  const phrases = new Set<string>([airport.code.toLowerCase(), ...(ALIASES[airport.code] ?? [])])
  if ((cityCounts.get(airport.city.toLowerCase()) ?? 0) === 1) phrases.add(airport.city.toLowerCase())
  phrases.add(airport.name.toLowerCase())
  return [...phrases].map((phrase) => ({
    code: airport.code,
    regex: new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i'),
  }))
})

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/\s/g, '').replace(/,/g, '')
  const value = Number(normalized)
  return Number.isFinite(value) ? Math.round(value) : null
}

function findDestination(text: string): string | null {
  const hits: Array<{ index: number; code: string }> = []
  for (const place of PLACE_PATTERNS) {
    const match = place.regex.exec(text)
    if (match) hits.push({ index: match.index, code: place.code })
  }
  if (hits.length === 0) return null
  const toMatch = /\bto\b/i.exec(text)
  const pool = toMatch ? hits.filter((hit) => hit.index > toMatch.index) : hits
  const ranked = (pool.length > 0 ? pool : hits).sort((a, b) => a.index - b.index)
  return ranked[ranked.length - 1]?.code ?? null
}

function findCabin(text: string): Cabin | null {
  if (/premium\s*economy/i.test(text)) return 'Premium Economy'
  if (/business/i.test(text)) return 'Business'
  if (/\bfirst\b/i.test(text)) return 'First'
  if (/economy/i.test(text)) return 'Economy'
  return null
}

function findBudget(text: string): number | null {
  const symbol = text.match(/€\s*(\d[\d.,\s]*)/)
  const word = text.match(/\b(\d[\d.,\s]*)\s*(?:€|euros?)\b/i)
  const raw = symbol?.[1] ?? word?.[1]
  return raw ? parseAmount(raw) : null
}

function findWhen(text: string): string | null {
  for (const [pattern, label] of MONTHS) {
    if (pattern.test(text)) return label
  }
  return null
}

function findPoints(text: string): number | null {
  const match = text.match(/\b(\d[\d.,]*)\s*(k)?\s*(?:avios|points|miles|revpoints)\b/i)
  if (!match) return null
  const amount = parseAmount(match[1])
  if (amount == null) return null
  return match[2] ? amount * 1000 : amount
}

export function parseTripIntent(text: string): TripIntent {
  const destination = findDestination(text)
  const cabin = findCabin(text)
  const budgetEuro = findBudget(text)
  const when = findWhen(text)
  const pointsBalance = findPoints(text)
  const found: Record<IntentField, unknown> = { destination, cabin, budgetEuro, when, pointsBalance }
  return {
    destination,
    cabin,
    budgetEuro,
    when,
    pointsBalance,
    missing: REQUIRED.filter((field) => found[field] == null),
  }
}
