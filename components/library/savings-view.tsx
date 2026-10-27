'use client'

import { Tag } from 'lucide-react'
import { EmptyCard, LibraryFrame, Promo } from '@/components/library/library-frame'
import { navigate } from '@/lib/hash-view'
import { calculateSavings, formatEuro, formatPct, savingsLabel } from '@/lib/savings'
import { useApp } from '@/lib/store'

export function SavingsView() {
  const { state } = useApp()
  const rows = state.trips.map((trip) => ({ trip, savings: calculateSavings(trip) }))
  const net = rows.reduce((sum, row) => sum + row.savings.netSaving, 0)
  const avoided = rows.reduce((sum, row) => sum + row.savings.cashAvoided, 0)
  const cash = rows.reduce((sum, row) => sum + row.trip.cash, 0)

  return (
    <LibraryFrame
      eyebrow="Personal library"
      title="Savings insights"
      lede="A clearer view of what your points are making possible. Figures use sample fares at 1.2¢ per point."
      action="Add new"
      onAction={() => navigate('search')}
    >
      <article className="panel min-h-48">
        <div className="flex items-center justify-between">
          <span className="status">Estimated</span>
          <Tag className="size-4 text-[#b86632]" />
        </div>
        <h2 className="mt-10 text-2xl font-semibold">Estimated net saving</h2>
        <p className="mt-2 text-4xl font-semibold tracking-[-.05em]">{formatEuro(net)}</p>
        <p className="mt-6 text-sm text-[#76675c]">
          Cash avoided {formatEuro(avoided)} · {formatPct(cash === 0 ? 0 : net / cash)} of sampled cash fares · {rows.length}{' '}
          {rows.length === 1 ? 'trip' : 'trips'}
        </p>
        <p className="mt-3 text-xs font-semibold text-[#8e522f]">Estimated, not realized savings</p>
      </article>
      {rows.length === 0 ? (
        <EmptyCard title="No saved trips yet" detail="Save a fare to see what it would change." action="Search flights" onAction={() => navigate('search')} />
      ) : (
        rows.map(({ trip, savings }) => (
          <article key={trip.id} className="panel min-h-48">
            <div className="flex items-center justify-between">
              <span className="status">{savingsLabel(savings.verdict)}</span>
              <Tag className="size-4 text-[#b86632]" />
            </div>
            <h2 className="mt-10 text-2xl font-semibold">{trip.title}</h2>
            <p className="mt-2 text-sm text-[#76675c]">
              {savings.valuePerPoint.toFixed(2)}¢ per point · fees {formatEuro(trip.fees)} · cash {formatEuro(trip.cash)}
            </p>
            <p className="mt-6 text-sm font-semibold text-[#b86632]">
              {formatEuro(savings.netSaving)} net · {formatEuro(savings.cashAvoided)} cash avoided
            </p>
          </article>
        ))
      )}
      <Promo />
    </LibraryFrame>
  )
}
