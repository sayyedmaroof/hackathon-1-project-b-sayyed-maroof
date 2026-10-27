'use client'

import { Check } from 'lucide-react'
import { CARD_CATALOG, REVOLUT_PLAN_EARN } from '@/lib/cards/catalog'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'
import { cardEarnSummary, currencyShortName } from '@/lib/cards/display'
import type { CatalogCardId, RevolutPlanId } from '@/lib/cards/types'
import { cn } from '@/lib/utils'

export function WalletCardsPanel({
  selectedIds,
  revolutPlan,
  onToggle,
  onRevolutPlan,
}: {
  selectedIds: Set<CatalogCardId>
  revolutPlan: RevolutPlanId | ''
  onToggle: (id: CatalogCardId) => void
  onRevolutPlan: (plan: RevolutPlanId) => void
}) {
  const hasUnverified = CARD_CATALOG.some((c) => !c.verified)

  return (
    <article className="panel lg:col-span-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2 className="mt-1 text-xl font-semibold">Cards you hold</h2>
          <p className="mt-1 text-sm text-[#76675c]">
            Tap to add or remove. We use these to estimate earn on your monthly spend.
          </p>
        </div>
        <p className="text-sm font-semibold text-[#b86632]">
          {selectedIds.size} selected
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CARD_CATALOG.map((card) => {
          const selected = selectedIds.has(card.id)
          const earn =
            card.id === 'revolut' && revolutPlan
              ? `${cardEarnSummary({ ...card, baseEarnPerEur: REVOLUT_PLAN_EARN[revolutPlan].baseEarnPerEur })} · €${REVOLUT_PLAN_EARN[revolutPlan].monthlyFeeEur}/mo`
              : cardEarnSummary(card)
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onToggle(card.id)}
              aria-pressed={selected}
              className={cn(
                'relative min-h-[104px] rounded-xl border p-4 text-left transition',
                selected
                  ? 'border-[#b86632] bg-[#fff5eb] shadow-sm'
                  : 'border-[#e1d6c8] bg-[#fffdf9] hover:border-[#d7c9b9]',
              )}
            >
              {selected ? (
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-[#b86632] text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              ) : null}
              <p className="pr-8 text-sm font-semibold leading-snug">{card.name}</p>
              <p className="mt-1 text-xs text-[#8a796b]">{card.issuer}</p>
              <p className="mt-2 text-xs font-medium text-[#66584e]">
                {currencyShortName(card.currency)} · {earn}
              </p>
              {card.verified ? (
                <span className="status mt-2">Guide-verified earn</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {selectedIds.has('revolut') ? (
        <div className="mt-5 rounded-xl border border-[#e8ddd1] bg-[#fffdf9] p-4">
          <label className="input-card max-w-md border-0 bg-transparent p-0">
            <span>Revolut plan</span>
            <select
              id="revolut-plan"
              className="mt-1 min-h-11 w-full rounded-lg border border-[#dfd2c4] bg-white px-3 py-2 text-sm font-semibold"
              value={revolutPlan || 'premium'}
              onChange={(e) => onRevolutPlan(e.target.value as RevolutPlanId)}
            >
              <option value="premium">Premium · 1 pt / €4 · €9.99/mo</option>
              <option value="metal">Metal · 1 pt / €2 · €15.99/mo</option>
              <option value="ultra">Ultra · 1 pt / €1 · €55/mo</option>
            </select>
          </label>
        </div>
      ) : null}

      {hasUnverified ? (
        <p className="mock-label mt-4 inline-block text-[10px]">{ILLUSTRATIVE_RATES_LABEL}</p>
      ) : null}
    </article>
  )
}
