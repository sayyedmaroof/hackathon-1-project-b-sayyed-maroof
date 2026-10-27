'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/button'
import { FilterBottomSheet } from '@/components/filter-bottom-sheet'
import { FlexibleDayStrip } from '@/components/flexible-day-strip'
import { FlightResult } from '@/components/flight-card'
import { ResultSkeletonList } from '@/components/result-skeleton'
import { ResultsFilterPanel } from '@/components/results-filter-panel'
import { cabinLabel, johannesburgSearch, placeName, travelerLabel } from '@/lib/data'
import { formatRange } from '@/lib/dates'
import { navigate } from '@/lib/hash-view'
import { consumeResultsLoading } from '@/lib/search-navigation'
import { activeFilterCount, applyFilters, defaultFilters, flexibleDays, searchFlights } from '@/lib/search'
import { calculateSavings } from '@/lib/savings'
import { useApp } from '@/lib/store'
import type { FlightFilters } from '@/lib/types'
import { cn } from '@/lib/utils'

const tabs = ['Best options', 'Lowest cash fare', 'Best points value', 'Business opportunities'] as const
type Tab = (typeof tabs)[number]

export function ResultsView() {
  const { state, patchSearch } = useApp()
  const initialTab: Tab =
    state.search.mode === 'Cash fares' ? 'Lowest cash fare' : state.search.mode === 'Points options' ? 'Best points value' : 'Best options'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [filters, setFilters] = useState<FlightFilters>(defaultFilters)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [bootLoading, setBootLoading] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const cabin = tab === 'Business opportunities' ? 'Business' : state.search.cabin

  useEffect(() => {
    if (consumeResultsLoading()) {
      setBootLoading(true)
      const id = window.setTimeout(() => setBootLoading(false), 600)
      return () => window.clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    setFilters(defaultFilters)
  }, [state.search.origin, state.search.destination, state.search.cabin])

  const routeFlights = useMemo(() => searchFlights(state.search, cabin), [state.search, cabin])
  const airlines = useMemo(() => [...new Set(routeFlights.map((flight) => flight.airline))], [routeFlights])
  const days = useMemo(() => (state.search.flexible ? flexibleDays(state.search, cabin) : []), [state.search, cabin])

  const flights = useMemo(() => {
    const rows = applyFilters(routeFlights, filters).map((flight) => ({
      flight,
      savings: calculateSavings(flight),
    }))
    if (tab === 'Lowest cash fare') rows.sort((a, b) => a.flight.cash - b.flight.cash)
    else if (tab === 'Best points value') rows.sort((a, b) => b.savings.valuePerPoint - a.savings.valuePerPoint)
    else rows.sort((a, b) => b.savings.netSaving - a.savings.netSaving)
    return rows.map((row) => row.flight)
  }, [routeFlights, filters, tab])

  const count = activeFilterCount(filters)

  useEffect(() => {
    const label = `${flights.length} ${flights.length === 1 ? 'option' : 'options'} found for your trip`
    const id = window.setTimeout(() => setAnnouncement(label), 300)
    return () => window.clearTimeout(id)
  }, [flights.length, tab, count, state.search.origin, state.search.destination])

  function pickDay(date: string) {
    const returnDate = state.search.returnDate < date ? date : state.search.returnDate
    patchSearch({ depart: date, returnDate, when: formatRange(date, returnDate) })
  }

  function loadJohannesburg() {
    const next = { ...state.search, ...johannesburgSearch }
    patchSearch({ ...next, when: formatRange(next.depart, next.returnDate) })
    setTab('Best options')
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate('search')}
            className="mb-4 flex min-h-11 items-center gap-2 text-sm font-semibold text-[#b86632]"
          >
            <ArrowRight className="size-4 rotate-180" /> Edit search
          </button>
          <h1 className="text-4xl font-semibold tracking-[-.06em]">
            {placeName(state.search.origin)} <span className="text-[#b86632]">→</span> {placeName(state.search.destination)}
          </h1>
          <p className="mt-2 text-sm text-[#76675c]">
            {state.search.when} · {travelerLabel(state.search.travelers)} · {cabinLabel(cabin)}
          </p>
        </div>
        <span className="mock-label shrink-0">Sample data · Demo prices</span>
      </div>

      <FlexibleDayStrip days={days} selected={state.search.depart} onPick={pickDay} />

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#dfd2c4] pb-px">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              'min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-semibold',
              tab === item ? 'border-[#b86632] text-[#b86632]' : 'border-transparent text-[#8a796b]',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-64">
          <ResultsFilterPanel filters={filters} airlines={airlines} count={count} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />
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
          {bootLoading ? (
            <ResultSkeletonList />
          ) : routeFlights.length === 0 ? (
            <article className="panel">
              <h2 className="text-2xl font-semibold">No sample fares for this route</h2>
              <p className="mt-2 text-sm text-[#76675c]">Try a route that has sample prices in this prototype.</p>
              <Button variant="terra" className="mt-6" onClick={loadJohannesburg}>
                Madrid → Johannesburg
              </Button>
            </article>
          ) : flights.length === 0 ? (
            <article className="panel">
              <h2 className="text-2xl font-semibold">Nothing matches these filters</h2>
              <p className="mt-2 text-sm text-[#76675c]">Reset them to see the sample fares again.</p>
              <Button variant="terra" className="mt-6" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            </article>
          ) : (
            flights.map((flight) => <FlightResult key={flight.id} flight={flight} />)
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
