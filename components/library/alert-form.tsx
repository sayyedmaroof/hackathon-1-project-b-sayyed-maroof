'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { matchAirport } from '@/lib/airports'
import { cabins } from '@/lib/data'
import { formatPoints } from '@/lib/savings'
import { useApp } from '@/lib/store'
import type { Cabin } from '@/lib/types'

export function AlertForm({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (alert: { id: string; route: string; detail: string; active: boolean; cabin: Cabin; targetPrice?: number; targetPoints?: number }) => void
}) {
  const { state } = useApp()
  const [origin, setOrigin] = useState(state.search.origin)
  const [destination, setDestination] = useState(state.search.destination)
  const [cabin, setCabin] = useState<Cabin>(state.search.cabin)
  const [targetPrice, setTargetPrice] = useState('')
  const [targetPoints, setTargetPoints] = useState('')
  const [error, setError] = useState('')

  function submit() {
    const from = matchAirport(origin)
    const to = matchAirport(destination)
    if (!from || !to || from.code === to.code) {
      setError('Enter two different airports.')
      return
    }
    const price = targetPrice.trim() ? Number(targetPrice) : undefined
    const points = targetPoints.trim() ? Number(targetPoints) : undefined
    const priceOk = price != null && Number.isFinite(price) && price > 0
    const pointsOk = points != null && Number.isFinite(points) && points > 0
    if (!priceOk && !pointsOk) {
      setError('Add a target price or a points target.')
      return
    }
    const parts: string[] = [cabin]
    if (priceOk) parts.push(`Target under €${Math.round(price)}`)
    if (pointsOk) parts.push(`Target under ${formatPoints(points)} points`)
    onCreate({
      id: `alert-${Date.now()}`,
      route: `${from.city} → ${to.city}`,
      detail: parts.join(' · '),
      active: true,
      cabin,
      targetPrice: priceOk ? Math.round(price) : undefined,
      targetPoints: pointsOk ? Math.round(points) : undefined,
    })
  }

  return (
    <article className="panel min-h-48 md:col-span-2 lg:col-span-3">
      <h2 className="text-xl font-semibold">New alert</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="input-card">
          <span>From</span>
          <input aria-label="Alert origin" value={origin} onChange={(event) => setOrigin(event.target.value)} />
        </label>
        <label className="input-card">
          <span>To</span>
          <input aria-label="Alert destination" value={destination} onChange={(event) => setDestination(event.target.value)} />
        </label>
        <label className="input-card">
          <span>Cabin</span>
          <select aria-label="Alert cabin" value={cabin} onChange={(event) => setCabin(event.target.value as Cabin)}>
            {cabins.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="input-card">
          <span>Target price €</span>
          <input aria-label="Target price" inputMode="decimal" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} />
        </label>
        <label className="input-card">
          <span>Points target</span>
          <input aria-label="Points target" inputMode="numeric" value={targetPoints} onChange={(event) => setTargetPoints(event.target.value)} />
        </label>
      </div>
      {error && <p className="mt-3 text-xs text-[#9a4034]">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="terra" onClick={submit}>
          Save alert
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </article>
  )
}
