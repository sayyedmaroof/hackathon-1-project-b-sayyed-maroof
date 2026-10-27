'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getCashBaseline, getCashBaselines, getCustomCashBaseline } from '@/app/actions/cash-baseline'
import { saveBalances, saveSpendProfile, saveWallet } from '@/app/actions/wallet'
import { savePlan } from '@/app/actions/saved-plans'
import { CardTile } from '@/components/plan/card-tile'
import { CustomTripFields } from '@/components/plan/custom-trip-fields'
import { PlanResult } from '@/components/plan/plan-result'
import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import Image from 'next/image'
import { CARD_CATALOG } from '@/lib/cards/catalog'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import type { CatalogCardId, PointCurrencyId, RevolutPlanId, UserSpendProfile, UserWallet } from '@/lib/cards/types'
import type { CashBaseline } from '@/lib/plan/cash-baseline'
import { RATE_LIMIT_FARE_NOTE, READY_BY_DAYS_DEFAULT, READY_BY_DAYS_MAX, READY_BY_DAYS_MIN } from '@/lib/plan/constants'
import { addDaysYmd, formatPlanDate, utcYmd } from '@/lib/plan/dates'
import { computeSpendPlan, rankTripsForUser } from '@/lib/plan/engine'
import { loadCustomTrip, loadGuestWallet, saveCustomTrip, saveGuestWallet } from '@/lib/plan/guest-storage'
import {
  assignedSummary,
  formatThousands,
  parseSpendInput,
  putRestInOther,
  setMonthlyTotal,
  setSpendCategory,
  type SpendCategoryField,
} from '@/lib/plan/spend'
import { formatEuro } from '@/lib/savings'
import {
  CUSTOM_TRIP_ID,
  DEFAULT_CUSTOM_TRIP,
  TRIP_CATALOG,
  buildCustomTrip,
  getTrip,
  isCustomTripComplete,
} from '@/lib/trips/catalog'
import { programBalanceRows, toggleCardId, walletCardsFromSelection } from '@/lib/plan/wizard-state'

const STEPS = ['Card', 'Trip', 'Spend', 'Plan'] as const

