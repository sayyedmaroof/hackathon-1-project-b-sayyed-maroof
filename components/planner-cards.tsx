'use client'

import { Heart } from 'lucide-react'
import { BalanceLine } from '@/components/balance-line'
import { calculateSavings, formatEuro, formatPoints, savingsLabel } from '@/lib/savings'
import type { Trip } from '@/lib/types'

export function PlanSummary({ plan }: { plan: Trip }) {
  const savings = calculateSavings(plan)
  return (
    <div className="mt-6 border-t border-[#e8ddd1] pt-5">
      <Row label="Taxes & fees" value={formatEuro(plan.fees)} />
      <Row label="Points" value={`${formatPoints(plan.points)} ${plan.program}`} />
      <Row label="Net saving" value={formatEuro(savings.netSaving)} accent />
      <p className="mt-4 text-xs text-[#8a796b]">
        {savings.valuePerPoint.toFixed(2)}¢ per point · {savingsLabel(savings.verdict)}
      </p>
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-between text-sm first:mt-0">
      <span className="text-[#76675c]">{label}</span>
      <strong className={accent ? 'text-[#b86632]' : undefined}>{value}</strong>
    </div>
  )
}

export function PlanCard({ plan, onSave, onDetails }: { plan: Trip; onSave: () => void; onDetails: () => void }) {
  const savings = calculateSavings(plan)
  return (
    <div className="mt-4 rounded-xl border border-[#dfd2c4] bg-[#fffaf2] p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{plan.title}</span>
        <span className="status">{savingsLabel(savings.verdict)}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold">{formatEuro(plan.fees)}</p>
          <p className="text-xs text-[#8a796b]">
            + {formatPoints(plan.points)} {plan.program} · {plan.detail}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button type="button" onClick={onSave} className="min-h-11 text-sm font-semibold text-[#b86632]">
            Save itinerary <Heart className="ml-1 inline size-4" />
          </button>
          <button type="button" onClick={onDetails} className="min-h-11 text-sm font-semibold text-[#66584e]">
            See details
          </button>
        </div>
      </div>
      <div className="mt-3">
        <BalanceLine points={plan.points} airline={plan.airline ?? 'British Airways'} />
      </div>
    </div>
  )
}
