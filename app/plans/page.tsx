import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listSavedPlans } from '@/app/actions/saved-plans'
import { DeletePlanButton } from '@/components/plan/delete-plan-button'
import { getCurrentUser } from '@/lib/auth/current-user'
import { cashSourceLabel } from '@/lib/plan/display'
import { formatPlanDate } from '@/lib/plan/dates'
import { formatEuro } from '@/lib/savings'
import { getTrip } from '@/lib/trips/catalog'
import type { CashBaselineSource } from '@/lib/plan/cash-baseline'

export default async function SavedPlansPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/plans')
  if (!user.emailVerifiedAt) redirect('/verify-email/sent')
  const rows = await listSavedPlans()
  return (
    <>
      <p className="eyebrow">Your library</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.06em]">Saved plans</h1>
          <p className="mt-2 max-w-xl text-sm text-[#76675c]">
            Open a plan to see the month-by-month spend guide, net saving, and how to book when the points are ready.
          </p>
        </div>
        <Link
          href="/plan"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#b86632] px-5 text-sm font-semibold text-white"
        >
          New plan
        </Link>
      </div>

      {rows.length === 0 ? (
        <article className="panel mt-8">
          <h2 className="text-xl font-semibold">No saved plans yet</h2>
          <p className="mt-2 text-sm leading-6 text-[#76675c]">
            Build a spend plan, then tap Save this plan. We store the trip, date, ready-by window, net saving and cash
            source — never offer ids or raw fares.
          </p>
          <Link href="/plan" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]">
            Plan my spend
          </Link>
        </article>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => {
            const trip = getTrip(row.tripId)
            const source = row.cashSource as CashBaselineSource
            return (
              <li key={row.id}>
                <Link
                  href={`/plan?saved=${encodeURIComponent(row.id)}&trip=${encodeURIComponent(row.tripId)}&date=${encodeURIComponent(row.travelDate)}&ready=${row.readyByDays}&view=plan`}
                  className="block overflow-hidden rounded-[18px] border border-[#d9cbbb] bg-[#fffaf2] transition hover:-translate-y-0.5 hover:border-[#b86632]"
                >
                  <div className="relative h-44 overflow-hidden bg-[#eee4d8]">
                    {trip?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={trip.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a211b]/70 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-sm font-semibold text-white">
                      {trip
                        ? `${trip.origin} → ${trip.destination}`
                        : row.tripId === 'custom'
                          ? 'Custom trip'
                          : row.tripId}
                    </p>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-semibold leading-snug">
                      {trip?.label ?? (row.tripId === 'custom' ? 'Custom trip' : row.tripId)}
                    </h2>
                    <p className="mt-2 text-sm text-[#76675c]">
                      {formatPlanDate(row.travelDate)} · ready {row.readyByDays} days before
                    </p>
                    <p className="mt-4 text-2xl font-semibold text-[#b86632]">{formatEuro(Number(row.netSavingEur))}</p>
                    <p className="mt-1 text-xs text-[#76675c]">{cashSourceLabel(source)} net saving</p>
                    <span className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]">
                      Open
                    </span>
                  </div>
                </Link>
                <div className="px-5 pb-5">
                  <DeletePlanButton id={row.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
