'use server'

import { z } from 'zod'
import { getClientIp } from '@/lib/auth/session'
import { getDuffelApiKey, getDuffelMode } from '@/lib/providers/duffel-client'
import { searchDuffelCash } from '@/lib/providers/duffel'
import { withDuffelLimit } from '@/lib/providers/duffel-limiter'
import type { DataMode } from '@/lib/providers/types'
import { allowCashBaselineCall } from '@/lib/plan/cash-rate-limit'
import { fetchResolvedCashBaseline, FALLBACK_NOTE } from '@/lib/plan/fetch-cash-baseline'
import type { CashBaseline } from '@/lib/plan/cash-baseline'
import {
  getCachedCashBaseline,
  isCachedFailure,
  setCachedCashBaseline,
  setCachedCashBaselineFailure,
  type CashBaselineCacheKeyInput,
} from '@/lib/search/cache'
import { getTrip, tripIds } from '@/lib/trips/catalog'

const inputSchema = z.object({
  tripId: z.enum(tripIds() as [string, ...string[]]),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type CashBaselineResult = CashBaseline & { dataMode: DataMode }

function dataModeFor(source: CashBaseline['source']): DataMode {
  if (source === 'duffel_live') return 'live'
  if (source === 'duffel_test') return 'test'
  return 'sample'
}

function cacheKeyFor(tripId: string, travelDate: string): CashBaselineCacheKeyInput | null {
  const trip = getTrip(tripId)
  if (!trip) return null
  return {
    origin: trip.originIata,
    destination: trip.destinationIata,
    cabin: trip.cabin,
    journey: trip.journey,
    departDate: travelDate,
    returnDate: trip.journey === 'return' ? undefined : undefined,
    mode: getDuffelMode(),
  }
}

function keyWithReturn(tripId: string, travelDate: string): CashBaselineCacheKeyInput | null {
  const trip = getTrip(tripId)
  const base = cacheKeyFor(tripId, travelDate)
  if (!trip || !base) return null
  if (trip.journey === 'return') {
    const days = trip.tripLengthDays ?? 7
    const [y, m, d] = travelDate.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d + days))
    base.returnDate = dt.toISOString().slice(0, 10)
  }
  return base
}

async function resolveOne(tripId: string, travelDate: string, today: Date): Promise<CashBaselineResult> {
  const trip = getTrip(tripId)
  if (!trip) {
    return { eur: 0, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
  }
  const key = keyWithReturn(tripId, travelDate)
  if (key) {
    if (isCachedFailure(key)) {
      return { eur: trip.typicalCashEur, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
    }
    const cached = getCachedCashBaseline(key)
    if (cached) return { ...cached, dataMode: dataModeFor(cached.source) }
  }

  const hasKey = Boolean(getDuffelApiKey())
  const mode = getDuffelMode()
  const result = await fetchResolvedCashBaseline({
    trip,
    travelDate,
    today,
    mode,
    hasKey,
    search: (query) =>
      withDuffelLimit(() =>
        searchDuffelCash(query, { timeoutMs: 5000, supplierTimeoutMs: 8000 }),
      ),
  })

  if (key) {
    if (result.source === 'sample' && result.note === FALLBACK_NOTE && hasKey) {
      setCachedCashBaselineFailure(key)
    } else {
      setCachedCashBaseline(key, result)
    }
  }
  return { ...result, dataMode: dataModeFor(result.source) }
}

export async function getCashBaseline(input: {
  tripId: string
  travelDate: string
}): Promise<CashBaselineResult> {
  const parsed = inputSchema.safeParse(input)
  const today = new Date()
  if (!parsed.success) {
    const trip = getTrip(input.tripId)
    return {
      eur: trip?.typicalCashEur ?? 0,
      source: 'sample',
      note: FALLBACK_NOTE,
      dataMode: 'sample',
    }
  }
  const ip = await getClientIp()
  if (!allowCashBaselineCall(ip)) {
    const trip = getTrip(parsed.data.tripId)!
    return { eur: trip.typicalCashEur, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
  }
  return resolveOne(parsed.data.tripId, parsed.data.travelDate, today)
}

export async function getCashBaselines(
  items: { tripId: string; travelDate: string }[],
): Promise<Record<string, CashBaselineResult>> {
  const slice = items.slice(0, 4)
  const ip = await getClientIp()
  const out: Record<string, CashBaselineResult> = {}
  const today = new Date()
  for (const item of slice) {
    const parsed = inputSchema.safeParse(item)
    const trip = getTrip(item.tripId)
    if (!parsed.success || !trip) {
      if (trip) out[item.tripId] = { eur: trip.typicalCashEur, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
      continue
    }
    if (!allowCashBaselineCall(ip)) {
      out[item.tripId] = { eur: trip.typicalCashEur, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
      continue
    }
    out[item.tripId] = await resolveOne(parsed.data.tripId, parsed.data.travelDate, today)
  }
  return out
}
