import { addDays } from '@/lib/dates'
import { effectiveCost } from '@/lib/savings'
import { sampleAwardProvider } from '@/lib/providers/award-sample'
import { searchDuffelCash } from '@/lib/providers/duffel'
import { expandAirport } from '@/lib/providers/nearby'
import type { FlightOffer, ProviderSearchQuery, SearchFlightsResult } from '@/lib/providers/types'
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

async function baselineCash(query: ProviderSearchQuery): Promise<{ offers: FlightOffer[]; normalPrice: number }> {
  const offers = await searchDuffelCash(query)
  const normalPrice = offers.length ? Math.min(...offers.map((o) => o.cashPrice)) : 0
  return { offers, normalPrice }
}

async function awardOptions(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  try {
    return await sampleAwardProvider.search(query)
  } catch {
    return []
  }
}

async function flexibleHack(parsed: ParsedSearchQuery, normalPrice: number): Promise<FlightOffer[]> {
  if (!parsed.flexible) return []
  const base = baseQuery(parsed)
  const results: FlightOffer[] = []
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0) continue
    const departDate = addDays(parsed.depart, offset)
    const returnDate = parsed.returnDate < departDate ? departDate : parsed.returnDate
    const q = { ...base, departDate, returnDate }
    try {
      const cash = await searchDuffelCash(q)
      const best = cash.sort((a, b) => a.cashPrice - b.cashPrice)[0]
      if (best && best.cashPrice < normalPrice) {
        results.push({
          ...best,
          id: `${best.id}-flex-${offset}`,
          kind: 'flexible_dates',
          whyThisWorks: `Departing ${offset > 0 ? `${offset} days later` : `${Math.abs(offset)} days earlier`} lowers the cash fare.`,
          departDate,
          returnDate,
        })
      }
    } catch {
      // skip failed day
    }
  }
  return results
}

async function nearbyHack(parsed: ParsedSearchQuery, normalPrice: number): Promise<FlightOffer[]> {
  const base = baseQuery(parsed)
  const origins = expandAirport(parsed.originCode).filter((c) => c !== parsed.originCode)
  const dests = expandAirport(parsed.destinationCode).filter((c) => c !== parsed.destinationCode)
  const results: FlightOffer[] = []

  for (const origin of origins) {
    try {
      const cash = await searchDuffelCash({ ...base, origin })
      const best = cash.sort((a, b) => a.cashPrice - b.cashPrice)[0]
      if (best && best.cashPrice < normalPrice) {
        results.push({
          ...best,
          id: `${best.id}-near-o-${origin}`,
          kind: 'nearby_airport',
          whyThisWorks: `Flying from ${origin} instead of ${parsed.originCode} is cheaper before ground transfer.`,
          searchOrigin: origin,
        })
      }
    } catch {
      // skip
    }
  }

  for (const destination of dests) {
    try {
      const cash = await searchDuffelCash({ ...base, destination })
      const best = cash.sort((a, b) => a.cashPrice - b.cashPrice)[0]
      if (best && best.cashPrice < normalPrice) {
        results.push({
          ...best,
          id: `${best.id}-near-d-${destination}`,
          kind: 'nearby_airport',
          whyThisWorks: `Landing at ${destination} instead of ${parsed.destinationCode} cuts the fare.`,
          searchDestination: destination,
        })
      }
    } catch {
      // skip
    }
  }

  return results
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

export async function runFlightSearch(parsed: ParsedSearchQuery): Promise<SearchFlightsResult> {
  const query = baseQuery(parsed)
  let error: string | undefined
  let cashOffers: FlightOffer[] = []
  let normalPrice = 0

  try {
    const baseline = await baselineCash(query)
    cashOffers = baseline.offers
    normalPrice = baseline.normalPrice
  } catch (e) {
    error = e instanceof Error ? e.message : 'Cash search failed'
  }

  const awards = await awardOptions(query)
  const awardTagged = awards.map((a) => ({
    ...a,
    whyThisWorks: a.whyThisWorks || 'Redeem points plus taxes instead of paying full cash.',
  }))

  const flex = normalPrice > 0 ? await flexibleHack(parsed, normalPrice) : []
  const nearby = normalPrice > 0 ? await nearbyHack(parsed, normalPrice) : []

  const alternatives = dedupe([
    ...cashOffers.map((o) => ({ ...o, kind: 'cash' as const })),
    ...awardTagged,
    ...flex,
    ...nearby,
  ]).sort((a, b) => rankCost(a) - rankCost(b))

  const best = alternatives[0] ?? null
  const bestCost = best ? rankCost(best) : normalPrice
  const savingsAmount = Math.max(0, Math.round(normalPrice - bestCost))
  const savingsPct = normalPrice > 0 ? savingsAmount / normalPrice : 0

  return {
    normalPrice,
    best,
    savings: { amount: savingsAmount, pct: savingsPct },
    alternatives,
    error,
  }
}
