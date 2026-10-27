'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/button'
import { BalanceLine } from '@/components/balance-line'
import { AWARD_STEPS, revolutPointsForSpend, revolutRateLabel } from '@/lib/loyalty'
import { calculateSavings, formatCents, formatEuro, formatPoints, formatPct } from '@/lib/savings'
import { useApp } from '@/lib/store'
import { copyText, toastCopied, toastError } from '@/lib/toast-messages'
import type { Trip } from '@/lib/types'

export function DetailsDrawer({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const { state, toggleChecklist, showToast } = useApp()
  const closeRef = useRef<HTMLButtonElement>(null)
  const savings = calculateSavings(trip)
  const earned = revolutPointsForSpend(trip.cash, state.revolutPlan)
  const done = new Set(state.checklists[trip.id] ?? trip.checklist ?? [])
  const bookUrl = trip.bookUrl ?? `https://example.com/book?flight=${encodeURIComponent(trip.id)}`

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const summaryLine = `${trip.title}: net ${formatEuro(savings.netSaving)} (${formatPct(savings.savingPct)}), ${formatCents(savings.valuePerPoint)} per point`

  async function copyValue(text: string) {
    const ok = await copyText(text)
    showToast(ok ? toastCopied() : toastError('Could not copy to clipboard'))
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-[#2a211b]/40" aria-label="Close details" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Trip details for ${trip.title}`}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-auto bg-[#fffaf2] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Trip details</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{trip.title}</h2>
            <p className="mt-1 text-sm text-[#76675c]">{trip.detail}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#dfd2c4]"
          >
            <X className="size-4" />
          </button>
        </div>

        <section className="mt-6 border-t border-[#e8ddd1] pt-5">
          <h3 className="font-semibold">Price breakdown</h3>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <Row label="Cash fare" value={formatEuro(trip.cash)} />
            <Row label="Taxes and fees" value={formatEuro(trip.fees)} />
            <Row label="Points" value={`${formatPoints(trip.points)} ${trip.program}`} />
            <Row label="Points value at 1.2¢" value={formatEuro(savings.pointsValue)} />
            <Row label="Cash avoided" value={formatEuro(savings.cashAvoided)} />
            <Row label="Net saving" value={`${formatEuro(savings.netSaving)} · ${formatPct(savings.savingPct)}`} accent />
            <Row label="Cents per point" value={formatCents(savings.valuePerPoint)} />
          </dl>
          <div className="mt-4">
            <BalanceLine points={trip.points} airline={trip.airline ?? 'Iberia'} />
          </div>
        </section>

        <section className="mt-6 border-t border-[#e8ddd1] pt-5">
          <h3 className="font-semibold">Transfer path</h3>
          <ol className="mt-3 flex flex-col gap-2 text-sm">
            {['Revolut', 'British Airways', 'Iberia'].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-[#ead2bc] text-xs font-semibold text-[#8e522f]">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-5 text-[#8a796b]">Accounts must be 30+ days old and personal details must match.</p>
        </section>

        <section className="mt-6 border-t border-[#e8ddd1] pt-5">
          <h3 className="font-semibold">Points you would earn</h3>
          <p className="mt-2 text-sm leading-6 text-[#66584e]">
            Paying the cash fare would earn <strong>{formatPoints(earned)} RevPoints</strong> on {state.revolutPlan} ({revolutRateLabel(state.revolutPlan)}).
          </p>
        </section>

        <section className="mt-6 border-t border-[#e8ddd1] pt-5">
          <h3 className="font-semibold">How to book this award</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {AWARD_STEPS.map((step) => (
              <li key={step.id}>
                <label className="flex items-start gap-2 text-sm leading-5">
                  <input
                    type="checkbox"
                    className="mt-1 accent-[#b86632]"
                    checked={done.has(step.id)}
                    onChange={() => toggleChecklist(trip.id, step.id)}
                  />
                  {step.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button variant="terra" onClick={() => window.open(bookUrl, '_blank', 'noopener,noreferrer')}>
            Book
          </Button>
          <Button variant="outline" onClick={() => copyValue(bookUrl)}>
            Copy link
          </Button>
          <Button variant="ghost" onClick={() => copyValue(summaryLine)}>
            Copy summary
          </Button>
        </div>
        <p className="mt-2 text-xs text-[#8a796b]">Sample booking link · Sample data</p>
      </aside>
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#76675c]">{label}</dt>
      <dd className={accent ? 'font-semibold text-[#b86632]' : 'font-semibold'}>{value}</dd>
    </div>
  )
}
