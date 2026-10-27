import type { SampleTrip, TripJourney } from '@/lib/trips/catalog'

export type CashBaselineSource = 'sample' | 'duffel_live' | 'duffel_test'

export type CashBaseline = {
  eur: number
  source: CashBaselineSource
  fetchedAt?: string
  note?: string
}

export type LiveCashFare = {
  amount: number
  currency: string
  mode: 'live' | 'test' | 'unknown'
  cabin: string
  journey: TripJourney
  fetchedAt: string
}

const LIVE_MAX_AGE_MS = 24 * 60 * 60 * 1000
const SAMPLE_NOTE = 'Live fare unavailable, using a sample estimate'

function isFresh(fetchedAt: string, today: Date): boolean {
  const at = Date.parse(fetchedAt)
  if (!Number.isFinite(at)) return false
  return today.getTime() - at <= LIVE_MAX_AGE_MS && today.getTime() - at >= -60_000
}

export function sampleBaseline(trip: SampleTrip, note?: string): CashBaseline {
  return {
    eur: trip.typicalCashEur,
    source: 'sample',
    note: note ?? SAMPLE_NOTE,
  }
}

export function resolveCashBaseline(trip: SampleTrip, live: LiveCashFare | undefined, today: Date): CashBaseline {
  if (!live) return { eur: trip.typicalCashEur, source: 'sample' }

  if (live.mode === 'test') {
    return {
      eur: trip.typicalCashEur,
      source: 'duffel_test',
      fetchedAt: live.fetchedAt,
      note: `Sandbox fare ${live.currency} ${live.amount} not used`,
    }
  }

  const amountOk = Number.isFinite(live.amount) && live.amount > 0
  const currencyOk = live.currency === 'EUR'
  const cabinOk = live.cabin === trip.cabin
  const journeyOk = live.journey === trip.journey
  const modeOk = live.mode === 'live'
  const fresh = isFresh(live.fetchedAt, today)

  if (modeOk && amountOk && currencyOk && cabinOk && journeyOk && fresh) {
    return {
      eur: live.amount,
      source: 'duffel_live',
      fetchedAt: live.fetchedAt,
    }
  }

  return sampleBaseline(trip)
}

export function cashBaselineForTrip(
  trip: SampleTrip,
  baselines: Record<string, CashBaseline> | undefined,
): CashBaseline {
  return baselines?.[trip.id] ?? { eur: trip.typicalCashEur, source: 'sample' }
}
