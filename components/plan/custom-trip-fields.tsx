'use client'

import { PlaceSearch } from '@/components/plan/place-search'
import type { CustomTripDraft } from '@/lib/trips/catalog'

const AWARD_OPTIONS: { id: CustomTripDraft['awardCurrency']; label: string }[] = [
  { id: 'iberia_avios', label: 'Iberia Avios' },
  { id: 'ba_avios', label: 'British Airways Avios' },
  { id: 'qatar_avios', label: 'Qatar Avios' },
]

export function CustomTripFields({
  value,
  onChange,
}: {
  value: CustomTripDraft
  onChange: (next: CustomTripDraft) => void
}) {
  function patch(partial: Partial<CustomTripDraft>) {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <PlaceSearch
        label="Origin"
        city={value.origin}
        iata={value.originIata}
        onPick={(hit) => patch({ origin: hit.city, originIata: hit.iata })}
      />
      <PlaceSearch
        label="Destination"
        city={value.destination}
        iata={value.destinationIata}
        onPick={(hit) => patch({ destination: hit.city, destinationIata: hit.iata })}
      />
      <label className="text-sm font-semibold">
        Cabin
        <select
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.cabin}
          onChange={(e) => patch({ cabin: e.target.value as CustomTripDraft['cabin'] })}
        >
          <option value="Economy">Economy</option>
          <option value="Business">Business</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Journey
        <select
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.journey}
          onChange={(e) => patch({ journey: e.target.value as CustomTripDraft['journey'] })}
        >
          <option value="return">Return</option>
          <option value="one_way">One-way</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Award programme
        <select
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.awardCurrency}
          onChange={(e) => patch({ awardCurrency: e.target.value as CustomTripDraft['awardCurrency'] })}
        >
          {AWARD_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Points required
        <input
          type="number"
          min={1}
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.pointsRequired}
          onChange={(e) => patch({ pointsRequired: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="text-sm font-semibold">
        Taxes (EUR)
        <input
          type="number"
          min={0}
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.taxesEur}
          onChange={(e) => patch({ taxesEur: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="text-sm font-semibold">
        Typical cash (EUR)
        <input
          type="number"
          min={1}
          className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
          value={value.typicalCashEur}
          onChange={(e) => patch({ typicalCashEur: Number(e.target.value) || 0 })}
        />
      </label>
      <p className="sm:col-span-2 text-xs text-[#76675c]">
        Airports come from Duffel place search when a key is set, otherwise the sample airport list. Cash can be checked
        live after you pick a date. Points stay a sample you confirm.
      </p>
    </div>
  )
}
