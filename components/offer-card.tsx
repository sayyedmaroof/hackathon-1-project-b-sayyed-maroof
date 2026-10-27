'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/button'
import { OfferDrawer } from '@/components/offer-drawer'
import { SavingsBadge } from '@/components/savings-badge'
import { awardChipLabel } from '@/lib/cards/chip-label'
import type { PointsPlan } from '@/lib/cards/types'
import type { FlightOffer } from '@/lib/providers/types'
import { calculateSavings, formatCents, formatEuro, formatPct, formatPoints } from '@/lib/savings'
import { cn } from '@/lib/utils'

export function OfferCard({
  offer,
  normalPrice,
  resultsPath,
  userVerified,
  isSampleProfile,
  pointsPlan,
  planCurrencyId,
}: {
  offer: FlightOffer
  normalPrice: number
  resultsPath: string
  userVerified: boolean
  isSampleProfile: boolean
  pointsPlan: PointsPlan | null
  planCurrencyId?: string
}) {
  const chip = offer.kind === 'award' && offer.points > 0 ? awardChipLabel(pointsPlan, planCurrencyId) : null
  const [open, setOpen] = useState(false)
  const savings = calculateSavings({
    cash: offer.cashPrice,
    fees: offer.fees,
    points: offer.points,
  })

  return (
    <div className="result-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn('airline-mark', offer.tone)}>{offer.airlineCode}</span>
          <div>
            <p className="font-semibold">{offer.airline}</p>
            <p className="text-xs text-[#8a796b]">
              {offer.duration} · {offer.stops}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {offer.isSampleAward ? <span className="mock-label">Sample award data</span> : null}
          {chip ? <span className="status text-[11px]">{chip}</span> : null}
          <SavingsBadge cash={offer.cashPrice} fees={offer.fees} points={offer.points} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-5">
        <div>
          <p className="text-2xl font-semibold tracking-[-.04em]">{offer.departTime}</p>
          <p className="mt-1 text-xs text-[#8a796b]">{offer.origin}</p>
        </div>
        <div className="flex-1 text-center">
          <div className="mx-auto h-px max-w-[130px] bg-[#d7c9b9]" />
          <p className="mt-2 text-[10px] text-[#8a796b]">{offer.stops}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-[-.04em]">{offer.arriveTime}</p>
          <p className="mt-1 text-xs text-[#8a796b]">{offer.destination}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-[#8a796b]">Cash price</p>
          <p className="text-lg font-semibold">{formatEuro(offer.cashPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8a796b]">Award</p>
          <p className="text-lg font-semibold">
            {offer.points ? (
              <>
                {formatPoints(offer.points)} <span className="text-xs font-normal">+ {formatEuro(offer.fees)}</span>
              </>
            ) : (
              '—'
            )}
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
          {offer.whyThisWorks}
        </p>
        <Button variant="dark" className="min-h-11 px-4" onClick={() => setOpen(true)}>
          View details <ArrowRight className="size-4" />
        </Button>
      </div>
      {open ? (
        <OfferDrawer
          offer={offer}
          normalPrice={normalPrice}
          resultsPath={resultsPath}
          userVerified={userVerified}
          isSampleProfile={isSampleProfile}
          pointsPlan={pointsPlan}
          planCurrencyId={planCurrencyId}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  )
}
