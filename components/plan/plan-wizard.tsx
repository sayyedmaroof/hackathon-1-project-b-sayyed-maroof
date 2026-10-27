'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getCashBaseline, getCashBaselines } from '@/app/actions/cash-baseline'
import { saveBalances, saveSpendProfile, saveWallet } from '@/app/actions/wallet'
import { savePlan } from '@/app/actions/saved-plans'
import { CardTile } from '@/components/plan/card-tile'
import { CustomTripFields } from '@/components/plan/custom-trip-fields'
import { PlanResult } from '@/components/plan/plan-result'
import { Button } from '@/components/button'
import { CARD_CATALOG, getCatalogCard } from '@/lib/cards/catalog'
import { SAMPLE_SPEND_PROFILE } from '@/lib/cards/constants'
import { POINT_CURRENCIES } from '@/lib/cards/currencies'
import type { CatalogCardId, PointCurrencyId, RevolutPlanId, UserSpendProfile, UserWallet } from '@/lib/cards/types'
import type { CashBaseline } from '@/lib/plan/cash-baseline'
import { READY_BY_DAYS_DEFAULT, READY_BY_DAYS_MAX, READY_BY_DAYS_MIN } from '@/lib/plan/constants'
import { computeSpendPlan, rankTripsForUser } from '@/lib/plan/engine'
import { loadCustomTrip, loadGuestWallet, saveCustomTrip, saveGuestWallet } from '@/lib/plan/guest-storage'
import { formatEuro } from '@/lib/savings'
import {
  CUSTOM_TRIP_ID,
  DEFAULT_CUSTOM_TRIP,
  TRIP_CATALOG,
  buildCustomTrip,
  getTrip,
  isCustomTripComplete,
} from '@/lib/trips/catalog'

const STEPS = ['Card', 'Trip', 'Spend', 'Plan'] as const

