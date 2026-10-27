import { defaultAlerts, defaultPrograms, defaultSearch, sampleTrip } from '@/lib/data'
import type { ToastPayload } from '@/lib/toast-messages'
import type { Alert, ChatMessage, Conversation, LoyaltyProgram, RevolutPlan, SearchQuery, Trip } from '@/lib/types'

export type AppState = {
  search: SearchQuery
  trips: Trip[]
  alerts: Alert[]
  programs: LoyaltyProgram[]
  revolutPlan: RevolutPlan
  monthlySpend: number
  conversations: Conversation[]
  activeConversationId: string | null
  checklists: Record<string, string[]>
  toast: ToastPayload | null
}

export type Persisted = Omit<AppState, 'toast'>

export type Action =
  | { type: 'hydrate'; state: Partial<Persisted> }
  | { type: 'patch-search'; patch: Partial<SearchQuery> }
  | { type: 'toggle-trip'; trip: Trip }
  | { type: 'save-trip'; trip: Trip }
  | { type: 'remove-trip'; id: string }
  | { type: 'rename-trip'; id: string; title: string }
  | { type: 'add-alert'; alert: Alert }
  | { type: 'toggle-alert'; id: string }
  | { type: 'delete-alert'; id: string }
  | { type: 'add-program'; program: LoyaltyProgram }
  | { type: 'set-balance'; id: string; balance: number }
  | { type: 'delete-program'; id: string }
  | { type: 'set-revolut-plan'; plan: RevolutPlan }
  | { type: 'set-monthly-spend'; spend: number }
  | { type: 'toggle-checklist'; tripId: string; stepId: string }
  | { type: 'new-conversation'; conversation: Conversation }
  | { type: 'open-conversation'; id: string }
  | { type: 'append-message'; id: string; message: ChatMessage; title?: string }
  | { type: 'toast'; toast: ToastPayload | null }

export const initialState: AppState = {
  search: defaultSearch,
  trips: [sampleTrip],
  alerts: defaultAlerts,
  programs: defaultPrograms,
  revolutPlan: 'Metal',
  monthlySpend: 800,
  conversations: [],
  activeConversationId: null,
  checklists: {},
  toast: null,
}

function withChecklist(trip: Trip, checklists: Record<string, string[]>): Trip {
  const checklist = checklists[trip.id] ?? trip.checklist ?? []
  return { ...trip, checklist }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state, toast: null }
    case 'patch-search':
      return { ...state, search: { ...state.search, ...action.patch } }
    case 'toggle-trip': {
      const trip = withChecklist(action.trip, state.checklists)
      const exists = state.trips.some((item) => item.id === trip.id)
      return {
        ...state,
        checklists: { ...state.checklists, [trip.id]: trip.checklist ?? [] },
        trips: exists ? state.trips.filter((item) => item.id !== trip.id) : [trip, ...state.trips],
      }
    }
    case 'save-trip': {
      const trip = withChecklist(action.trip, state.checklists)
      if (state.trips.some((item) => item.id === trip.id)) return state
      return {
        ...state,
        checklists: { ...state.checklists, [trip.id]: trip.checklist ?? [] },
        trips: [trip, ...state.trips],
      }
    }
    case 'remove-trip':
      return { ...state, trips: state.trips.filter((trip) => trip.id !== action.id) }
    case 'rename-trip': {
      const title = action.title.trim()
      if (!title) return state
      return {
        ...state,
        trips: state.trips.map((trip) => (trip.id === action.id ? { ...trip, title } : trip)),
      }
    }
    case 'add-alert':
      if (state.alerts.some((alert) => alert.id === action.alert.id)) return state
      return { ...state, alerts: [action.alert, ...state.alerts] }
    case 'toggle-alert':
      return {
        ...state,
        alerts: state.alerts.map((alert) => (alert.id === action.id ? { ...alert, active: !alert.active } : alert)),
      }
    case 'delete-alert':
      return { ...state, alerts: state.alerts.filter((alert) => alert.id !== action.id) }
    case 'add-program':
      if (state.programs.some((program) => program.id === action.program.id)) return state
      return { ...state, programs: [...state.programs, action.program] }
    case 'set-balance':
      return {
        ...state,
        programs: state.programs.map((program) =>
          program.id === action.id ? { ...program, balance: action.balance } : program,
        ),
      }
    case 'delete-program':
      return { ...state, programs: state.programs.filter((program) => program.id !== action.id) }
    case 'set-revolut-plan':
      return { ...state, revolutPlan: action.plan }
    case 'set-monthly-spend':
      return { ...state, monthlySpend: action.spend }
    case 'toggle-checklist': {
      const existing =
        state.checklists[action.tripId] ?? state.trips.find((trip) => trip.id === action.tripId)?.checklist ?? []
      const checklist = existing.includes(action.stepId)
        ? existing.filter((step) => step !== action.stepId)
        : [...existing, action.stepId]
      return {
        ...state,
        checklists: { ...state.checklists, [action.tripId]: checklist },
        trips: state.trips.map((trip) => (trip.id === action.tripId ? { ...trip, checklist } : trip)),
        conversations: state.conversations.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.trip?.id === action.tripId ? { ...message, trip: { ...message.trip, checklist } } : message,
          ),
        })),
      }
    }
    case 'new-conversation':
      return {
        ...state,
        activeConversationId: action.conversation.id,
        conversations: [action.conversation, ...state.conversations.filter((item) => item.id !== action.conversation.id)].slice(0, 20),
      }
    case 'open-conversation':
      return { ...state, activeConversationId: action.id }
    case 'append-message':
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.id
            ? {
                ...conversation,
                title: action.title ?? conversation.title,
                messages: [...conversation.messages, action.message],
              }
            : conversation,
        ),
      }
    case 'toast':
      return { ...state, toast: action.toast }
    default:
      return state
  }
}
