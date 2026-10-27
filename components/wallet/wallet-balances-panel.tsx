'use client'

import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import { formatPoints } from '@/lib/savings'
import type { PointCurrencyId } from '@/lib/cards/types'
import { cn } from '@/lib/utils'

const AVIOS_GROUP: PointCurrencyId[] = ['iberia_avios', 'ba_avios', 'vueling_avios', 'qatar_avios']
const OTHER_GROUP: PointCurrencyId[] = ['revolut_revpoints', 'amex_mr', 'air_europa_suma', 'miles_and_more']

function BalanceField({
  id,
  value,
  onChange,
}: {
  id: PointCurrencyId
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="input-card">
      <span>{POINT_CURRENCIES[id].displayName}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`Balance ${POINT_CURRENCIES[id].displayName}`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  )
}

export function WalletBalancesPanel({
  balances,
  onChange,
}: {
  balances: Record<string, number>
  onChange: (id: PointCurrencyId, value: number) => void
}) {
  const total = [...AVIOS_GROUP, ...OTHER_GROUP].reduce((s, id) => s + (balances[id] ?? 0), 0)
  const withBalance = [...AVIOS_GROUP, ...OTHER_GROUP].filter((id) => (balances[id] ?? 0) > 0).length

  return (
    <article className="panel">
      <p className="eyebrow">Step 2</p>
      <h2 className="mt-1 text-xl font-semibold">Point balances</h2>
      <p className="mt-1 text-sm text-[#76675c]">What you have today across programs (transfers are applied when planning).</p>
      <p className="mt-3 text-sm">
        <span className="font-semibold text-[#2a211b]">{formatPoints(total)}</span>
        <span className="text-[#76675c]"> total across {withBalance} programs with balance</span>
      </p>

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[#a39182]">Avios family</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {AVIOS_GROUP.map((id) => (
            <BalanceField key={id} id={id} value={balances[id] ?? 0} onChange={(v) => onChange(id, v)} />
          ))}
        </div>
      </div>

      <div className={cn('mt-5')}>
        <h3 className="text-xs font-bold uppercase tracking-[.12em] text-[#a39182]">Other programs</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {OTHER_GROUP.map((id) => (
            <BalanceField key={id} id={id} value={balances[id] ?? 0} onChange={(v) => onChange(id, v)} />
          ))}
        </div>
      </div>
    </article>
  )
}
