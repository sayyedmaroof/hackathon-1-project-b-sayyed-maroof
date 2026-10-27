'use server'

import { z } from 'zod'
import { getClientIp } from '@/lib/auth/session'
import { getDuffelApiKey, getDuffelMode } from '@/lib/providers/duffel-client'
import { searchDuffelCash } from '@/lib/providers/duffel'
import { withDuffelLimit } from '@/lib/providers/duffel-limiter'
import type { DataMode } from '@/lib/providers/types'
import { allowCashBaselineCall } from '@/lib/plan/cash-rate-limit'
import { FALLBACK_NOTE, fetchResolvedCashBaseline } from '@/lib/plan/fetch-cash-baseline'
import { RATE_LIMIT_FARE_NOTE } from '@/lib/plan/constants'
import type { CashBaseline } from '@/lib/plan/cash-baseline'
import {
  getCachedCashBaseline,
  isCachedFailure,
  setCachedCashBaseline,
  setCachedCashBaselineFailure,
  type CashBaselineCacheKeyInput,
} from '@/lib/search/cache'
import { CUSTOM_TRIP_ID, getTrip, tripIds, type SampleTrip } from '@/lib/trips/catalog'

const inputSchema = z.object({
  tripId: z.enum(tripIds() as [string, ...string[]]),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const customSchema = z.object({
  originIata: z.string().regex(/^[A-Z]{3}$/),
  destinationIata: z.string().regex(/^[A-Z]{3}$/),
  origin: z.string().min(1).max(80),
  destination: z.string().min(1).max(80),
  cabin: z.enum(['Economy', 'Business']),
  journey: z.enum(['one_way', 'return']),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  typicalCashEur: z.number().positive(),
  taxesEur: z.number().nonnegative(),
})

export type CashBaselineResult = CashBaseline & { dataMode: DataMode; rateLimited?: boolean }

const BATCH_BUDGET_MS = 10_000

function dataModeFor(source: CashBaseline['source']): DataMode {
  if (source === 'duffel_live') return 'live'
  if (source === 'duffel_test') return 'test'
  return 'sample'
}

function sampleResult(trip: SampleTrip, note: string, rateLimited = false): CashBaselineResult {
  return {
    eur: trip.typicalCashEur,
    source: 'sample',
    note,
    dataMode: 'sample',
    rateLimited,
  }
}

function cacheKeyFor(trip: SampleTrip, travelDate: string): CashBaselineCacheKeyInput {
  const key: CashBaselineCacheKeyInput = {
    origin: trip.originIata,
    destination: trip.destinationIata,
    cabin: trip.cabin,
    journey: trip.journey,
    departDate: travelDate,
    mode: getDuffelMode(),
  }
  if (trip.journey === 'return') {
    const days = trip.tripLengthDays ?? 7
    const [y, m, d] = travelDate.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d + days))
    key.returnDate = dt.toISOString().slice(0, 10)
  }
  return key
}

async function resolveTrip(trip: SampleTrip, travelDate: string, today: Date): Promise<CashBaselineResult> {
  const key = cacheKeyFor(trip, travelDate)
  if (isCachedFailure(key)) {
    return sampleResult(trip, FALLBACK_NOTE)
  }
  const cached = getCachedCashBaseline(key)
  if (cached) return { ...cached, dataMode: dataModeFor(cached.source) }

  const hasKey = Boolean(getDuffelApiKey())
  const mode = getDuffelMode()
  const result = await fetchResolvedCashBaseline({
    trip,
    travelDate,
    today,
    mode,
    hasKey,
    search: (query) =>
      withDuffelLimit(() => searchDuffelCash(query, { timeoutMs: 5000, supplierTimeoutMs: 8000 })),
  })
  if (result.source === 'sample' && result.note === FALLBACK_NOTE && hasKey) {
    setCachedCashBaselineFailure(key)
  } else {
    setCachedCashBaseline(key, result)
  }
  return { ...result, dataMode: dataModeFor(result.source) }
}

