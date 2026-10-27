'use client'

import { CASH_FILTER_MAX, POINTS_FILTER_MAX } from '@/lib/search'
import { formatEuro, formatPoints } from '@/lib/savings'
import type { DepartureWindow, FlightFilters, StopsFilter } from '@/lib/types'
import { cn } from '@/lib/utils'

const stopOptions: Array<{ id: StopsFilter; label: string }> = [
  { id: 'any', label: 'Any' },
  { id: 'nonstop', label: 'Nonstop' },
  { id: '1', label: '1 stop' },
]

const windowOptions: Array<{ id: DepartureWindow; label: string }> = [
  { id: 'any', label: 'Any' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
]

export function ResultsFilterPanel({
  filters,
  airlines,
  count,
  onChange,
  onReset,
}: {
  filters: FlightFilters
  airlines: string[]
  count: number
  onChange: (filters: FlightFilters) => void
  onReset: () => void
}) {
  const selected = filters.airlineSelection ? filters.airlines : airlines

  function toggleAirline(airline: string) {
    const next = new Set(selected)
    if (next.has(airline)) next.delete(airline)
    else next.add(airline)
    const list = [...next]
    const allOn = airlines.length > 0 && list.length === airlines.length
    onChange({ ...filters, airlineSelection: !allOn, airlines: allOn ? [] : list })
  }

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Filter results{count > 0 ? ` · ${count}` : ''}</h3>
        <button type="button" onClick={onReset} className="min-h-11 px-2 text-xs font-semibold text-[#b86632]">
          Reset
        </button>
      </div>
      <div className="mt-6 border-t border-[#e8ddd1] pt-4">
        <p className="text-xs font-semibold">Cash budget</p>
        <input
          aria-label="Maximum cash fare"
          type="range"
          min={0}
          max={CASH_FILTER_MAX}
          step={50}
          value={filters.maxCash}
          onChange={(event) => onChange({ ...filters, maxCash: Number(event.target.value) })}
          className="mt-3 w-full accent-[#b86632]"
        />
        <p className="text-xs text-[#8a796b]">Up to {formatEuro(filters.maxCash)}</p>
      </div>
      <div className="mt-6 border-t border-[#e8ddd1] pt-4">
        <p className="text-xs font-semibold">Points budget</p>
        <input
          aria-label="Maximum points"
          type="range"
          min={0}
          max={POINTS_FILTER_MAX}
          step={1000}
          value={filters.maxPoints}
          onChange={(event) => onChange({ ...filters, maxPoints: Number(event.target.value) })}
          className="mt-3 w-full accent-[#b86632]"
        />
        <p className="text-xs text-[#8a796b]">Up to {formatPoints(filters.maxPoints)}</p>
      </div>
      <div className="mt-6 border-t border-[#e8ddd1] pt-4">
        <p className="text-xs font-semibold">Airline</p>
        <div className="mt-3 flex flex-col gap-2">
          {airlines.length === 0 && <p className="text-xs text-[#8a796b]">Any</p>}
          {airlines.map((airline) => (
            <label key={airline} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[#b86632]"
                checked={!filters.airlineSelection || filters.airlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
              />
              {airline}
            </label>
          ))}
        </div>
      </div>
      <ChoiceGroup label="Stops" value={filters.stops} options={stopOptions} onChange={(stops) => onChange({ ...filters, stops })} />
      <ChoiceGroup
        label="Departure time"
        value={filters.departureWindow}
        options={windowOptions}
        onChange={(departureWindow) => onChange({ ...filters, departureWindow })}
      />
    </div>
  )
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ id: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="mt-6 border-t border-[#e8ddd1] pt-4">
      <p className="text-xs font-semibold">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              'min-h-11 rounded-full border px-3 py-2 text-xs font-semibold',
              value === option.id ? 'border-[#b86632] bg-[#ead2bc] text-[#2a211b]' : 'border-[#dfd2c4] text-[#66584e]',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
