import type { DuffelMode } from '@/lib/providers/types'
import type { FlightOffer } from '@/lib/providers/types'
import type { SampleTrip } from '@/lib/trips/catalog'
import {
  resolveCashBaseline,
  sampleBaseline,
  type CashBaseline,
  type LiveCashFare,
} from './cash-baseline'
import { addDaysYmd, parseYmd, utcYmd } from './dates'

export const FALLBACK_NOTE = 'Live fare unavailable, using a sample estimate'
export const DATE_NOTE = 'Travel date must be from tomorrow up to 330 days ahead'
const MAX_AHEAD_DAYS = 330

export type SearchCashFn = (query: {
  origin: string
  destination: string
  departDate: string
  returnDate?: string
  cabin: SampleTrip['cabin']
  adults: number
}) => Promise<FlightOffer[]>

export function travelDateAllowed(travelDate: string, today: Date): boolean {
  if (!parseYmd(travelDate)) return false
  const min = addDaysYmd(utcYmd(today), 1)
  const max = addDaysYmd(utcYmd(today), MAX_AHEAD_DAYS)
  return travelDate >= min && travelDate <= max
}

export function returnDateFor(trip: SampleTrip, travelDate: string): string | undefined {
  if (trip.journey !== 'return') return undefined
  return addDaysYmd(travelDate, trip.tripLengthDays ?? 7)
}

export function liveFromOffers(
  trip: SampleTrip,
  offers: FlightOffer[],
  mode: DuffelMode,
  fetchedAt: string,
): LiveCashFare | undefined {
  const cheapest = offers[0]
  if (!cheapest || !Number.isFinite(cheapest.cashPrice)) return undefined
  return {
    amount: cheapest.cashPrice,
    currency: cheapest.currency ?? 'EUR',
    mode,
    cabin: cheapest.cabin,
    journey: trip.journey,
    fetchedAt,
  }
}

export async function fetchResolvedCashBaseline(input: {
  trip: SampleTrip
  travelDate: string
  today: Date
  mode: DuffelMode
  search: SearchCashFn
  hasKey: boolean
}): Promise<CashBaseline> {
  if (!travelDateAllowed(input.travelDate, input.today)) {
    return sampleBaseline(input.trip, DATE_NOTE)
  }
  if (!input.hasKey) {
    return sampleBaseline(input.trip)
  }
  try {
    const offers = await input.search({
      origin: input.trip.originIata,
      destination: input.trip.destinationIata,
      departDate: input.travelDate,
      returnDate: returnDateFor(input.trip, input.travelDate),
      cabin: input.trip.cabin,
      adults: 1,
    })
    if (!offers.length) return sampleBaseline(input.trip)
    const live = liveFromOffers(input.trip, offers, input.mode, input.today.toISOString())
    return resolveCashBaseline(input.trip, live, input.today)
  } catch {
    return sampleBaseline(input.trip)
  }
}
