'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/button'
import { FilterBottomSheet } from '@/components/filter-bottom-sheet'
import { OfferCard } from '@/components/offer-card'
import { ResultsFilterPanel } from '@/components/results-filter-panel'
import { placeName } from '@/lib/data'
import { awardCurrencyForAirlineCode } from '@/lib/cards/award-currency'
import type { OfferWithPlan } from '@/lib/cards/enrich-offers'
import type { FlightOffer } from '@/lib/providers/types'
import { DataModeLabel, sandboxCopy } from '@/components/data-mode-label'
import type { DataMode } from '@/lib/providers/types'
import { formatMoney, formatPct } from '@/lib/savings'
import { activeFilterCount, applyFilters, defaultFilters } from '@/lib/search'
import type { FlightFilters } from '@/lib/types'
import { cn } from '@/lib/utils'

type SortMode = 'cheapest' | 'points'

export function LiveResultsView({
  originLabel,
  destinationLabel,
  whenLabel,
  cabin,
  normalPrice,
  bestPrice,
  savingsAmount,
  savingsPct,
  alternatives,
  offerPlans,
  resultsPath,
  userVerified,
  isSampleProfile,
  error,
  warning,
  dataMode,
  displayCurrency,
}: {
  originLabel: string
  destinationLabel: string
  whenLabel: string
  cabin: string
  normalPrice: number
  bestPrice: number
  savingsAmount: number
  savingsPct: number
  alternatives: FlightOffer[]
  offerPlans: OfferWithPlan[]
  resultsPath: string
  userVerified: boolean
  isSampleProfile: boolean
  error?: string
  warning?: string
  dataMode: DataMode
  displayCurrency: string
}) {
  const planById = useMemo(() => new Map(offerPlans.map((p) => [p.offer.id, p])), [offerPlans])
  const [sort, setSort] = useState<SortMode>('cheapest')
  const [filters, setFilters] = useState<FlightFilters>(defaultFilters)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const airlines = useMemo(() => [...new Set(alternatives.map((o) => o.airline))], [alternatives])

  const flights = useMemo(() => {
    let rows = applyFilters(
      alternatives.map((offer) => ({
        id: offer.id,
        airline: offer.airline,
        code: offer.airlineCode,
        from: offer.origin,
        to: offer.destination,
        departTime: offer.departTime,
        arriveTime: offer.arriveTime,
        duration: offer.duration,
        stops: offer.stops,
        cash: offer.cashPrice,
        points: offer.points,
        fees: offer.fees,
        tone: offer.tone,
        cabin: offer.cabin,
      })),
      filters,
    )
    const idSet = new Set(rows.map((r) => r.id))
    let offers = alternatives.filter((o) => idSet.has(o.id))
    if (sort === 'points') {
      offers = [...offers].sort((a, b) => {
        const cpp = (o: FlightOffer) => (o.points ? (o.cashPrice - o.fees) / o.points : 0)
        return cpp(b) - cpp(a)
      })
    } else {
      offers = [...offers].sort((a, b) => a.cashPrice + a.fees - (b.cashPrice + b.fees))
    }
    return offers
  }, [alternatives, filters, sort])

  const count = activeFilterCount(filters)

  useEffect(() => {
    const label = `${flights.length} ${flights.length === 1 ? 'option' : 'options'} found for your trip`
    const id = window.setTimeout(() => setAnnouncement(label), 300)
    return () => window.clearTimeout(id)
  }, [flights.length])

  return (
    <>
      <div className="panel mb-8 p-6">
        <p className="eyebrow">{sandboxCopy(dataMode) ? 'Sandbox comparison' : 'Your savings'}</p>
        <p className="mt-3 text-lg text-[#66584e]">
          Normal price <strong className="text-[#2a211b]">{formatMoney(normalPrice, displayCurrency)}</strong>
          {' → '}
          Best price <strong className="text-[#b86632]">{formatMoney(bestPrice, displayCurrency)}</strong>
          {sandboxCopy(dataMode) ? (
            <>
              {' → '}
              Difference{' '}
              <strong className="text-[#b86632]">
                {formatMoney(savingsAmount, displayCurrency)} ({formatPct(savingsPct)})
              </strong>
            </>
          ) : (
            <>
              {' → '}
              You save{' '}
              <strong className="text-[#b86632]">
                {formatMoney(savingsAmount, displayCurrency)} ({formatPct(savingsPct)})
              </strong>
            </>
          )}
        </p>
        <div className="mt-2">
          <DataModeLabel mode={dataMode} />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <Link
            href="/"
            className="mb-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#b86632]"
          >
            <ArrowRight className="size-4 rotate-180" /> Back to spend plan
          </Link>
          <h1 className="text-4xl font-semibold tracking-[-.06em]">
            {originLabel} <span className="text-[#b86632]">→</span> {destinationLabel}
          </h1>
          <p className="mt-2 text-sm text-[#76675c]">
            {whenLabel} · {cabin}
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#e8c4b8] bg-[#fff5f2] px-4 py-3 text-sm text-[#8b3a2a]">{error}</p>
      ) : null}
      {warning ? (
        <p className="mt-4 rounded-xl border border-[#e8d8b8] bg-[#fff8f0] px-4 py-3 text-sm text-[#8a5a2a]">{warning}</p>
      ) : null}

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#dfd2c4] pb-px">
        {(
          [
            ['cheapest', 'Cheapest'],
            ['points', 'Best points value'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={cn(
              'min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-semibold',
              sort === key ? 'border-[#b86632] text-[#b86632]' : 'border-transparent text-[#8a796b]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-64">
          <ResultsFilterPanel
            filters={filters}
            airlines={airlines}
            count={count}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[#76675c]">
              <strong className="text-[#2a211b]">
                {flights.length} {flights.length === 1 ? 'option' : 'options'}
              </strong>{' '}
              found for your trip
            </p>
            <Button variant="outline" className="min-h-11 px-3 lg:hidden" onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal className="size-4" /> Filters{count > 0 ? ` (${count})` : ''}
            </Button>
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
          {flights.length === 0 ? (
            <article className="panel">
              <h2 className="text-2xl font-semibold">No flights found</h2>
              <p className="mt-2 text-sm text-[#76675c]">Try different dates or airports. Duffel test mode covers limited routes.</p>
            </article>
          ) : (
            flights.map((offer) => {
              const enriched = planById.get(offer.id)
              return (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  normalPrice={normalPrice}
                  resultsPath={resultsPath}
                  userVerified={userVerified}
                  isSampleProfile={isSampleProfile}
                  pointsPlan={enriched?.pointsPlan ?? null}
                  planCurrencyId={awardCurrencyForAirlineCode(offer.airlineCode) ?? undefined}
                  displayCurrency={displayCurrency}
                />
              )
            })
          )}
        </div>
      </div>

      <FilterBottomSheet
        open={sheetOpen}
        filters={filters}
        airlines={airlines}
        count={count}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}
