import type { UserWallet } from '@/lib/cards/types'
import { DEFAULT_CUSTOM_TRIP, type CustomTripDraft, normalizeCustomTrip } from '@/lib/trips/catalog'

const KEY = 'fareflip-guest-v1'
const CUSTOM_TRIP_KEY = 'fareflip-custom-trip-v1'

export function loadGuestWallet(): UserWallet | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserWallet
    if (!parsed || !Array.isArray(parsed.cards) || !parsed.spend) return null
    return parsed
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
