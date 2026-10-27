'use client'

import type { UserSpendProfile } from '@/lib/cards/types'
import { formatEuro } from '@/lib/savings'

const CATEGORIES: { key: keyof UserSpendProfile; label: string }[] = [
  { key: 'groceriesEur', label: 'Groceries' },
  { key: 'travelEur', label: 'Travel' },
  { key: 'diningEur', label: 'Dining' },
  { key: 'fuelEur', label: 'Fuel' },
  { key: 'otherEur', label: 'Other' },
]

export function WalletSpendPanel({
  spend,
  onChange,
}: {
  spend: UserSpendProfile
  onChange: (next: UserSpendProfile) => void
}) {
  const categorySum = CATEGORIES.reduce((s, c) => s + spend[c.key], 0)
  const mismatch = spend.monthlyTotalEur > 0 && categorySum > 0 && Math.abs(categorySum - spend.monthlyTotalEur) > 50

  return (
    <article className="panel">
      <p className="eyebrow">Step 3</p>
      <h2 className="mt-1 text-xl font-semibold">Monthly spend</h2>
      <p className="mt-1 text-sm text-[#76675c]">
        Your real budget — we never suggest spending more than this to earn points.
      </p>

      <label className="input-card mt-4">
        <span>Total monthly spend (EUR)</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          aria-label="Total monthly spend"
          value={spend.monthlyTotalEur}
          onChange={(e) => onChange({ ...spend, monthlyTotalEur: Number(e.target.value) || 0 })}
        />
      </label>

      <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-[#a39182]">By category (optional)</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map(({ key, label }) => (
          <label key={key} className="input-card">
            <span>{label}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label={label}
              value={spend[key]}
              onChange={(e) => onChange({ ...spend, [key]: Number(e.target.value) || 0 })}
            />
          </label>
        ))}
      </div>

      {mismatch ? (
        <p className="mt-3 text-xs text-[#8e522f]">
          Categories sum to {formatEuro(categorySum)} — close to your total ({formatEuro(spend.monthlyTotalEur)}) helps
          allocate earn accurately.
        </p>
      ) : null}
    </article>
  )
}
