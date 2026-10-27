import { Suspense } from 'react'
import { ShellLayout } from '@/components/shell-layout'
import { LiveResultsView } from '@/components/live-results-view'
import { ResultSkeletonList } from '@/components/result-skeleton'
import { searchFlightsFromParams } from '@/app/actions/search'
import { getCurrentUser } from '@/lib/auth/current-user'
import { placeName } from '@/lib/data'
import { formatRange } from '@/lib/dates'
import { loadWalletForUser } from '@/lib/cards/wallet-db'
import { SAMPLE_WALLET } from '@/lib/cards/constants'
import { enrichAlternativesWithPlans } from '@/lib/cards/enrich-offers'
import { effectiveCost } from '@/lib/savings'

async function ResultsContent({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const user = await getCurrentUser()
  const { query, result } = await searchFlightsFromParams(searchParams)

  if (!query || !result) {
    return (
      <article className="panel">
        <h2 className="text-2xl font-semibold">Invalid search</h2>
        <p className="mt-2 text-sm text-[#76675c]">Check origin, destination, and dates, then try again.</p>
      </article>
    )
  }

  const resultsPath = `/results?${new URLSearchParams({
    origin: query.originCode,
    destination: query.destinationCode,
    depart: query.depart,
    return: query.returnDate,
    cabin: query.cabin,
    flexible: query.flexible ? '1' : '0',
    adults: String(query.adults),
  }).toString()}`

  const best = result.best
  const bestPrice = best
    ? Math.round(effectiveCost(best.cashPrice, best.fees, best.points))
    : result.normalPrice

  const userVerified = !!user?.emailVerifiedAt
  const wallet =
    userVerified && user ? await loadWalletForUser(user.id) : SAMPLE_WALLET
  const enriched = enrichAlternativesWithPlans(result.alternatives, wallet)

  return (
    <LiveResultsView
      originLabel={placeName(query.originCode)}
      destinationLabel={placeName(query.destinationCode)}
      whenLabel={formatRange(query.depart, query.returnDate)}
      cabin={query.cabin}
      normalPrice={result.normalPrice}
      bestPrice={bestPrice}
      savingsAmount={result.savings.amount}
      savingsPct={result.savings.pct}
      alternatives={result.alternatives}
      offerPlans={enriched}
      resultsPath={resultsPath}
      userVerified={userVerified}
      isSampleProfile={!userVerified}
      error={result.error}
      warning={result.warning}
      dataMode={result.dataMode}
      displayCurrency={result.displayCurrency}
    />
  )
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  return (
    <ShellLayout user={user}>
      <Suspense fallback={<ResultSkeletonList />}>
        <ResultsContent searchParams={params} />
      </Suspense>
    </ShellLayout>
  )
}
