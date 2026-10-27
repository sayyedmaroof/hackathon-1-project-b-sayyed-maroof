'use client'

import { useState } from 'react'
import { ArrowRight, Check, Heart } from 'lucide-react'
import { BalanceLine } from '@/components/balance-line'
import { Button } from '@/components/button'
import { DetailsDrawer } from '@/components/details-drawer'
import { flightToTrip } from '@/lib/data'
import { navigate } from '@/lib/hash-view'
import { SavingsBadge } from '@/components/savings-badge'
import { calculateSavings, formatCents, formatEuro, formatPct, formatPoints, savingsLabel, whyThisWorks } from '@/lib/savings'
import { useApp } from '@/lib/store'
import { toastRemoved, toastSaved } from '@/lib/toast-messages'
import type { FlightOption } from '@/lib/types'
import { cn } from '@/lib/utils'

export function FlightMini({ flight }: { flight: FlightOption }) {
  const savings = calculateSavings(flight)

  return (
    <button onClick={() => navigate('results')} className="flight-mini text-left">
      <div className="flex items-center justify-between">
        <span className={cn('airline-mark', flight.tone)}>{flight.code}</span>
        <span className="status">{savingsLabel(savings.verdict)}</span>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-lg font-semibold">
            {flight.from} <span className="mx-1 text-[#b86632]">→</span> {flight.to}
          </p>
          <p className="mt-1 text-xs text-[#8a796b]">
            {flight.departTime} — {flight.arriveTime} · {flight.stops}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formatPoints(flight.points)}</p>
          <p className="text-xs text-[#8a796b]">+ {formatEuro(flight.fees)}</p>
        </div>
      </div>
    </button>
  )
}

export function FlightResult({ flight }: { flight: FlightOption }) {
  const { state, toggleTrip, showToast } = useApp()
  const [open, setOpen] = useState(false)
  const savings = calculateSavings(flight)
  const trip = flightToTrip(flight, state.search)
  const saved = state.trips.some((item) => item.id === trip.id)

  return (
    <div className="result-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn('airline-mark', flight.tone)}>{flight.code}</span>
          <div>
            <p className="font-semibold">{flight.airline}</p>
            <p className="text-xs text-[#8a796b]">
              {flight.duration} · {flight.stops}
            </p>
          </div>
        </div>
        <SavingsBadge cash={flight.cash} fees={flight.fees} points={flight.points} />
      </div>
      <div className="mt-6 flex items-center gap-5">
        <div>
          <p className="text-2xl font-semibold tracking-[-.04em]">{flight.departTime}</p>
          <p className="mt-1 text-xs text-[#8a796b]">{flight.from}</p>
        </div>
        <div className="flex-1 text-center">
          <div className="mx-auto h-px max-w-[130px] bg-[#d7c9b9]" />
          <p className="mt-2 text-[10px] text-[#8a796b]">{flight.stops}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-[-.04em]">{flight.arriveTime}</p>
          <p className="mt-1 text-xs text-[#8a796b]">{flight.to}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-[#8a796b]">Cash price</p>
          <p className="text-lg font-semibold line-through decoration-[#b86632]/60">{formatEuro(flight.cash)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8a796b]">Award</p>
          <p className="text-lg font-semibold">
            {formatPoints(flight.points)} <span className="text-xs font-normal">+ {formatEuro(flight.fees)}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8a796b]">Cents per point</p>
          <p className="text-lg font-semibold">{formatCents(savings.valuePerPoint)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8a796b]">Net saving</p>
          <p className="text-lg font-semibold text-[#b86632]">
            {formatEuro(savings.netSaving)} <span className="text-sm">{formatPct(savings.savingPct)}</span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ddd1] pt-4">
        <p className="max-w-xl text-sm leading-6 text-[#66584e]">
          <span className="font-semibold text-[#2a211b]">Why this works. </span>
          {whyThisWorks({ cash: flight.cash, fees: flight.fees, points: flight.points, cabin: flight.cabin, program: 'Avios' })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="min-h-9 px-3"
            onClick={() => {
              toggleTrip(trip)
              showToast(saved ? toastRemoved() : toastSaved())
            }}
          >
            {saved ? <Check className="size-4" /> : <Heart className="size-4" />} {saved ? 'Saved' : 'Save'}
          </Button>
          <Button variant="dark" className="min-h-9 px-4" onClick={() => setOpen(true)}>
            View details <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <BalanceLine points={flight.points} airline={flight.airline} />
      </div>
      {open && <DetailsDrawer trip={trip} onClose={() => setOpen(false)} />}
    </div>
  )
}