export function PlanWizard({
  duffelConfigured,
  verified,
  initialTripId,
  initialDate,
  initialReadyBy,
  initialViewPlan,
  initialWallet,
}: {
  duffelConfigured: boolean
  verified: boolean
  initialTripId?: string
  initialDate?: string
  initialReadyBy?: string
  initialViewPlan?: boolean
  initialWallet: UserWallet
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const readyFromUrl = Number(initialReadyBy)
  const [step, setStep] = useState(initialViewPlan ? 3 : 0)
  const [selectedCardIds, setSelectedCardIds] = useState<CatalogCardId[]>(
    initialWallet.cards.map((c) => c.cardId),
  )
  const [revolutPlan, setRevolutPlan] = useState<RevolutPlanId>(
    initialWallet.cards.find((c) => c.cardId === 'revolut')?.revolutPlan ?? 'premium',
  )
  const [tripId, setTripId] = useState(
    initialTripId === CUSTOM_TRIP_ID || (initialTripId && getTrip(initialTripId))
      ? initialTripId
      : TRIP_CATALOG[0]!.id,
  )
  const [customDraft, setCustomDraft] = useState(DEFAULT_CUSTOM_TRIP)
  const [travelDate, setTravelDate] = useState(initialDate ?? '')
  const [readyBy, setReadyBy] = useState(
    Number.isFinite(readyFromUrl) && readyFromUrl >= READY_BY_DAYS_MIN && readyFromUrl <= READY_BY_DAYS_MAX
      ? Math.round(readyFromUrl)
      : READY_BY_DAYS_DEFAULT,
  )
  const [spend, setSpend] = useState<UserSpendProfile>(initialWallet.spend)
  const [balances, setBalances] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialWallet.balances.map((b) => [b.currency, b.balance])),
  )
  const [baselines, setBaselines] = useState<Record<string, CashBaseline>>({})
  const [fareNote, setFareNote] = useState('')
  const [fareLoading, setFareLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [guestHydrated, setGuestHydrated] = useState(false)
  const fareReq = useRef(0)
  const hydrated = useRef(false)
  const fareChecked = useRef(new Set<string>())
  const [raisedTotal, setRaisedTotal] = useState(false)

  const wallet: UserWallet = useMemo(
    () => ({
      cards: walletCardsFromSelection(selectedCardIds, revolutPlan),
      balances: Object.entries(balances).map(([currency, balance]) => ({
        currency: currency as PointCurrencyId,
        balance: Number(balance) || 0,
      })),
      spend,
    }),
    [selectedCardIds, revolutPlan, balances, spend],
  )

  const customTrip = useMemo(() => buildCustomTrip(customDraft), [customDraft])
  const trip = tripId === CUSTOM_TRIP_ID ? customTrip : (getTrip(tripId) ?? TRIP_CATALOG[0]!)
  const customReady = tripId !== CUSTOM_TRIP_ID || isCustomTripComplete(customDraft)
  const today = useMemo(() => new Date(), [])
  const plan = useMemo(() => {
    if (!travelDate) return null
    return computeSpendPlan({
      trip,
      wallet,
      travelDate,
      today,
      readyByDaysBefore: readyBy,
      cashBaselines: baselines,
    })
  }, [trip, wallet, travelDate, today, readyBy, baselines])

  const ranking = useMemo(() => {
    if (!travelDate) return null
    const trips = tripId === CUSTOM_TRIP_ID ? [customTrip, ...TRIP_CATALOG] : TRIP_CATALOG
    return rankTripsForUser(trips, wallet, travelDate, today, baselines, readyBy)
  }, [wallet, travelDate, today, baselines, readyBy, tripId, customTrip])

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    if (!verified) {
      const guest = loadGuestWallet()
      if (guest) {
        setSelectedCardIds(guest.cards.map((c) => c.cardId))
        const rev = guest.cards.find((c) => c.cardId === 'revolut')?.revolutPlan
        if (rev) setRevolutPlan(rev)
        setSpend(guest.spend)
        setBalances(Object.fromEntries(guest.balances.map((b) => [b.currency, b.balance])))
      }
    }
    setCustomDraft(loadCustomTrip())
    setGuestHydrated(true)
  }, [verified])

  useEffect(() => {
    if (verified || !guestHydrated) return
    saveGuestWallet(wallet)
  }, [wallet, verified, guestHydrated])

  useEffect(() => {
    if (!guestHydrated) return
    saveCustomTrip(customDraft)
  }, [customDraft, guestHydrated])

  useEffect(() => {
    if (!verified) return
    const t = window.setTimeout(() => {
      void saveWallet({ cards: wallet.cards })
      void saveBalances({ balances: wallet.balances })
      void saveSpendProfile(wallet.spend)
    }, 800)
    return () => window.clearTimeout(t)
  }, [wallet, verified])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('trip', tripId)
    if (travelDate) params.set('date', travelDate)
    params.set('ready', String(readyBy))
    if (step === 3) params.set('view', 'plan')
    const qs = params.toString()
    if (searchParams.toString() === qs) return
    router.replace(`${pathname}?${qs}`, { scroll: false })
  }, [tripId, travelDate, readyBy, step, pathname, router, searchParams])

  const programs = useMemo(() => programBalanceRows(selectedCardIds), [selectedCardIds])
  const spendSummary = assignedSummary(spend)

  async function checkLiveFare(force = false) {
    if (!duffelConfigured || !travelDate) return
    if (tripId === CUSTOM_TRIP_ID && !customReady) return
    const key = `${tripId}|${travelDate}|${trip.originIata}|${trip.destinationIata}`
    if (!force && fareChecked.current.has(key) && baselines[tripId]) return
    const id = ++fareReq.current
    setFareLoading(true)
    setFareNote('')
    try {
      const selected =
        tripId === CUSTOM_TRIP_ID
          ? await getCustomCashBaseline({
              originIata: trip.originIata,
              destinationIata: trip.destinationIata,
              origin: trip.origin,
              destination: trip.destination,
              cabin: trip.cabin === 'Business' ? 'Business' : 'Economy',
              journey: trip.journey,
              travelDate,
              typicalCashEur: trip.typicalCashEur,
              taxesEur: trip.taxesEur,
            })
          : await getCashBaseline({ tripId, travelDate })
      if (id !== fareReq.current) return
      fareChecked.current.add(key)
      setBaselines((prev) => ({ ...prev, [tripId]: selected }))
      if (tripId === CUSTOM_TRIP_ID && selected.source === 'duffel_live') {
        setCustomDraft((d) => ({ ...d, typicalCashEur: selected.eur }))
      }
      if (selected.rateLimited || selected.note === RATE_LIMIT_FARE_NOTE) {
        setFareNote(RATE_LIMIT_FARE_NOTE)
      } else if (selected.note && selected.source === 'sample') {
        setFareNote(selected.note)
      }
      const cachedIds = Object.keys(baselines).concat(tripId)
      const top = (ranking?.reachable ?? [])
        .map((r) => r.tripId)
        .filter((tid) => tid !== tripId && getTrip(tid) && !cachedIds.includes(tid))
        .slice(0, 3)
      if (top.length) {
        const extra = await getCashBaselines(
          top.map((tid) => ({ tripId: tid, travelDate })),
          { skipTripIds: cachedIds },
        )
        if (id !== fareReq.current) return
        setBaselines((prev) => ({ ...prev, ...extra }))
        if (Object.values(extra).some((b) => b.rateLimited || b.note === RATE_LIMIT_FARE_NOTE)) {
          setFareNote(RATE_LIMIT_FARE_NOTE)
        }
      }
    } catch {
      if (id !== fareReq.current) return
      setFareNote('Live fare unavailable, using a sample estimate')
    } finally {
      if (id === fareReq.current) setFareLoading(false)
    }
  }

  useEffect(() => {
    if (!duffelConfigured || !travelDate || step !== 3) return
    if (tripId === CUSTOM_TRIP_ID && !customReady) return
    const t = window.setTimeout(() => {
      void checkLiveFare()
    }, 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, tripId, travelDate, duffelConfigured, customReady, trip.originIata, trip.destinationIata, trip.cabin, trip.journey])

  const tomorrow = addDaysYmd(utcYmd(new Date()), 1)
  const readyByDateLabel = travelDate ? formatPlanDate(addDaysYmd(travelDate, -readyBy)) : null
  const cardsOk = selectedCardIds.length > 0
  const tripOk = Boolean(travelDate) && customReady
  const canOpenStep = (i: number) => {
    if (i <= step) return true
    if (i >= 1 && !cardsOk) return false
    if (i >= 2 && !tripOk) return false
    return true
  }

  return (
    <div className="relative pb-32 lg:pb-10">
      <div className="mb-6">
        <p className="eyebrow">Spend plan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Plan your spend</h1>
        <Stepper
          steps={STEPS.map((label, i) => ({
            label,
            state: i === step ? 'current' : i < step ? 'done' : canOpenStep(i) ? 'done' : 'locked',
            summary:
              i === 0
                ? selectedCardIds.length
                  ? `${selectedCardIds.length} cards`
                  : undefined
                : i === 1
                  ? travelDate
                    ? `${trip.origin} to ${trip.destination}, ${formatPlanDate(travelDate)}`
                    : undefined
                  : undefined,
            onSelect: canOpenStep(i) ? () => setStep(i) : undefined,
          }))}
        />
        {!verified && guestHydrated ? <p className="mt-2 text-sm text-ink-muted">Saved on this device</p> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {step === 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Select your cards</h2>
              <p className="mt-1 text-sm text-[#76675c]">
                Choose every card you already hold. Source: A una milla de tu destino.{' '}
                <a className="underline" href="https://aunamilladetudestino.com/tarjetas-de-credito/">
                  Cards page
                </a>
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2" aria-label="Card selection">
                {CARD_CATALOG.map((card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    selected={selectedCardIds.includes(card.id)}
                    revolutPlan={revolutPlan}
                    onSelect={() => setSelectedCardIds((ids) => toggleCardId(ids, card.id))}
                    onPlan={setRevolutPlan}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h2 className="text-xl font-semibold">Your trip</h2>
              <p className="mt-1 text-sm text-[#76675c]">Pick a sample route or enter a custom one.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTripId(CUSTOM_TRIP_ID)}
                  className={`min-h-11 rounded-2xl border border-dashed text-left ${
                    tripId === CUSTOM_TRIP_ID
                      ? 'border-primary bg-[#fff6ee] ring-2 ring-primary'
                      : 'border-border bg-background'
                  }`}
                  aria-pressed={tripId === CUSTOM_TRIP_ID}
                >
                  <div className="flex h-32 items-center justify-center bg-[#eee4d8]">
                    <p className="text-sm font-semibold text-[#b86632]">Custom trip</p>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">Enter your own route</p>
                    <p className="text-xs text-ink-muted">Your own numbers, not checked.</p>
                  </div>
                </button>
                {TRIP_CATALOG.map((t) => {
                  const live = baselines[t.id]
                  const cash = live?.source === 'duffel_live' ? live.eur : t.typicalCashEur
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTripId(t.id)}
                      className={`min-h-11 rounded-2xl border text-left ${
                        tripId === t.id
                          ? 'border-primary bg-[#fff6ee] shadow-[0_0_0_3px_var(--primary)]'
                          : 'border-border bg-surface'
                      }`}
                      aria-pressed={tripId === t.id}
                    >
                      <div className="overflow-hidden rounded-[calc(1rem-1px)]">
                      {t.image ? (
                        <Image src={t.image} alt="" width={640} height={256} className="h-32 w-full object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
                      ) : (
                        <div className="h-32 bg-background" />
                      )}
                      <div className="p-4">
                        {tripId === t.id ? (
                          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-primary">Selected</p>
                        ) : null}
                        <p className="font-semibold">{t.label}</p>
                        <p className="text-xs text-ink-muted">
                          {t.origin} → {t.destination} · {t.cabin} · {t.journey === 'return' ? 'return' : 'one-way'}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">{t.pointsRequired.toLocaleString('en-GB')} points</p>
                        <p className="mt-2 text-sm">
                          Typical cash (sample) {formatEuro(t.typicalCashEur)}
                          {live?.source === 'duffel_live' ? ` · live ${formatEuro(cash)}` : ''}
                        </p>
                      </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {tripId === CUSTOM_TRIP_ID ? (
                <article className="panel mt-4">
                  <p className="font-semibold">Custom selection</p>
                  <CustomTripFields value={customDraft} onChange={setCustomDraft} />
                  {!customReady ? (
                    <p className="mt-3 text-sm text-[#b86632]">Enter two different 3-letter airport codes to continue.</p>
                  ) : null}
                </article>
              ) : null}
              <label className="mt-6 block text-sm font-semibold">
                Travel date
                <input
                  type="date"
                  min={tomorrow}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border px-3"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setTravelDate(addDaysYmd(tomorrow, 120))}>
                  In 4 months
                </Button>
                <Button variant="outline" onClick={() => setTravelDate(addDaysYmd(tomorrow, 240))}>
                  In 8 months
                </Button>
              </div>
              <label className="mt-4 block text-sm font-semibold">
                Ready by {readyBy} days before travel
                <input
                  type="range"
                  min={READY_BY_DAYS_MIN}
                  max={READY_BY_DAYS_MAX}
                  value={readyBy}
                  onChange={(e) => setReadyBy(Number(e.target.value))}
                  className="mt-2 w-full min-h-11"
                />
              </label>
              {readyByDateLabel ? (
                <p className="mt-2 text-sm text-ink-muted">
                  Points ready by {readyByDateLabel}, {readyBy} days before you fly
                </p>
              ) : null}
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="text-xl font-semibold">Your points and spending</h2>
              <div className="mt-4 grid gap-3">
                {programs.length === 0 ? (
                  <p className="text-sm text-[#76675c]">Select cards first to enter balances.</p>
                ) : (
                  programs.map((row) => (
                    <label key={row.currency} className="text-sm font-semibold">
                      {row.programName}
                      <p className="font-normal text-[#76675c]">
                        From {row.cardNames.join(', ')}
                      </p>
                      <input
                        type="number"
                        min={0}
                        className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
                        value={balances[row.currency] ?? 0}
                        onChange={(e) =>
                          setBalances((b) => ({ ...b, [row.currency]: Number(e.target.value) || 0 }))
                        }
                      />
                    </label>
                  ))
                )}
              </div>
              <p className="mt-4 text-sm text-[#76675c]">Skip balances if you are starting from zero.</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSpend(SAMPLE_SPEND_PROFILE)
                  setRaisedTotal(false)
                }}
              >
                Typical household EUR 1,500
              </Button>
              <EuroSpendField
                label="Monthly total"
                value={spend.monthlyTotalEur}
                onChange={(n) => {
                  setSpend((s) => setMonthlyTotal(s, n))
                  setRaisedTotal(false)
                }}
              />
              {(['groceriesEur', 'travelEur', 'diningEur', 'fuelEur', 'otherEur'] as const).map((key) => (
                <EuroSpendField
                  key={key}
                  label={key.replace('Eur', '')}
                  value={spend[key]}
                  onChange={(n) => {
                    setSpend((s) => {
                      const next = setSpendCategory(s, key as SpendCategoryField, n)
                      setRaisedTotal(next.raisedTotal)
                      return next.spend
                    })
                  }}
                />
              ))}
              <p className="mt-3 text-sm">
                EUR {formatThousands(spendSummary.assigned)} of EUR {formatThousands(spendSummary.total)} assigned
                {spendSummary.remainder > 0 ? ` · ${formatEuro(spendSummary.remainder)} unassigned` : ''}
              </p>
              {spendSummary.remainder > 0 ? (
                <Button className="mt-2" variant="outline" onClick={() => setSpend((s) => putRestInOther(s))}>
                  Put the rest in Other
                </Button>
              ) : null}
              {raisedTotal ? (
                <p className="mt-2 text-sm text-[#b86632]">
                  Categories were higher than the monthly total, so the total was raised to match.
                </p>
              ) : null}
            </section>
          ) : null}

          {step === 3 ? (
            !travelDate || !plan ? (
              <p className="text-[#76675c]">Pick a trip and a travel date to see your plan.</p>
            ) : !customReady ? (
              <p className="text-[#76675c]">Finish the custom trip airports on the Trip step to see your plan.</p>
            ) : (
              <PlanResult
                plan={plan}
                ranking={ranking}
                trip={trip}
                travelDate={travelDate}
                duffelConfigured={duffelConfigured}
                fareLoading={fareLoading}
                fareNote={fareNote}
                verified={verified}
                saveMessage={saveMessage}
                onCheckFare={() => void checkLiveFare(true)}
                onSave={async () => {
                  const res = await savePlan({
                    tripId,
                    travelDate,
                    readyByDays: readyBy,
                    netSavingEur: plan.netSavingEur,
                    cashSource: plan.cashSource,
                    fetchedAt: plan.cashBaseline.fetchedAt,
                  })
                  setSaveMessage(res.ok ? 'Plan saved' : res.error ?? 'Could not save')
                }}
                onPickTrip={(id) => {
                  setTripId(id)
                }}
              />
            )
          ) : null}

          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <div>
                <Button
                  variant="terra"
                  disabled={(step === 0 && !cardsOk) || (step === 1 && !tripOk)}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue
                </Button>
                {step === 0 && !cardsOk ? (
                  <p className="mt-2 text-sm text-ink-muted">Pick at least one card</p>
                ) : null}
                {step === 1 && !travelDate ? (
                  <p className="mt-2 text-sm text-ink-muted">Pick a travel date</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 hidden h-fit rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-ink-muted">Summary</p>
          <p className="mt-2 text-sm">
            {selectedCardIds.length
              ? `${selectedCardIds.length} card${selectedCardIds.length === 1 ? '' : 's'}`
              : 'No cards yet'}
          </p>
          <p className="text-sm">{trip.label}</p>
          <p className="text-sm">{travelDate || 'No date yet'}</p>
          {plan ? (
            <>
              <p className="mt-2 font-semibold">{plan.status.replaceAll('_', ' ')}</p>
              <p className="font-semibold">{formatEuro(plan.netSavingEur)}</p>
            </>
          ) : null}
        </aside>
      </div>

      {step < 3 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[#e1d6c8] bg-[#fffaf2] p-3 lg:hidden">
          <p className="text-sm">
            {trip.destination} · {travelDate || 'Pick a date'} · {plan ? formatEuro(plan.netSavingEur) : '—'}
          </p>
          <Button
            variant="terra"
            disabled={(step === 0 && !cardsOk) || (step === 1 && !tripOk)}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function EuroSpendField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(String(value))
  useEffect(() => {
    if (!focused) setDraft(formatThousands(value))
  }, [value, focused])
  return (
    <label className="mt-3 block text-sm font-semibold capitalize">
      {label}
      <span className="mt-1 flex min-h-11 items-center gap-2">
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-[#e1d6c8]"
          onClick={() => onChange(Math.max(0, value - 10))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="flex min-h-11 flex-1 items-center rounded-xl border border-[#e1d6c8] px-3">
          <span className="pr-2 text-[#76675c]">EUR</span>
          <input
            inputMode="numeric"
            className="min-h-11 w-full bg-transparent outline-none"
            value={focused ? draft : formatThousands(value)}
            onFocus={() => {
              setFocused(true)
              setDraft(value ? String(value) : '')
            }}
            onBlur={() => {
              setFocused(false)
              onChange(parseSpendInput(draft))
            }}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
              setDraft(next)
              onChange(parseSpendInput(next))
            }}
          />
        </span>
        <button
          type="button"
          className="min-h-11 min-w-11 rounded-xl border border-[#e1d6c8]"
          onClick={() => onChange(value + 10)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </span>
    </label>
  )
}
