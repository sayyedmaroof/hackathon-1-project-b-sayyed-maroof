import { Suspense } from 'react'
import { getDuffelApiKey } from '@/lib/providers/duffel-client'
import { getCurrentUser } from '@/lib/auth/current-user'
import { loadWalletForUser } from '@/lib/cards/wallet-db'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import type { CatalogCardId, UserWallet } from '@/lib/cards/types'
import { loadSavedPlan, type SavedPlanInputs } from '@/app/actions/saved-plans'
import { PlanWizard } from '@/components/plan/plan-wizard'

function emptyWallet(): UserWallet {
  return { cards: [], balances: [], spend: SAMPLE_SPEND_PROFILE }
}

function walletFromInputs(inputs: SavedPlanInputs): UserWallet {
  return {
    cards: inputs.cardIds.map((cardId) => ({
      cardId: cardId as CatalogCardId,
      revolutPlan: cardId === 'revolut' ? 'premium' : null,
    })),
    balances: inputs.balances ?? [],
    spend: inputs.spend ?? SAMPLE_SPEND_PROFILE,
  }
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string; date?: string; ready?: string; view?: string; saved?: string }>
}) {
  const { trip, date, ready, view, saved } = await searchParams
  const user = await getCurrentUser()
  const duffelConfigured = Boolean(getDuffelApiKey())
  const verified = Boolean(user?.emailVerifiedAt)
  let initialWallet: UserWallet = emptyWallet()
  if (verified && user) {
    initialWallet = await loadWalletForUser(user.id)
    if (saved) {
      try {
        const row = await loadSavedPlan(saved)
        const inputs = row?.inputs as SavedPlanInputs | null
        if (inputs) initialWallet = walletFromInputs(inputs)
      } catch {
        /* keep wallet */
      }
    }
  }
  return (
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
  )
}
