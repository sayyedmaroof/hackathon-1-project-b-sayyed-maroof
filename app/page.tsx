'use client'

import { AppShell } from '@/components/app-shell'
import { ChatPlanner } from '@/components/chat-planner'
import { DashboardView } from '@/components/dashboard-view'
import { HomeView } from '@/components/home-view'
import { AlertsView, LoyaltyView, SavingsView, TripsView } from '@/components/library-views'
import { ResultsView } from '@/components/results-view'
import { SearchPage } from '@/components/search-page'
import { useHashView } from '@/lib/hash-view'
import { AppProvider } from '@/lib/store'

function Prototype() {
  const view = useHashView()

  if (view === 'home') return <HomeView />

  return (
    <AppShell>
      {view === 'dashboard' && <DashboardView />}
      {view === 'search' && <SearchPage />}
      {view === 'results' && <ResultsView />}
      {view === 'planner' && <ChatPlanner />}
      {view === 'trips' && <TripsView />}
      {view === 'alerts' && <AlertsView />}
      {view === 'loyalty' && <LoyaltyView />}
      {view === 'savings' && <SavingsView />}
    </AppShell>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <Prototype />
    </AppProvider>
  )
}
