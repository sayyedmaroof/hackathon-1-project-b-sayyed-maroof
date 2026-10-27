import { getCatalogCard } from '@/lib/cards/catalog'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import type {
  CatalogCardId,
  PointCurrencyId,
  RevolutPlanId,
  UserBalance,
  UserCard,
  UserSpendProfile,
  UserWallet,
} from '@/lib/cards/types'
import { DEFAULT_CUSTOM_TRIP, type CustomTripDraft, normalizeCustomTrip } from '@/lib/trips/catalog'

const KEY = 'fareflip-guest-v1'
const CUSTOM_TRIP_KEY = 'fareflip-custom-trip-v1'

const REVOLUT_PLANS = new Set<RevolutPlanId>(['premium', 'metal', 'ultra'])

function asCardId(value: unknown): CatalogCardId | null {
  if (typeof value !== 'string') return null
  return getCatalogCard(value as CatalogCardId) ? (value as CatalogCardId) : null
}

function asRevolutPlan(value: unknown): RevolutPlanId | null {
  return typeof value === 'string' && REVOLUT_PLANS.has(value as RevolutPlanId)
    ? (value as RevolutPlanId)
    : null
}

function parseCards(value: unknown): UserCard[] | null {
  if (Array.isArray(value)) {
    const cards: UserCard[] = []
    for (const item of value) {
      if (!item || typeof item !== 'object') continue
      const row = item as { cardId?: unknown; revolutPlan?: unknown }
      const cardId = asCardId(row.cardId)
      if (!cardId) continue
      cards.push({
        cardId,
        revolutPlan: cardId === 'revolut' ? asRevolutPlan(row.revolutPlan) ?? 'premium' : null,
      })
    }
    return cards
  }
  return null
}

function parseLegacySingleCard(value: unknown): UserCard[] | null {
  if (!value || typeof value !== 'object') return null
  const row = value as { cardId?: unknown; revolutPlan?: unknown }
  const cardId = asCardId(row.cardId)
  if (!cardId) return null
  return [
    {
      cardId,
      revolutPlan: cardId === 'revolut' ? asRevolutPlan(row.revolutPlan) ?? 'premium' : null,
    },
  ]
}

function parseBalances(value: unknown): UserBalance[] {
  if (!Array.isArray(value)) return []
  const out: UserBalance[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as { currency?: unknown; balance?: unknown }
    if (typeof row.currency !== 'string') continue
    out.push({
      currency: row.currency as PointCurrencyId,
      balance: Number(row.balance) || 0,
    })
  }
  return out
}

function parseSpend(value: unknown): UserSpendProfile | null {
  if (!value || typeof value !== 'object') return null
  const s = value as Partial<UserSpendProfile>
  return {
    monthlyTotalEur: Number(s.monthlyTotalEur) || 0,
    groceriesEur: Number(s.groceriesEur) || 0,
    travelEur: Number(s.travelEur) || 0,
    diningEur: Number(s.diningEur) || 0,
    fuelEur: Number(s.fuelEur) || 0,
    otherEur: Number(s.otherEur) || 0,
  }
}

export function parseGuestWallet(raw: unknown): UserWallet | null {
  if (!raw || typeof raw !== 'object') return null
  const parsed = raw as Record<string, unknown>
  const spend = parseSpend(parsed.spend) ?? SAMPLE_SPEND_PROFILE
  const fromArray = parseCards(parsed.cards)
  const cards = fromArray ?? parseLegacySingleCard(parsed)
  if (!cards) return null
  return {
    cards,
    balances: parseBalances(parsed.balances),
    spend,
  }
}

export function loadGuestWallet(): UserWallet | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    return parseGuestWallet(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveGuestWallet(wallet: UserWallet): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(wallet))
  } catch {
    /* private mode */
  }
}

function isCustomDraft(value: unknown): value is CustomTripDraft {
  if (!value || typeof value !== 'object') return false
  const v = value as CustomTripDraft
  return typeof v.originIata === 'string' && typeof v.destinationIata === 'string'
}

export function loadCustomTrip(): CustomTripDraft {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_TRIP
  try {
    const raw = window.localStorage.getItem(CUSTOM_TRIP_KEY)
    if (!raw) return DEFAULT_CUSTOM_TRIP
    const parsed: unknown = JSON.parse(raw)
    if (!isCustomDraft(parsed)) return DEFAULT_CUSTOM_TRIP
    return normalizeCustomTrip({ ...DEFAULT_CUSTOM_TRIP, ...parsed })
  } catch {
    return DEFAULT_CUSTOM_TRIP
  }
}

export function saveCustomTrip(draft: CustomTripDraft): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CUSTOM_TRIP_KEY, JSON.stringify(normalizeCustomTrip(draft)))
  } catch {
    /* private mode */
  }
}