async function resolveOne(tripId: string, travelDate: string, today: Date): Promise<CashBaselineResult> {
  const trip = getTrip(tripId)
  if (!trip) {
    return { eur: 0, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
  }
  return resolveTrip(trip, travelDate, today)
}

function withBudget<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  if (ms <= 0) return Promise.resolve(fallback)
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(fallback)
      },
    )
  })
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
    return sampleResult(trip, RATE_LIMIT_FARE_NOTE, true)
  }
  return resolveOne(parsed.data.tripId, parsed.data.travelDate, today)
}

export async function getCashBaselines(
  items: { tripId: string; travelDate: string }[],
  opts?: { skipTripIds?: string[] },
): Promise<Record<string, CashBaselineResult>> {
  const skip = new Set(opts?.skipTripIds ?? [])
  const slice = items.filter((item) => !skip.has(item.tripId)).slice(0, 4)
  const ip = await getClientIp()
  const today = new Date()
  const out: Record<string, CashBaselineResult> = {}
  const toFetch: { tripId: string; travelDate: string; trip: SampleTrip }[] = []

  for (const item of slice) {
    const parsed = inputSchema.safeParse(item)
    const trip = getTrip(item.tripId)
    if (!parsed.success || !trip) {
      if (trip) out[item.tripId] = sampleResult(trip, FALLBACK_NOTE)
      continue
    }
    const key = cacheKeyFor(trip, parsed.data.travelDate)
    const cached = getCachedCashBaseline(key)
    if (cached) {
      out[item.tripId] = { ...cached, dataMode: dataModeFor(cached.source) }
      continue
    }
    toFetch.push({ tripId: parsed.data.tripId, travelDate: parsed.data.travelDate, trip })
  }

  if (toFetch.length === 0) return out

  const allowed = allowCashBaselineCall(ip)
  if (!allowed) {
    for (const item of toFetch) {
      out[item.tripId] = sampleResult(item.trip, RATE_LIMIT_FARE_NOTE, true)
    }
    return out
  }

  const deadline = Date.now() + BATCH_BUDGET_MS
  await Promise.all(
    toFetch.map(async (item) => {
      const remaining = deadline - Date.now()
      out[item.tripId] = await withBudget(
        resolveOne(item.tripId, item.travelDate, today),
        remaining,
        sampleResult(item.trip, FALLBACK_NOTE),
      )
    }),
  )
  return out
}

export async function getCustomCashBaseline(input: z.infer<typeof customSchema>): Promise<CashBaselineResult> {
  const parsed = customSchema.safeParse(input)
  const today = new Date()
  if (!parsed.success) {
    return { eur: input.typicalCashEur || 0, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
  }
  if (parsed.data.originIata === parsed.data.destinationIata) {
    return { eur: parsed.data.typicalCashEur, source: 'sample', note: FALLBACK_NOTE, dataMode: 'sample' }
  }
  const ip = await getClientIp()
  if (!allowCashBaselineCall(ip)) {
    return {
      eur: parsed.data.typicalCashEur,
      source: 'sample',
      note: RATE_LIMIT_FARE_NOTE,
      dataMode: 'sample',
      rateLimited: true,
    }
  }
  const trip: SampleTrip = {
    id: CUSTOM_TRIP_ID,
    label: `${parsed.data.origin} to ${parsed.data.destination}`,
    origin: parsed.data.origin,
    destination: parsed.data.destination,
    originIata: parsed.data.originIata,
    destinationIata: parsed.data.destinationIata,
    cabin: parsed.data.cabin,
    journey: parsed.data.journey,
    tripLengthDays: parsed.data.journey === 'return' ? 7 : undefined,
    awardCurrency: 'iberia_avios',
    pointsRequired: 1,
    taxesEur: parsed.data.taxesEur,
    typicalCashEur: parsed.data.typicalCashEur,
    note: 'Custom trip',
  }
  return resolveTrip(trip, parsed.data.travelDate, today)
}
