'use client'

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { Toast } from '@/components/toast'
import { loadPersisted, persist } from '@/lib/store/persist'
import { initialState, reducer, type AppState } from '@/lib/store/reducer'
import type { ToastPayload } from '@/lib/toast-messages'
import type { Alert, ChatMessage, Conversation, LoyaltyProgram, RevolutPlan, SearchQuery, Trip } from '@/lib/types'

type AppContextValue = {
  state: AppState
  patchSearch: (patch: Partial<SearchQuery>) => void
  toggleTrip: (trip: Trip) => void
  saveTrip: (trip: Trip) => void
  removeTrip: (id: string) => void
  renameTrip: (id: string, title: string) => void
  addAlert: (alert: Alert) => void
  toggleAlert: (id: string) => void
  deleteAlert: (id: string) => void
  addProgram: (program: LoyaltyProgram) => void
  setBalance: (id: string, balance: number) => void
  deleteProgram: (id: string) => void
  setRevolutPlan: (plan: RevolutPlan) => void
  setMonthlySpend: (spend: number) => void
  toggleChecklist: (tripId: string, stepId: string) => void
  newConversation: (conversation: Conversation) => void
  openConversation: (id: string) => void
  appendMessage: (id: string, message: ChatMessage, title?: string) => void
  showToast: (toast: ToastPayload | string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = loadPersisted()
    if (saved) dispatch({ type: 'hydrate', state: saved })
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    persist(state)
  }, [ready, state])

  const value: AppContextValue = {
    state,
    patchSearch: (patch) => dispatch({ type: 'patch-search', patch }),
    toggleTrip: (trip) => dispatch({ type: 'toggle-trip', trip }),
    saveTrip: (trip) => dispatch({ type: 'save-trip', trip }),
    removeTrip: (id) => dispatch({ type: 'remove-trip', id }),
    renameTrip: (id, title) => dispatch({ type: 'rename-trip', id, title }),
    addAlert: (alert) => dispatch({ type: 'add-alert', alert }),
    toggleAlert: (id) => dispatch({ type: 'toggle-alert', id }),
    deleteAlert: (id) => dispatch({ type: 'delete-alert', id }),
    addProgram: (program) => dispatch({ type: 'add-program', program }),
    setBalance: (id, balance) => dispatch({ type: 'set-balance', id, balance }),
    deleteProgram: (id) => dispatch({ type: 'delete-program', id }),
    setRevolutPlan: (plan) => dispatch({ type: 'set-revolut-plan', plan }),
    setMonthlySpend: (spend) => dispatch({ type: 'set-monthly-spend', spend }),
    toggleChecklist: (tripId, stepId) => dispatch({ type: 'toggle-checklist', tripId, stepId }),
    newConversation: (conversation) => dispatch({ type: 'new-conversation', conversation }),
    openConversation: (id) => dispatch({ type: 'open-conversation', id }),
    appendMessage: (id, message, title) => dispatch({ type: 'append-message', id, message, title }),
    showToast: (toast) =>
      dispatch({
        type: 'toast',
        toast: typeof toast === 'string' ? { message: toast, variant: 'default' } : toast,
      }),
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast toast={state.toast} onDismiss={() => dispatch({ type: 'toast', toast: null })} />
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
