'use client'

import { DataModeLabel } from '@/components/data-mode-label'
import { Button } from '@/components/button'
import { PointsChart } from '@/components/plan/points-chart'
import { ILLUSTRATIVE_RATES_LABEL } from '@/lib/cards/constants'
import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import { cashSourceLabel, statusLabel, verdictLabel } from '@/lib/plan/display'
import { formatPlanDate } from '@/lib/plan/dates'
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
  const program = POINT_CURRENCIES[plan.awardCurrency].displayName
  const positive = plan.status === 'on_track' || plan.status === 'ready_now'
  const headline = positive
    ? `You can have ${plan.pointsRequired.toLocaleString('en-GB')} ${program} by ${formatPlanDate(plan.readyByDate)}.`
    : plan.message

  return (
    <section className="flex flex-col gap-6">
      <article className="overflow-hidden rounded-[18px] border border-[#d9cbbb] bg-[#2a211b] text-[#fffaf2]">
        <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px]">
          {trip?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trip.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[#3a2f27]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a211b] via-[#2a211b]/55 to-transparent" />
          <div className="relative flex min-h-[240px] flex-col justify-end gap-3 p-6 sm:min-h-[300px] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="status" aria-live="polite">
                {statusLabel(plan.status)}
              </span>
              <span className={plan.verdict === 'poor' ? 'mock-label' : 'status'}>{verdictLabel(plan.verdict)}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d89a70]">
              {trip ? `${trip.origin} → ${trip.destination}` : plan.tripId}
            </p>
            <h2 className="max-w-2xl text-[clamp(1.7rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.04em]">
              {trip?.destination ?? 'Your trip'}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#eee4d8] sm:text-base">{headline}</p>
          </div>
        </div>
        <div className="grid gap-4 border-t border-white/10 p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d89a70]">Travel date</p>
            <p className="mt-2 text-lg font-semibold">{formatPlanDate(travelDate)}</p>
            <p className="mt-1 text-xs text-[#cbbbae]">Ready {formatPlanDate(plan.readyByDate)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d89a70]">Net saving</p>
            <p className="mt-2 text-lg font-semibold text-[#f0c4a4]">{formatEuro(plan.netSavingEur)}</p>
            <p className="mt-1 text-xs text-[#cbbbae]">versus {formatEuro(plan.cashBaseline.eur)} cash</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#d89a70]">Cash baseline</p>
            <p className="mt-2 text-lg font-semibold">{cashSourceLabel(plan.cashSource)}</p>
            <p className="mt-1 text-xs text-[#cbbbae]">
              {plan.usedUnverifiedData ? ILLUSTRATIVE_RATES_LABEL : `${program} award`}
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="panel">
          <p className="metric-index">Points needed</p>
          <p className="mt-4 text-2xl font-semibold">{plan.pointsRequired.toLocaleString('en-GB')}</p>
          <p className="mt-1 text-xs text-[#76675c]">{program}</p>
        </article>
        <article className="panel">
          <p className="metric-index">By ready date</p>
          <p className="mt-4 text-2xl font-semibold">{plan.reachableAtReadyBy.toLocaleString('en-GB')}</p>
          <p className="mt-1 text-xs text-[#76675c]">
            {plan.shortfall > 0
              ? `${plan.shortfall.toLocaleString('en-GB')} short`
              : `${Math.max(0, plan.reachableAtReadyBy - plan.pointsRequired).toLocaleString('en-GB')} surplus`}
          </p>
        </article>
        <article className="panel">
          <p className="metric-index">Cash fare</p>
          <p className="mt-4 text-2xl font-semibold">{formatEuro(plan.cashBaseline.eur)}</p>
          {plan.cashSource === 'duffel_live' ? (
            <p className="mt-1 text-xs text-[#76675c]">
              Live fare
              {plan.cashBaseline.fetchedAt ? `, checked ${formatPlanDate(plan.cashBaseline.fetchedAt.slice(0, 10))}` : ''}
            </p>
          ) : plan.cashSource === 'duffel_test' ? (
            <div className="mt-1">
              <DataModeLabel mode="test" />
            </div>
          ) : (
            <p className="mt-1 text-xs text-[#76675c]">Sample estimate</p>
          )}
          {duffelConfigured ? (
            <Button className="mt-4 w-full" variant="outline" disabled={fareLoading} onClick={onCheckFare}>
              {fareLoading ? 'Checking…' : 'Check live cash fare'}
            </Button>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {fareLoading ? 'Checking live cash fare' : fareNote}
          </p>
          {fareNote ? <p className="mt-2 text-sm text-[#76675c]">{fareNote}</p> : null}
        </article>
      </div>

      <article className="panel">
        <p className="font-semibold">Month by month</p>
        <p className="mt-1 text-sm text-[#76675c]">
          Cumulative {program} versus the {plan.pointsRequired.toLocaleString('en-GB')} target.
        </p>
        <div className="mt-4">
          {plan.schedule.length ? (
            <PointsChart schedule={plan.schedule} target={plan.pointsRequired} />
          ) : (
            <p className="text-sm text-[#76675c]">No earning months in this window — the chart starts when there is time to spend.</p>
          )}
        </div>
        {plan.schedule.length ? (
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
                {plan.schedule.map((row) => (
                  <tr key={row.date} className="border-t border-[#e1d6c8]">
                    <td className="py-2">{formatPlanDate(row.date)}</td>
                    <td>{monthEarned(row).toLocaleString('en-GB')}</td>
                    <td>{row.cumulativePointsInTripCurrency.toLocaleString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      <article className="panel overflow-x-auto">
        <p className="font-semibold">Which card for which spend</p>
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
                  <td>{formatEuro(row.eur)}</td>
                  <td>{row.cardName}</td>
                  <td>{row.pointsInTripCurrency.toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {plan.unusedCards.length ? (
          <p className="mt-3 text-sm text-[#76675c]">
            {plan.unusedCards.map((c) => `${c.name}: ${c.reason}`).join(' · ')}
          </p>
        ) : null}
      </article>

      <div>
        <h3 className="font-semibold">Suggestions</h3>
        {plan.suggestions.length === 0 ? (
          <p className="mt-2 text-sm text-[#76675c]">No extra moves needed on this plan.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {plan.suggestions.map((s) => (
              <li key={s.kind + (s.cardId ?? '') + (s.tripId ?? '')} className="panel p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a39182]">{s.kind.replaceAll('_', ' ')}</p>
                <p className="mt-2 text-sm leading-6">{s.reason}</p>
                {s.tripId ? (
                  <button
                    type="button"
                    className="mt-2 min-h-11 text-sm font-semibold text-[#b86632]"
                    onClick={() => onPickTrip(s.tripId!)}
                  >
                    Switch to this trip
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Best value trips you can reach by {formatPlanDate(plan.readyByDate)}</h3>
        {(ranking?.reachable ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-[#76675c]">None of the sample trips are on track yet with this card and spend.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {(ranking?.reachable ?? []).map((r) => {
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
                      <p className="text-xs text-[#76675c]">{cashSourceLabel(r.cashSource)}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <article className="panel text-sm leading-6">
        <p className="font-semibold">How to book when you are ready</p>
        <ol className="mt-2 list-decimal pl-5">
          <li>Transfer points into {program}. Avios accounts must be 30 days old and personal details must match.</li>
          <li>
            Book on the airline site
            {trip ? ` for ${trip.origin} to ${trip.destination}` : ''}. FareFlip does not book for you.
          </li>
        </ol>
      </article>

      {verified ? (
        <div>
          <Button variant="terra" onClick={onSave}>
            Save this plan
          </Button>
          {saveMessage ? <p className="mt-2 text-sm text-[#76675c]">{saveMessage}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-[#76675c]">Sign in to save this plan to your account. Guest data stays on this device.</p>
      )}
    </section>
  )
}
