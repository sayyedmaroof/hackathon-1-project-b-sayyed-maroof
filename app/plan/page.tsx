import { Suspense } from 'react'
import { getDuffelApiKey } from '@/lib/providers/duffel-client'
import { getCurrentUser } from '@/lib/auth/current-user'
import { loadWalletForUser } from '@/lib/cards/wallet-db'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import type { UserWallet } from '@/lib/cards/types'
import { ShellLayout } from '@/components/shell-layout'
import { PlanWizard } from '@/components/plan/plan-wizard'

function emptyWallet(): UserWallet {
  return { cards: [], balances: [], spend: SAMPLE_SPEND_PROFILE }
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string; date?: string; ready?: string; view?: string }>
}) {
  const { trip, date, ready, view } = await searchParams
  const user = await getCurrentUser()
  const duffelConfigured = Boolean(getDuffelApiKey())
  const verified = Boolean(user?.emailVerifiedAt)
  let initialWallet: UserWallet = emptyWallet()
  if (verified && user) {
    initialWallet = await loadWalletForUser(user.id)
  }
  return (
    <ShellLayout user={user}>
      <Suspense fallback={<p>Loading planner…</p>}>
        <PlanWizard
          duffelConfigured={duffelConfigured}
          verified={verified}
          initialTripId={trip}
          initialDate={date}
          initialReadyBy={ready}
          initialViewPlan={view === 'plan'}
          initialWallet={initialWallet}
        />
      </Suspense>
    </ShellLayout>
  )
}
