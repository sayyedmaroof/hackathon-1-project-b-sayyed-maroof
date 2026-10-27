import { addDays } from '@/lib/dates'
import { effectiveCost } from '@/lib/savings'
import { sampleAwardProvider } from '@/lib/providers/award-sample'
import { searchCashOffers } from '@/lib/providers/duffel'
import { DuffelError, userMessageForDuffel } from '@/lib/providers/duffel-errors'
import { withDuffelLimit } from '@/lib/providers/duffel-limiter'
import { getDuffelApiKey, getDuffelMode } from '@/lib/providers/duffel-client'
import { nearbySearchAirports } from '@/lib/providers/nearby'
import type { DataMode, FlightOffer, ProviderSearchQuery, SearchFlightsResult } from '@/lib/providers/types'
import type { ParsedSearchQuery } from './query-schema'

function baseQuery(parsed: ParsedSearchQuery): ProviderSearchQuery {
  return {
    origin: parsed.originCode,
    destination: parsed.destinationCode,
    departDate: parsed.depart,
    returnDate: parsed.returnDate,
    cabin: parsed.cabin,
    adults: parsed.adults,
  }
}

function rankCost(offer: FlightOffer): number {
  return effectiveCost(offer.cashPrice, offer.fees, offer.points)
}

function currentDataMode(offers: FlightOffer[]): DataMode {
  const fromOffer = offers.find((o) => o.dataMode)?.dataMode
  if (fromOffer) return fromOffer
  if (!getDuffelApiKey()) return process.env.NODE_ENV === 'production' ? 'unknown' : 'sample'
  return getDuffelMode()
}

async function awardOptions(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  try {
    return await sampleAwardProvider.search(query)
  } catch {
    return []
  }
}

async function searchOne(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  return withDuffelLimit(() => searchCashOffers(query))
}

async function flexibleHack(parsed: ParsedSearchQuery, normalPrice: number, currency: string): Promise<FlightOffer[]> {
  if (!parsed.flexible) return []
  const base = baseQuery(parsed)
  const jobs: Promise<FlightOffer | null>[] = []
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue
    const departDate = addDays(parsed.depart, offset)
    const returnDate = parsed.returnDate < departDate ? departDate : parsed.returnDate
    const q = { ...base, departDate, returnDate }
    jobs.push(
      searchOne(q)
        .then((cash) => {
          const best = [...cash].sort((a, b) => a.cashPrice - b.cashPrice)[0]
          if (!best || (best.currency ?? currency) !== currency || best.cashPrice >= normalPrice) return null
          return {
            ...best,
            id: `${best.id}-flex-${offset}`,
            kind: 'flexible_dates' as const,
            whyThisWorks: `Departing ${offset > 0 ? `${offset} days later` : `${Math.abs(offset)} days earlier`} lowers the cash fare.`,
            departDate,
            returnDate,
          }
        })
        .catch(() => null),
    )
  }
  return (await Promise.all(jobs)).filter((o): o is FlightOffer => o != null)
}

async function nearbyHack(parsed: ParsedSearchQuery, normalPrice: number, currency: string): Promise<FlightOffer[]> {
  const base = baseQuery(parsed)
  const origins = nearbySearchAirports(parsed.originCode, parsed.destinationCode)
  const dests = nearbySearchAirports(parsed.destinationCode, parsed.originCode)
  const jobs: Promise<FlightOffer | null>[] = []

  const push = (query: ProviderSearchQuery, why: string, extra: Partial<FlightOffer>, idSuffix: string) => {
    jobs.push(
      searchOne(query)
        .then((cash) => {
          const best = [...cash].sort((a, b) => a.cashPrice - b.cashPrice)[0]
          if (!best || (best.currency ?? currency) !== currency || best.cashPrice >= normalPrice) return null
          return { ...best, id: `${best.id}-${idSuffix}`, kind: 'nearby_airport' as const, whyThisWorks: why, ...extra }
        })
        .catch(() => null),
    )
  }

  for (const origin of origins) {
    push(
      { ...base, origin },
      `Flying from ${origin} instead of ${parsed.originCode} is cheaper before ground transfer.`,
      { searchOrigin: origin },
      `near-o-${origin}`,
    )
  }
  for (const destination of dests) {
    push(
      { ...base, destination },
      `Landing at ${destination} instead of ${parsed.destinationCode} cuts the fare.`,
      { searchDestination: destination },
      `near-d-${destination}`,
    )
  }
  return (await Promise.all(jobs)).filter((o): o is FlightOffer => o != null)
}

function dedupe(offers: FlightOffer[]): FlightOffer[] {
  const seen = new Set<string>()
  const out: FlightOffer[] = []
  for (const o of offers) {
    const key = `${o.kind}-${o.duffelOfferId ?? o.id}-${o.cashPrice}-${o.points}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(o)
  }
  return out
}

function cashErrorMessage(e: unknown): { error: string; warning?: string; partial: boolean } {
  if (e instanceof DuffelError) {
    const message = userMessageForDuffel(e)
    if (e.status === 504 || e.code === 'airline_internal') {
      return { error: '', warning: message, partial: true }
    }
    return { error: message, partial: false }
  }
  return { error: 'Cash fares are unavailable. Award options may still appear.', partial: false }
}

export async function runFlightSearch(parsed: ParsedSearchQuery): Promise<SearchFlightsResult> {
  const query = baseQuery(parsed)
  let error: string | undefined
  let warning: string | undefined
  let cashOffers: FlightOffer[] = []
  let normalPrice = 0
  let displayCurrency = 'EUR'

  try {
    cashOffers = await searchCashOffers(query)
    if (cashOffers.length === 0) {
      warning = 'No flights found for this route'
    } else {
      const cheapest = [...cashOffers].sort((a, b) => a.cashPrice - b.cashPrice)[0]
      normalPrice = cheapest.cashPrice
      displayCurrency = cheapest.currency ?? 'EUR'
    }
  } catch (e) {
    const mapped = cashErrorMessage(e)
    if (mapped.warning) warning = mapped.warning
    if (mapped.error) error = mapped.error
  }

  const awards = (await awardOptions(query)).map((a) => ({
    ...a,
    currency: a.currency ?? 'EUR',
    whyThisWorks: a.whyThisWorks || 'Redeem points plus taxes instead of paying full cash.',
  }))

  const flex = normalPrice > 0 ? await flexibleHack(parsed, normalPrice, displayCurrency) : []
  const nearby = normalPrice > 0 ? await nearbyHack(parsed, normalPrice, displayCurrency) : []

  const alternatives = dedupe([
    ...cashOffers.map((o) => ({ ...o, kind: 'cash' as const })),
    ...awards,
    ...flex,
    ...nearby,
  ]).sort((a, b) => rankCost(a) - rankCost(b))

  const best = alternatives[0] ?? null
  const sameCurrency = !!best && (best.currency ?? displayCurrency) === displayCurrency
  const bestCost = best && sameCurrency ? rankCost(best) : normalPrice
  const savingsAmount = sameCurrency ? Math.max(0, Math.round(normalPrice - bestCost)) : 0
  const savingsPct = sameCurrency && normalPrice > 0 ? savingsAmount / normalPrice : 0

  return {
    normalPrice,
    best,
    savings: { amount: savingsAmount, pct: savingsPct },
    alternatives,
    error,
    warning,
    dataMode: currentDataMode(cashOffers),
    displayCurrency,
  }
}
