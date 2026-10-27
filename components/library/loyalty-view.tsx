'use client'

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/button'
import { EmptyCard, LibraryFrame, Promo } from '@/components/library/library-frame'
import { LOYALTY_CATALOG, revolutEarn, revolutRateLabel } from '@/lib/loyalty'
import { formatPoints } from '@/lib/savings'
import { useApp } from '@/lib/store'
import type { RevolutPlan } from '@/lib/types'

const plans: RevolutPlan[] = ['Premium', 'Metal', 'Ultra']

export function LoyaltyView() {
  const { state, addProgram, setBalance, deleteProgram, setRevolutPlan, setMonthlySpend, showToast } = useApp()
  const available = LOYALTY_CATALOG.filter((program) => !state.programs.some((item) => item.id === program.id))
  const [pick, setPick] = useState(available[0]?.id ?? '')
  const selectedId = available.some((program) => program.id === pick) ? pick : available[0]?.id ?? ''
  const earn = revolutEarn(state.monthlySpend, state.revolutPlan)

  function addSelected() {
    const program = LOYALTY_CATALOG.find((item) => item.id === selectedId)
    if (!program) {
      showToast('All programs are already in your list')
      return
    }
    addProgram(program)
    showToast('Program added')
  }

  return (
    <LibraryFrame
      eyebrow="Personal library"
      title="Points & loyalty"
      lede="Keep your balances handy. We’ll use them to spot better award opportunities."
      action="Add new"
      onAction={addSelected}
    >
      <article className="panel min-h-48 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-semibold">Revolut plan</h2>
        <p className="mt-2 text-sm text-[#76675c]">The same rate estimates points earned on a cash fare.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="input-card">
            <span>Plan</span>
            <select aria-label="Revolut plan" value={state.revolutPlan} onChange={(event) => setRevolutPlan(event.target.value as RevolutPlan)}>
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan} · {revolutRateLabel(plan)}
                </option>
              ))}
            </select>
          </label>
          <label className="input-card">
            <span>Monthly spend €</span>
            <input
              aria-label="Monthly spend"
              type="number"
              min={0}
              value={state.monthlySpend}
              onChange={(event) => setMonthlySpend(Math.max(0, Number(event.target.value) || 0))}
            />
          </label>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#b86632]">
          {formatPoints(earn.perMonth)} points a month · {formatPoints(earn.perYear)} a year · {revolutRateLabel(state.revolutPlan)}
        </p>
      </article>
      {available.length > 0 && (
        <article className="panel min-h-48">
          <h2 className="text-xl font-semibold">Add a program</h2>
          <label className="mt-4 block text-xs font-semibold text-[#8a796b]">
            Catalog
            <select aria-label="Loyalty program" value={selectedId} onChange={(event) => setPick(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfd2c4] bg-[#fffdf9] px-3 py-2 text-sm font-semibold">
              {available.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>
          <Button variant="terra" className="mt-4" onClick={addSelected}>
            Add
          </Button>
        </article>
      )}
      {state.programs.length === 0 ? (
        <EmptyCard
          title="No programs yet"
          detail="Add Iberia, British Airways, Qatar, Revolut, or Amex."
          action="Add a program"
          onAction={addSelected}
        />
      ) : (
        state.programs.map((program) => (
          <article key={program.id} className="panel min-h-48">
            <div className="flex items-center justify-between">
              <span className="status">Saved</span>
              <Tag className="size-4 text-[#b86632]" />
            </div>
            <h2 className="mt-10 text-2xl font-semibold">{program.name}</h2>
            <p className="mt-2 text-sm text-[#76675c]">
              {formatPoints(program.balance)} {program.unit} · {program.note}
            </p>
            <label className="mt-6 block text-xs font-semibold text-[#8a796b]">
              Balance
              <input
                type="number"
                min={0}
                aria-label={`${program.name} balance`}
                value={program.balance}
                onChange={(event) => setBalance(program.id, Math.max(0, Number(event.target.value) || 0))}
                className="mt-2 w-full rounded-xl border border-[#dfd2c4] bg-[#fffdf9] px-3 py-2 text-sm font-semibold text-[#2a211b]"
              />
            </label>
            <Button
              variant="ghost"
              className="mt-4 min-h-9 px-3"
              onClick={() => {
                deleteProgram(program.id)
                showToast('Program removed')
              }}
            >
              Delete
            </Button>
          </article>
        ))
      )}
      <Promo />
    </LibraryFrame>
  )
}
