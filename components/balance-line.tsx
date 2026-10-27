'use client'

import { aviosShortfall, programForAirline } from '@/lib/loyalty'
import { useApp } from '@/lib/store'

export function BalanceLine({ points, airline }: { points: number; airline: string }) {
  const { state } = useApp()
  const coverage = aviosShortfall(points, state.programs, programForAirline(airline))

  return (
    <p className="text-sm text-[#66584e]">
      {coverage.message}
      {coverage.buyNote && <span className="mt-1 block text-xs text-[#8e522f]">Buying the remaining points would cover this fare.</span>}
    </p>
  )
}
