import { defaultSearch } from '@/lib/data'
import { formatRange, isIsoDate } from '@/lib/dates'
import type { Alert, ChatMessage, Conversation, LoyaltyProgram, RevolutPlan, SearchQuery, Trip } from '@/lib/types'
import type { AppState, Persisted } from '@/lib/store/reducer'

const STORAGE_KEY = 'fareflip'
const LEGACY_STORAGE_KEY = 'a-una-milla'
const CABINS = ['Economy', 'Premium Economy', 'Business', 'First'] as const
const MODES = ['Compare both', 'Cash fares', 'Points options'] as const
const PLANS = ['Premium', 'Metal', 'Ultra'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.cash === 'number' &&
    typeof value.fees === 'number' &&
    typeof value.points === 'number' &&
    typeof value.program === 'string'
  )
}

function isAlert(value: unknown): value is Alert {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.route === 'string' &&
    typeof value.detail === 'string' &&
    typeof value.active === 'boolean'
  )
}

function isProgram(value: unknown): value is LoyaltyProgram {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.balance === 'number' &&
    typeof value.unit === 'string' &&
    typeof value.note === 'string'
  )
}

function readChecklist(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item): item is string => typeof item === 'string')
}

function readTrip(value: unknown): Trip | null {
  if (!isTrip(value)) return null
  const checklist = readChecklist(value.checklist)
  return checklist ? { ...value, checklist } : value
}

function readMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) return null
  if ((value.role !== 'user' && value.role !== 'assistant') || typeof value.id !== 'string' || typeof value.text !== 'string') {
    return null
  }
  const message: ChatMessage = { id: value.id, role: value.role, text: value.text }
  const trip = readTrip(value.trip)
  if (trip) message.trip = trip
  return message
}

function readConversation(value: unknown): Conversation | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || !Array.isArray(value.messages)) {
    return null
  }
  return { id: value.id, title: value.title, messages: value.messages.map(readMessage).filter((message) => message !== null) }
}

function sanitizeSearch(value: unknown): SearchQuery {
  if (!isRecord(value)) return defaultSearch
  const depart = isIsoDate(value.depart) ? value.depart : defaultSearch.depart
  const returnDate = isIsoDate(value.returnDate) ? value.returnDate : defaultSearch.returnDate
  const datesOk = depart <= returnDate
  const safeDepart = datesOk ? depart : defaultSearch.depart
  const safeReturn = datesOk ? returnDate : defaultSearch.returnDate
  const cabin = CABINS.includes(value.cabin as (typeof CABINS)[number]) ? (value.cabin as SearchQuery['cabin']) : defaultSearch.cabin
  const mode = MODES.includes(value.mode as (typeof MODES)[number]) ? (value.mode as SearchQuery['mode']) : defaultSearch.mode
  return {
    origin: typeof value.origin === 'string' && value.origin.trim() ? value.origin : defaultSearch.origin,
    destination: typeof value.destination === 'string' && value.destination.trim() ? value.destination : defaultSearch.destination,
    depart: safeDepart,
    returnDate: safeReturn,
    when: formatRange(safeDepart, safeReturn),
    travelers: typeof value.travelers === 'string' && value.travelers.trim() ? value.travelers : defaultSearch.travelers,
    cabin,
    mode,
    flexible: typeof value.flexible === 'boolean' ? value.flexible : defaultSearch.flexible,
  }
}

function readStorageRaw(): string | null {
  if (typeof window === 'undefined') return null
  const current = window.localStorage.getItem(STORAGE_KEY)
  if (current) return current
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!legacy) return null
  try {
    window.localStorage.setItem(STORAGE_KEY, legacy)
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    return legacy
  }
  return legacy
}

export function loadPersisted(): Partial<Persisted> | null {
  try {
    const raw = readStorageRaw()
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const next: Partial<Persisted> = {}
    if ('search' in parsed) next.search = sanitizeSearch(parsed.search)
    if (Array.isArray(parsed.trips)) {
      next.trips = parsed.trips.map(readTrip).filter((trip) => trip !== null)
    }
    if (Array.isArray(parsed.alerts)) next.alerts = parsed.alerts.filter(isAlert)
    if (Array.isArray(parsed.programs)) next.programs = parsed.programs.filter(isProgram)
    if (PLANS.includes(parsed.revolutPlan as RevolutPlan)) next.revolutPlan = parsed.revolutPlan as RevolutPlan
    if (typeof parsed.monthlySpend === 'number' && Number.isFinite(parsed.monthlySpend)) {
      next.monthlySpend = Math.max(0, parsed.monthlySpend)
    }
    if (Array.isArray(parsed.conversations)) {
      next.conversations = parsed.conversations.map(readConversation).filter((item) => item !== null)
    }
    if (typeof parsed.activeConversationId === 'string' || parsed.activeConversationId === null) {
      next.activeConversationId = parsed.activeConversationId as string | null
    }
    if (isRecord(parsed.checklists)) {
      const checklists: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(parsed.checklists)) {
        const steps = readChecklist(value)
        if (steps) checklists[key] = steps
      }
      next.checklists = checklists
    }
    return next
  } catch {
    return null
  }
}

export function persist(state: AppState) {
  try {
    if (typeof window === 'undefined') return
    const { toast: _toast, ...rest } = state
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch {
    // Private mode, quota, or a locked-down browser. The session still works.
  }
}
