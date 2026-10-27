'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { bookCashOffer, markAwardBooked } from '@/app/actions/booking'
import { Button } from '@/components/button'
import { PointsPathPanel } from '@/components/points-path-panel'
import type { PointsPlan } from '@/lib/cards/types'
import { AWARD_STEPS } from '@/lib/loyalty'
import type { FlightOffer } from '@/lib/providers/types'
import { calculateSavings, formatCents, formatEuro, formatPct, formatPoints } from '@/lib/savings'

const TRANSFER_NOTE =
  'Typical path: Revolut → British Airways → Iberia. Accounts must be 30+ days old and passenger details must match.'

export function OfferDrawer({
  offer,
  normalPrice,
  resultsPath,
  userVerified,
  isSampleProfile,
  pointsPlan,
  planCurrencyId,
  onClose,
}: {
  offer: FlightOffer
  normalPrice: number
  resultsPath: string
  userVerified: boolean
  isSampleProfile: boolean
  pointsPlan: PointsPlan | null
  planCurrencyId?: string
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const savings = calculateSavings({ cash: offer.cashPrice, fees: offer.fees, points: offer.points })
  const loginHref = `/login?next=${encodeURIComponent(resultsPath)}`
  const isCash = offer.source === 'duffel' && offer.duffelOfferId

  const [passenger, setPassenger] = useState({
    givenName: '',
    familyName: '',
    email: '',
    phone: '+34',
    bornOn: '1990-01-01',
    gender: 'm' as 'm' | 'f',
  })
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    closeRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submitCash() {
    if (!offer.duffelOfferId) return
    setPending(true)
    setError(null)
    const formData = new FormData()
    formData.set('offerId', offer.duffelOfferId)
    formData.set('normalPrice', String(normalPrice))
    formData.set('origin', offer.origin)
    formData.set('destination', offer.destination)
    formData.set('departDate', offer.departDate ?? '')
    formData.set('returnDate', offer.returnDate ?? '')
    formData.set('cabin', offer.cabin)
    formData.set('cashPrice', String(offer.cashPrice))
    formData.set('passengers', JSON.stringify([passenger]))
    formData.set('next', resultsPath)
    const result = await bookCashOffer(null, formData)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setPending(false)
    }
  }

  async function submitAward() {
    setPending(true)
    setError(null)
    const formData = new FormData()
    formData.set('offerKey', offer.id)
    formData.set('normalPrice', String(normalPrice))
    formData.set('origin', offer.origin)
    formData.set('destination', offer.destination)
    formData.set('departDate', offer.departDate ?? '')
    formData.set('returnDate', offer.returnDate ?? '')
    formData.set('cabin', offer.cabin)
    formData.set('cashPrice', String(offer.cashPrice))
    formData.set('awardPoints', String(offer.points))
    formData.set('awardFees', String(offer.fees))
    formData.set('passengers', JSON.stringify([passenger]))
    formData.set('next', resultsPath)
    const result = await markAwardBooked(null, formData)
    if (result && 'error' in result && result.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-[#2a211b]/40" aria-label="Close details" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Offer details"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-auto bg-[#fffaf2] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Trip details</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
              {offer.origin} → {offer.destination}
            </h2>
            <p className="mt-1 text-sm text-[#76675c]">
              {offer.airline} · {offer.cabin}
            </p>
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
            <Row label="Cash fare" value={formatEuro(offer.cashPrice)} />
            <Row label="Taxes and fees" value={formatEuro(offer.fees)} />
            <Row label="Points" value={offer.points ? `${formatPoints(offer.points)} Avios` : '—'} />
            <Row label="Net saving" value={`${formatEuro(savings.netSaving)} · ${formatPct(savings.savingPct)}`} accent />
            <Row label="Cents per point" value={formatCents(savings.centsPerPoint)} />
          </dl>
        </section>

        <section className="mt-6 border-t border-[#e8ddd1] pt-5">
          <h3 className="font-semibold">Why this works</h3>
          <p className="mt-2 text-sm text-[#66584e]">{offer.whyThisWorks}</p>
        </section>

        {offer.kind === 'award' && offer.points > 0 && pointsPlan ? (
          <PointsPathPanel
            plan={pointsPlan}
            currencyId={planCurrencyId}
            isSampleProfile={isSampleProfile}
            userVerified={userVerified}
            resultsPath={resultsPath}
          />
        ) : null}

        {!userVerified ? (
          <div className="mt-6">
            <Link href={loginHref} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#b86632] text-sm font-semibold text-white">
              Sign in to book
            </Link>
          </div>
        ) : isCash ? (
          <section className="mt-6 border-t border-[#e8ddd1] pt-5">
            <h3 className="font-semibold">Passenger</h3>
            <PassengerFields value={passenger} onChange={setPassenger} />
            {error ? <p className="mt-2 text-sm text-[#8b3a2a]">{error}</p> : null}
            <Button variant="terra" className="mt-4 min-h-11 w-full" disabled={pending} onClick={() => void submitCash()}>
              {pending ? 'Booking…' : 'Book test cash fare'}
            </Button>
          </section>
        ) : (
          <section className="mt-6 border-t border-[#e8ddd1] pt-5">
            <h3 className="font-semibold">How to book this award</h3>
            <p className="mt-2 text-sm text-[#66584e]">{TRANSFER_NOTE}</p>
            <ol className="mt-4 flex flex-col gap-3">
              {AWARD_STEPS.map((step) => (
                <li key={step.id}>
                  <label className="flex min-h-11 items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[#b86632]"
                      checked={!!checklist[step.id]}
                      onChange={(e) => setChecklist((c) => ({ ...c, [step.id]: e.target.checked }))}
                    />
                    {step.label}
                  </label>
                </li>
              ))}
            </ol>
            <a
              href="https://www.iberia.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#b86632]"
            >
              Open airline site
            </a>
            <div className="mt-6">
              <h4 className="font-semibold">Traveler on record</h4>
              <PassengerFields value={passenger} onChange={setPassenger} />
            </div>
            {error ? <p className="mt-2 text-sm text-[#8b3a2a]">{error}</p> : null}
            <Button variant="terra" className="mt-4 min-h-11 w-full" disabled={pending} onClick={() => void submitAward()}>
              {pending ? 'Saving…' : 'Mark as booked'}
            </Button>
          </section>
        )}
      </aside>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#76675c]">{label}</dt>
      <dd className={accent ? 'font-semibold text-[#b86632]' : 'font-medium'}>{value}</dd>
    </div>
  )
}

function PassengerFields({
  value,
  onChange,
}: {
  value: { givenName: string; familyName: string; email: string; phone: string; bornOn: string; gender: 'm' | 'f' }
  onChange: (v: typeof value) => void
}) {
  const field = (key: keyof typeof value, label: string, type = 'text') => (
    <label className="block text-sm">
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        className="field min-h-11 w-full"
        value={value[key]}
        onChange={(e) => onChange({ ...value, [key]: e.target.value as never })}
      />
    </label>
  )
  return (
    <div className="mt-3 flex flex-col gap-3">
      {field('givenName', 'Given name')}
      {field('familyName', 'Family name')}
      {field('email', 'Email', 'email')}
      {field('phone', 'Phone')}
      {field('bornOn', 'Date of birth', 'date')}
      <label className="block text-sm">
        <span className="mb-1 block">Gender</span>
        <select
          className="field min-h-11 w-full"
          value={value.gender}
          onChange={(e) => onChange({ ...value, gender: e.target.value as 'm' | 'f' })}
        >
          <option value="m">Male</option>
          <option value="f">Female</option>
        </select>
      </label>
    </div>
  )
}
