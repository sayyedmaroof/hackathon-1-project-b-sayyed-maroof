'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/button'
import { DetailsDrawer } from '@/components/details-drawer'
import { EmptyCard, LibraryFrame, Promo } from '@/components/library/library-frame'
import { navigate } from '@/lib/hash-view'
import { calculateSavings, formatEuro, savingsLabel } from '@/lib/savings'
import { useApp } from '@/lib/store'
import { toastRemoved } from '@/lib/toast-messages'
import type { Trip } from '@/lib/types'

export function TripsView() {
  const { state, removeTrip, renameTrip, showToast } = useApp()
  const [open, setOpen] = useState<Trip | null>(null)
  const selected = open ? state.trips.find((trip) => trip.id === open.id) ?? open : null

  return (
    <LibraryFrame
      eyebrow="Personal library"
      title="Saved trips"
      lede="Your shortlist of smarter ways to get there."
      action="Add new"
      onAction={() => navigate('search')}
    >
      {state.trips.length === 0 ? (
        <EmptyCard title="No saved trips yet" detail="Search a route and save an option to keep it here." action="Search flights" onAction={() => navigate('search')} />
      ) : (
        state.trips.map((trip) => {
          const savings = calculateSavings(trip)
          return (
            <article key={trip.id} className="panel min-h-48">
              <div className="flex items-center justify-between">
                <span className="status">{savingsLabel(savings.verdict)}</span>
                <Tag className="size-4 text-[#b86632]" />
              </div>
              <label className="mt-8 block text-xs font-semibold text-[#8a796b]">
                Name
                <input
                  aria-label={`Rename ${trip.title}`}
                  defaultValue={trip.title}
                  key={`${trip.id}-${trip.title}`}
                  onBlur={(event) => renameTrip(trip.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                  }}
                  className="mt-2 w-full rounded-xl border border-[#dfd2c4] bg-[#fffdf9] px-3 py-2 text-lg font-semibold text-[#2a211b]"
                />
              </label>
              <p className="mt-2 text-sm text-[#76675c]">{trip.detail}</p>
              <p className="mt-4 text-sm font-semibold text-[#b86632]">{formatEuro(savings.netSaving)} estimated net saving</p>
              <div className="mt-4 flex gap-2">
                <Button variant="dark" className="min-h-9 px-4" onClick={() => setOpen(trip)}>
                  Details
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-9 px-3"
                  onClick={() => {
                    removeTrip(trip.id)
                    showToast(toastRemoved())
                  }}
                >
                  Remove
                </Button>
              </div>
            </article>
          )
        })
      )}
      <Promo />
      {selected && <DetailsDrawer trip={selected} onClose={() => setOpen(null)} />}
    </LibraryFrame>
  )
}
