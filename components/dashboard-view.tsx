'use client'

import { ArrowRight, Compass, Plane, Search, WalletCards } from 'lucide-react'
import { Button } from '@/components/button'
import { FlightMini } from '@/components/flight-card'
import { navigate } from '@/lib/hash-view'
import { searchFlights } from '@/lib/search'
import { calculateSavings, formatEuro, formatPct, formatPointsCompact } from '@/lib/savings'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

export function DashboardView() {
  const { state } = useApp()
  const flights = searchFlights({ ...state.search, cabin: 'Business' }, 'Business')
  const saved = state.trips.map((trip) => ({ trip, savings: calculateSavings(trip) }))
  const cashAvoided = saved.reduce((sum, item) => sum + item.savings.cashAvoided, 0)
  const cash = saved.reduce((sum, item) => sum + item.trip.cash, 0)
  const net = saved.reduce((sum, item) => sum + item.savings.netSaving, 0)
  const ratio = cash === 0 ? 0 : net / cash
  const featured = state.trips[0]
  const program = state.programs[0]
  const barValues = saved.map((item) => Math.max(0, item.savings.netSaving))
  const maxBar = Math.max(...barValues, 0)

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Your points command center</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] lg:text-5xl">Make every point count.</h1>
          <p className="mt-3 text-[#76675c]">Balances, transfer paths, and redemptions in one place.</p>
        </div>
        <Button variant="terra" onClick={() => navigate('search')}>
          <Search className="size-4" /> Find a flight
        </Button>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <button onClick={() => navigate('planner')} className="dashboard-hero text-left">
          <div className="relative z-10 max-w-md">
            <span className="eyebrow text-[#e3a981]">New · Travel planner</span>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.05em] text-[#fffaf2]">
              Turn a big trip into a <em className="font-serif font-normal text-[#e0a078]">smart plan.</em>
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#d0c1b4]">
              Tell us what you have in mind. We&apos;ll uncover routes, points, and possibilities.
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#e3a981]">
              Start planning <ArrowRight className="size-4" />
            </span>
          </div>
          <Compass className="absolute -bottom-12 -right-6 size-64 text-white/5" />
        </button>
        <div className="rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-6">
          <p className="text-sm font-semibold">Your points at work</p>
          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-xs text-[#8a796b]">Cash avoided</p>
              <p className="mt-1 text-4xl font-semibold tracking-[-.06em]">{formatEuro(cashAvoided)}</p>
            </div>
            <span className="status">{formatPct(ratio)} net</span>
          </div>
          {saved.length === 0 ? (
            <div className="mt-7">
              <p className="text-sm text-[#76675c]">Save a trip to chart it.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('search')}>
                Find a flight
              </Button>
            </div>
          ) : (
            <div className="mt-7 flex h-20 items-end gap-1.5">
              {saved.map((item) => {
                const height = maxBar === 0 ? 12 : Math.max(12, Math.round((Math.max(0, item.savings.netSaving) / maxBar) * 100))
                return (
                  <span
                    key={item.trip.id}
                    style={{ height: `${height}%` }}
                    className={cn('flex-1 rounded-t-sm', item.savings.netSaving === maxBar && maxBar > 0 ? 'bg-[#b86632]' : 'bg-[#e5c9ad]')}
                  />
                )
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-[#8a796b]">
            Estimated, not realized savings · {saved.length} saved {saved.length === 1 ? 'trip' : 'trips'} ·{' '}
            <button className="font-semibold text-[#b86632]" onClick={() => navigate('savings')}>
              View insights
            </button>
          </p>
        </div>
      </div>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-[-.03em]">Continue exploring</h2>
          <button onClick={() => navigate('trips')} className="text-sm font-semibold text-[#b86632]">
            View all
          </button>
        </div>
        {flights.length === 0 ? (
          <article className="panel">
            <h3 className="text-xl font-semibold">No sample fares for this route</h3>
            <p className="mt-2 text-sm text-[#76675c]">Business class on the current search has no sample rows.</p>
            <Button variant="outline" className="mt-5" onClick={() => navigate('search')}>
              Edit search
            </Button>
          </article>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {flights.map((flight) => (
              <FlightMini key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </section>
      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="panel">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved trips</h2>
            <button onClick={() => navigate('trips')} className="text-sm font-semibold text-[#b86632]">
              See library
            </button>
          </div>
          {featured ? (
            <div className="mt-6 flex items-center gap-4 border-t border-[#e8ddd1] pt-5">
              <div className="grid size-12 place-items-center rounded-xl bg-[#ead2bc]">
                <Plane className="size-5 text-[#b86632]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{featured.title}</p>
                <p className="mt-1 text-xs text-[#8a796b]">{featured.detail}</p>
              </div>
              <span className="text-right">
                <strong className="block text-[#b86632]">Save {formatEuro(calculateSavings(featured).netSaving)}</strong>
                <small className="text-xs text-[#8a796b]">Sample data</small>
              </span>
            </div>
          ) : (
            <div className="mt-6 border-t border-[#e8ddd1] pt-5">
              <p className="text-sm text-[#76675c]">Save a flight to see it here.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('search')}>
                Find a flight
              </Button>
            </div>
          )}
        </div>
        <div className="panel">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your points</h2>
            <button onClick={() => navigate('loyalty')} className="text-sm font-semibold text-[#b86632]">
              Manage
            </button>
          </div>
          {program ? (
            <div className="mt-6 flex items-center gap-4 border-t border-[#e8ddd1] pt-5">
              <div className="grid size-12 place-items-center rounded-xl bg-[#d9e1cf]">
                <WalletCards className="size-5 text-[#657355]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{program.name}</p>
                <p className="mt-1 text-xs text-[#8a796b]">{program.note}</p>
              </div>
              <span className="text-2xl font-semibold">{formatPointsCompact(program.balance)}</span>
            </div>
          ) : (
            <div className="mt-6 border-t border-[#e8ddd1] pt-5">
              <p className="text-sm text-[#76675c]">Add a program to track a balance.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('loyalty')}>
                Add a program
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