function spendTotal(s: UserSpendProfile) {
  return s.groceriesEur + s.travelEur + s.diningEur + s.fuelEur + s.otherEur
}

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
  const [cardId, setCardId] = useState<CatalogCardId | null>(initialWallet.cards[0]?.cardId ?? null)
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

  const wallet: UserWallet = useMemo(
    () => ({
      cards: cardId
        ? [{ cardId, revolutPlan: cardId === 'revolut' ? revolutPlan : null }]
        : [],
      balances: Object.entries(balances).map(([currency, balance]) => ({
        currency: currency as PointCurrencyId,
        balance: Number(balance) || 0,
      })),
      spend: { ...spend, monthlyTotalEur: spendTotal(spend) },
    }),
    [cardId, revolutPlan, balances, spend],
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
        setCardId(guest.cards[0]?.cardId ?? null)
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

  useEffect(() => {
    setBaselines({})
    setFareNote('')
  }, [tripId, travelDate])

  const programs = useMemo(() => {
    if (!cardId) return []
    const card = getCatalogCard(cardId)
    return card ? [card.currency] : []
  }, [cardId])

  async function checkLiveFare() {
    if (!duffelConfigured || !travelDate || tripId === CUSTOM_TRIP_ID) return
    const id = ++fareReq.current
    setFareLoading(true)
    setFareNote('')
    try {
      const selected = await getCashBaseline({ tripId, travelDate })
      if (id !== fareReq.current) return
      setBaselines((prev) => ({ ...prev, [tripId]: selected }))
      if (selected.note && selected.source === 'sample') setFareNote(selected.note)
      const top = (ranking?.reachable ?? [])
        .map((r) => r.tripId)
        .filter((tid) => tid !== tripId && getTrip(tid))
        .slice(0, 3)
      if (top.length) {
        const extra = await getCashBaselines(top.map((tid) => ({ tripId: tid, travelDate })))
        if (id !== fareReq.current) return
        setBaselines((prev) => ({ ...prev, ...extra }))
      }
    } catch {
      if (id !== fareReq.current) return
      setFareNote('Live fare unavailable, using a sample estimate')
    } finally {
      if (id === fareReq.current) setFareLoading(false)
    }
  }

  useEffect(() => {
    if (!duffelConfigured || !travelDate || step < 1 || tripId === CUSTOM_TRIP_ID) return
    const t = window.setTimeout(() => {
      void checkLiveFare()
    }, 600)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, travelDate, duffelConfigured])

  const mismatch = spend.monthlyTotalEur > 0 && spendTotal(spend) !== spend.monthlyTotalEur

  return (
    <div className="relative pb-32 lg:pb-10">
      <div className="mb-6">
        <p className="eyebrow">Spend plan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Plan your spend</h1>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                  i === step ? 'bg-[#2a211b] text-white' : 'bg-[#eee4d8] text-[#66584e]'
                }`}
                onClick={() => setStep(i)}
              >
                {i + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {step === 0 ? (
            <section>
              <h2 className="text-xl font-semibold">Select your card</h2>
              <p className="mt-1 text-sm text-[#76675c]">
                Choose one card from the catalog. Source: A una milla de tu destino.{' '}
                <a className="underline" href="https://aunamilladetudestino.com/tarjetas-de-credito/">
                  Cards page
                </a>
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Card selection">
                {CARD_CATALOG.map((card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    selected={cardId === card.id}
                    revolutPlan={revolutPlan}
                    onSelect={() => setCardId(card.id)}
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
                  className={`min-h-11 overflow-hidden rounded-2xl border border-dashed text-left ${
                    tripId === CUSTOM_TRIP_ID ? 'border-[#b86632] bg-[#fffaf2]' : 'border-[#cbbbae] bg-[#f7f2e9]'
                  }`}
                >
                  <div className="flex h-32 items-center justify-center bg-[#eee4d8]">
                    <p className="text-sm font-semibold text-[#b86632]">Custom trip</p>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">Enter your own route</p>
                    <p className="text-xs text-[#76675c]">Airport codes, cabin, points and a cash estimate you provide.</p>
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
                      className={`min-h-11 overflow-hidden rounded-2xl border text-left ${
                        tripId === t.id ? 'border-[#b86632]' : 'border-[#e1d6c8]'
                      }`}
                    >
                      {t.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.image} alt="" className="h-32 w-full object-cover" />
                      ) : (
                        <div className="h-32 bg-[#eee4d8]" />
                      )}
                      <div className="p-4">
                        <p className="font-semibold">{t.label}</p>
                        <p className="text-xs text-[#76675c]">{t.note}</p>
                        <p className="mt-2 text-sm">
                          Typical cash (sample) {formatEuro(t.typicalCashEur)}
                          {live?.source === 'duffel_live' ? ` · live ${formatEuro(cash)}` : ''}
                        </p>
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
                  className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                />
              </label>
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
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h2 className="text-xl font-semibold">Your points and spending</h2>
              <div className="mt-4 grid gap-3">
                {programs.length === 0 ? (
                  <p className="text-sm text-[#76675c]">Select cards first to enter balances.</p>
                ) : (
                  programs.map((id) => (
                    <label key={id} className="text-sm font-semibold">
                      {POINT_CURRENCIES[id].displayName}
                      <input
                        type="number"
                        min={0}
                        className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
                        value={balances[id] ?? 0}
                        onChange={(e) =>
                          setBalances((b) => ({ ...b, [id]: Number(e.target.value) || 0 }))
                        }
                      />
                    </label>
                  ))
                )}
              </div>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setSpend({ ...SAMPLE_SPEND_PROFILE, monthlyTotalEur: spendTotal(SAMPLE_SPEND_PROFILE) })}
              >
                Typical household EUR 1,500
              </Button>
              {(['groceriesEur', 'travelEur', 'diningEur', 'fuelEur', 'otherEur'] as const).map((key) => (
                <label key={key} className="mt-3 block text-sm font-semibold capitalize">
                  {key.replace('Eur', '')}
                  <input
                    type="number"
                    min={0}
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#e1d6c8] px-3"
                    value={spend[key]}
                    onChange={(e) =>
                      setSpend((s) => {
                        const next = { ...s, [key]: Number(e.target.value) || 0 }
                        return { ...next, monthlyTotalEur: spendTotal(next) }
                      })
                    }
                  />
                </label>
              ))}
              <p className="mt-3 text-sm">
                Categories {formatEuro(spendTotal(spend))} · monthly total {formatEuro(spend.monthlyTotalEur || spendTotal(spend))}
              </p>
              {mismatch ? (
                <p className="text-sm text-[#b86632]">Category amounts must add up to the monthly total.</p>
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
                duffelConfigured={duffelConfigured && tripId !== CUSTOM_TRIP_ID}
                fareLoading={fareLoading}
                fareNote={fareNote}
                verified={verified}
                saveMessage={saveMessage}
                onCheckFare={() => void checkLiveFare()}
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
              <Button
                variant="terra"
                disabled={step === 1 && !customReady}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 hidden h-fit rounded-2xl border border-[#e1d6c8] bg-[#fffaf2] p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a39182]">Summary</p>
          <p className="mt-2 text-sm">{cardId ? getCatalogCard(cardId)?.name : 'No card yet'}</p>
          <p className="text-sm">{trip.label}</p>
          <p className="text-sm">{travelDate || 'No date yet'}</p>
          {plan ? <p className="mt-2 font-semibold">{formatEuro(plan.netSavingEur)}</p> : null}
        </aside>
      </div>

      {step < 3 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[#e1d6c8] bg-[#fffaf2] p-3 lg:hidden">
          <p className="text-sm">
            {trip.destination} · {travelDate || 'Pick a date'} · {plan ? formatEuro(plan.netSavingEur) : '—'}
          </p>
          <Button
            variant="terra"
            disabled={step === 1 && !customReady}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </Button>
        </div>
      ) : null}
    </div>
  )
}
