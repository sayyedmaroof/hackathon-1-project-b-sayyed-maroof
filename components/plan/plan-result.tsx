'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { DataModeLabel } from '@/components/data-mode-label'
import { Button } from '@/components/ui/button'
import { PlanNarration } from '@/components/plan/plan-narration'
import { PointsChart } from '@/components/plan/points-chart'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'
import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import { cashSourceLabel, formatPoints, planHeadline, planWindowSchedule, statusLabel, verdictLabel } from '@/lib/plan/display'
import { formatPlanDate } from '@/lib/plan/dates'
import { cashVersusHacked, feesFromNetSaving } from '@/lib/plan/value'
import type { SpendPlan, TripRanking } from '@/lib/plan/types'
import { formatEuro } from '@/lib/savings'
import { getTrip, type SampleTrip } from '@/lib/trips/catalog'

function monthEarned(row: SpendPlan['schedule'][number]) {
  return Object.values(row.pointsEarnedByCard).reduce((sum, n) => sum + n, 0)
}

export function PlanResult({
  plan,
  ranking,
  trip,
  travelDate,
  duffelConfigured,
  fareLoading,
  fareNote,
  verified,
  saveMessage,
  onCheckFare,
  onSave,
  onPickTrip,
}: {
  plan: SpendPlan
  ranking: TripRanking | null
  trip: SampleTrip
  travelDate: string
  duffelConfigured: boolean
  fareLoading: boolean
  fareNote: string
  verified: boolean
  saveMessage: string
  onCheckFare: () => void
  onSave: () => void
  onPickTrip: (tripId: string) => void
}) {
  const [guestSaveOpen, setGuestSaveOpen] = useState(false)
  const pathname = usePathname()
  const search = useSearchParams()
  const next = `${pathname}?${search.toString()}`
  const program = POINT_CURRENCIES[plan.awardCurrency].displayName
  const positive = plan.status === 'on_track' || plan.status === 'ready_now'
  const windowSchedule = planWindowSchedule(plan.schedule)
  const reachable = ranking?.reachable ?? []
  const gap = positive ? Math.max(0, plan.reachableAtReadyBy - plan.pointsRequired) : plan.shortfall
  const feesEur = feesFromNetSaving({
    cashEur: plan.cashBaseline.eur,
    taxesEur: trip.taxesEur,
    pointsRequired: plan.pointsRequired,
    currency: plan.awardCurrency,
    netSavingEur: plan.netSavingEur,
  })
  const costs = cashVersusHacked({
    cashEur: plan.cashBaseline.eur,
    taxesEur: trip.taxesEur,
    feesEur,
  })

  return (
    <section className="flex flex-col gap-6">
      <article className="overflow-hidden rounded-[18px] border border-[#d9cbbb] bg-[#2a211b] text-[#fffaf2]">
        <div className="relative min-h-[200px] overflow-hidden sm:min-h-[240px]">
          {trip?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trip.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[#3a2f27]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a211b] via-[#2a211b]/55 to-transparent" />
          <div className="relative flex min-h-[200px] flex-col justify-end gap-3 p-6 sm:min-h-[240px] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={positive ? 'status' : 'mock-label'} aria-live="polite">
                {statusLabel(plan.status)}
              </span>
              <span className={plan.verdict === 'poor' ? 'mock-label' : 'status'}>{verdictLabel(plan.verdict)}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d89a70]">
              {trip ? `${trip.origin} → ${trip.destination}` : plan.tripId} · {formatPlanDate(travelDate)}
            </p>
            <h2 className="max-w-2xl text-[clamp(1.7rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.04em]">
              {trip?.destination ?? 'Your trip'}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#eee4d8] sm:text-base">{planHeadline(plan, program)}</p>
          </div>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[16px] border-2 border-[#c4b4a4] bg-[#fffaf2] p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#76675c]">Original cost</p>
          {fareLoading ? (
            <p className="mt-3 h-10 w-32 animate-pulse rounded-md bg-[#eee4d8]" aria-busy="true">
              <span className="sr-only">Checking live fare</span>
            </p>
          ) : (
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink">{formatEuro(costs.realCostEur)}</p>
          )}
          <p className="mt-2 text-sm text-[#76675c]">Pay cash for the ticket · {cashSourceLabel(plan.cashSource)}</p>
          {plan.cashSource === 'duffel_live' && plan.cashBaseline.fetchedAt ? (
            <p className="mt-1 text-xs text-[#76675c]">
              Checked {new Date(plan.cashBaseline.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : null}
          {plan.cashSource === 'duffel_test' ? (
            <div className="mt-2">
              <DataModeLabel mode="test" />
            </div>
          ) : null}
          {duffelConfigured ? (
            <Button className="mt-4" variant="outline" disabled={fareLoading} onClick={onCheckFare}>
              {fareLoading ? 'Checking…' : 'Check live cash fare'}
            </Button>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {fareLoading ? 'Checking live cash fare' : fareNote}
          </p>
          {fareNote ? <p className="mt-2 text-sm text-[#76675c]">{fareNote}</p> : null}
        </article>
        <article className="rounded-[16px] border-2 border-[#b86632] bg-[#fff6ee] p-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#b86632]">Hacked cost</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#b86632]">{formatEuro(costs.hackedCostEur)}</p>
          <p className="mt-2 text-sm text-[#76675c]">
            Award taxes {formatEuro(trip.taxesEur)}
            {feesEur > 0.5 ? ` + card fees ${formatEuro(feesEur)}` : ''}
          </p>
          <p className="mt-3 text-lg font-semibold text-[#2f5d32]">You save {formatEuro(costs.youSaveEur)}</p>
          {plan.usedUnverifiedData ? <p className="mt-2 text-xs text-[#76675c]">{ILLUSTRATIVE_RATES_LABEL}</p> : null}
        </article>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="panel py-5">
          <p className="metric-index">Needed</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{formatPoints(plan.pointsRequired)}</p>
          <p className="mt-1 text-xs text-[#76675c]">{program}</p>
        </article>
        <article className="panel py-5">
          <p className="metric-index">By {formatPlanDate(plan.readyByDate)}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{formatPoints(plan.reachableAtReadyBy)}</p>
          <p className="mt-1 text-xs text-[#76675c]">what this spend earns in time</p>
        </article>
        <article className="panel py-5">
          <p className="metric-index">{positive ? 'Surplus' : 'Short'}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-[-0.03em] ${positive ? 'text-[#2f5d32]' : 'text-[#8b3a2a]'}`}>
            {formatPoints(gap)}
          </p>
          <p className="mt-1 text-xs text-[#76675c]">{program}</p>
        </article>
      </div>

      <PlanNarration plan={plan} trip={trip} travelDate={travelDate} />

      <article className="panel overflow-x-auto">
        <p className="font-semibold">Use this card for this spend</p>
        <p className="mt-1 text-sm text-[#76675c]">Each month until {formatPlanDate(plan.readyByDate)}.</p>
        {plan.assignments.length === 0 ? (
          <p className="mt-3 text-sm text-[#76675c]">
            No spend is assigned yet. Go back to Card and pick one that can earn {program}.
          </p>
        ) : (
          <table className="mt-3 w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-[#76675c]">
                <th className="py-2 font-medium">Category</th>
                <th className="font-medium">EUR / month</th>
                <th className="font-medium">Card</th>
                <th className="font-medium">Points / month</th>
              </tr>
            </thead>
            <tbody>
              {plan.assignments.map((row) => (
                <tr key={`${row.category}-${row.cardId}`} className="border-t border-[#e1d6c8]">
                  <td className="py-3 capitalize">{row.category}</td>
                  <td className="font-semibold">{formatEuro(row.eur)}</td>
                  <td>{row.cardName}</td>
                  <td className="font-semibold">{formatPoints(row.pointsInTripCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {plan.unusedCards.length ? (
          <p className="mt-3 text-sm text-[#76675c]">
            Not used: {plan.unusedCards.map((c) => `${c.name} (${c.reason})`).join(' · ')}
          </p>
        ) : null}
      </article>

      {plan.suggestions.length ? (
        <div>
          <h3 className="font-semibold">What would change the outcome</h3>
          <ul className="mt-3 grid gap-2">
            {plan.suggestions.slice(0, 3).map((s) => {
              const apply = s.apply
              const applyKey =
                apply.kind === 'add_card' ? apply.cardId : apply.kind === 'switch_trip' ? apply.tripId : ''
              return (
                <li key={s.kind + applyKey} className="panel p-4">
                  <p className="text-sm leading-6">{s.reason}</p>
                  {apply.kind === 'switch_trip' ? (
                    <button
                      type="button"
                      className="mt-2 min-h-11 text-sm font-semibold text-[#b86632]"
                      onClick={() => onPickTrip(apply.tripId)}
                    >
                      Switch to this trip
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <article className="panel">
        <p className="font-semibold">Points through {formatPlanDate(plan.readyByDate)}</p>
        <p className="mt-1 text-sm text-[#76675c]">
          This chart is only the months before you fly. The dashed line is the {formatPoints(plan.pointsRequired)} {program}{' '}
          target.
        </p>
        {!positive ? (
          <p className="mt-2 text-sm text-[#8a4b12]">
            Months after {formatPlanDate(plan.readyByDate)} are not this trip, so they are not on the chart.
          </p>
        ) : null}
        <div className="mt-4">
          {windowSchedule.length ? (
            <PointsChart schedule={windowSchedule} target={plan.pointsRequired} />
          ) : (
            <p className="text-sm text-[#76675c]">No earning months in this window.</p>
          )}
        </div>
        {windowSchedule.length > 1 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-[#76675c]">
                  <th className="py-2 font-medium">Month</th>
                  <th className="font-medium">Earned</th>
                  <th className="font-medium">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {windowSchedule.map((row) => (
                  <tr key={row.date} className="border-t border-[#e1d6c8]">
                    <td className="py-2">{formatPlanDate(row.date)}</td>
                    <td>{formatPoints(monthEarned(row))}</td>
                    <td className="font-semibold">{formatPoints(row.cumulativePointsInTripCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      {reachable.length ? (
        <div>
          <h3 className="font-semibold">Reachable by {formatPlanDate(plan.readyByDate)}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {reachable.map((r) => {
              const t = r.tripId === trip.id ? trip : getTrip(r.tripId)
              if (!t) return null
              const selected = r.tripId === plan.tripId
              return (
                <li key={r.tripId}>
                  <button
                    type="button"
                    onClick={() => onPickTrip(r.tripId)}
                    className={`w-full overflow-hidden rounded-2xl border text-left ${
                      selected ? 'border-[#b86632]' : 'border-[#e1d6c8]'
                    }`}
                  >
                    {t.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.image} alt="" className="h-28 w-full object-cover" />
                    ) : (
                      <div className="h-28 bg-[#eee4d8]" />
                    )}
                    <div className="p-4">
                      <p className="font-semibold">{t.destination}</p>
                      <p className="text-xs text-[#76675c]">{t.label}</p>
                      <p className="mt-2 text-sm font-semibold text-[#b86632]">{formatEuro(r.netSavingEur)}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <article className="panel text-sm leading-6">
        <p className="font-semibold">When the points are ready</p>
        <p className="mt-2 text-[#76675c]">
          Transfer into {program} (Avios accounts must be 30 days old, details matching), then book on the airline site
          {trip ? ` for ${trip.origin} to ${trip.destination}` : ''}. FareFlip does not book for you.
        </p>
      </article>

      {verified ? (
        <div>
          <Button variant="terra" onClick={onSave}>
            Save this plan
          </Button>
          {saveMessage ? <p className="mt-2 text-sm text-[#76675c]">{saveMessage}</p> : null}
        </div>
      ) : (
        <div>
          <Button variant="primary" onClick={() => setGuestSaveOpen(true)}>
            Save this plan
          </Button>
          {guestSaveOpen ? (
            <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true">
              <div className="max-w-md rounded-2xl bg-surface p-6">
                <h3 className="text-lg font-semibold">Create a free account to keep this plan</h3>
                <p className="mt-2 text-sm text-ink-muted">Your current plan stays in the URL and on this device.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/signup?next=${encodeURIComponent(next)}`}>
                    <Button variant="primary">Sign up</Button>
                  </Link>
                  <Link href={`/login?next=${encodeURIComponent(next)}`}>
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Button variant="ghost" onClick={() => setGuestSaveOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
