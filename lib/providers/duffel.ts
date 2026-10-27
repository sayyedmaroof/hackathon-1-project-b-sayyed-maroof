import 'server-only'

import { cabinToDuffel } from './cabin-map'
import { duffelFetch, duffelModeFromToken, getDuffelApiKey, getDuffelMode, liveBookingAllowed } from './duffel-client'
import { DuffelError } from './duffel-errors'
import { mapDuffelOffers, type DuffelOffer } from './duffel-map'
import { searchSampleCash } from './sample-cash'
import type { DataMode, DuffelMode, FlightOffer, FlightProvider, ProviderSearchQuery } from './types'

type OfferRequestResponse = { data?: { id?: string; offers?: DuffelOffer[] } }
type OfferListResponse = { data?: DuffelOffer[]; meta?: { after?: string | null } }
type SingleOfferResponse = { data?: DuffelOffer }
type OrderResponse = { data?: { id?: string; booking_reference?: string } }

export type CreateOrderInput = {
  offerId: string
  passengers: {
    givenName: string
    familyName: string
    email: string
    phone: string
    bornOn: string
    gender: 'm' | 'f'
  }[]
}

export type FreshDuffelOffer = {
  id: string
  totalAmount: string
  totalCurrency: string
  expiresAt?: string
  passengerIds: string[]
}

function passengers(adults: number) {
  const count = Math.min(9, Math.max(1, adults))
  return Array.from({ length: count }, () => ({ type: 'adult' as const }))
}

export function offerRequestSlices(query: ProviderSearchQuery) {
  const outbound = { origin: query.origin, destination: query.destination, departure_date: query.departDate }
  if (!query.returnDate) return [outbound]
  return [outbound, { origin: query.destination, destination: query.origin, departure_date: query.returnDate }]
}

export function offerRequestBody(query: ProviderSearchQuery) {
  return {
    data: {
      cabin_class: cabinToDuffel(query.cabin),
      passengers: passengers(query.adults),
      slices: offerRequestSlices(query),
    },
  }
}

function dataMode(): DataMode {
  const mode = getDuffelMode()
  return mode === 'unknown' && !getDuffelApiKey() ? 'sample' : mode
}

export async function searchDuffelCash(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  if (query.origin === query.destination) return []
  const created = await duffelFetch<OfferRequestResponse>(
    '/air/offer_requests?return_offers=false&supplier_timeout=15000',
    { method: 'POST', body: JSON.stringify(offerRequestBody(query)) },
  )
  const requestId = created.data?.id
  if (!requestId) return []

  const listed = await duffelFetch<OfferListResponse>(
    `/air/offers?offer_request_id=${encodeURIComponent(requestId)}&sort=total_amount&limit=50`,
  )
  return mapDuffelOffers(listed.data ?? [], query, {
    kind: 'cash',
    why: 'Lowest published cash fare from airlines via Duffel.',
    dataMode: dataMode(),
  }).slice(0, 25)
}

export async function searchCashOffers(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  if (!getDuffelApiKey()) {
    if (process.env.NODE_ENV !== 'production') return searchSampleCash(query)
    console.error('DUFFEL_API_KEY is not set')
    throw new DuffelError({
      status: 0,
      type: 'authentication_error',
      code: 'missing_key',
      message: 'Cash fares are unavailable',
      requestId: '',
    })
  }
  return searchDuffelCash(query)
}

export const duffelFlightProvider: FlightProvider = {
  search: searchDuffelCash,
}

export async function getDuffelOffer(offerId: string): Promise<FreshDuffelOffer> {
  const json = await duffelFetch<SingleOfferResponse>(`/air/offers/${encodeURIComponent(offerId)}`)
  const offer = json.data
  if (!offer?.id || offer.total_amount == null || !offer.total_currency) {
    throw new DuffelError({
      status: 404,
      type: 'invalid_request_error',
      code: 'offer_no_longer_available',
      message: 'Offer not found',
      requestId: '',
    })
  }
  return {
    id: offer.id,
    totalAmount: offer.total_amount,
    totalCurrency: offer.total_currency,
    expiresAt: offer.expires_at,
    passengerIds: (offer.passengers ?? []).map((p) => p.id).filter((id): id is string => Boolean(id)),
  }
}

export function assertLiveBookingAllowed(): void {
  if (getDuffelMode() === 'live' && !liveBookingAllowed()) {
    throw new Error('Live booking is disabled')
  }
}

export async function createDuffelOrder(
  input: CreateOrderInput,
  fresh: FreshDuffelOffer,
): Promise<{ orderId: string; bookingRef: string; amount: string; currency: string }> {
  assertLiveBookingAllowed()
  const body = {
    data: {
      type: 'instant',
      selected_offers: [fresh.id],
      passengers: input.passengers.map((p, i) => ({
        id: fresh.passengerIds[i],
        given_name: p.givenName,
        family_name: p.familyName,
        email: p.email,
        phone_number: p.phone,
        born_on: p.bornOn,
        gender: p.gender,
        title: p.gender === 'm' ? 'mr' : 'ms',
      })),
      payments: [{ type: 'balance', currency: fresh.totalCurrency, amount: fresh.totalAmount }],
    },
  }
  const json = await duffelFetch<OrderResponse>('/air/orders', { method: 'POST', body: JSON.stringify(body) })
  const orderId = json.data?.id
  if (!orderId) {
    throw new DuffelError({
      status: 500,
      type: 'api_error',
      code: 'unknown',
      message: 'Order created without an id',
      requestId: '',
    })
  }
  return {
    orderId,
    bookingRef: json.data?.booking_reference ?? orderId,
    amount: fresh.totalAmount,
    currency: fresh.totalCurrency,
  }
}

export function getProviderStatus(): { duffel: 'ok' | 'missing_key' | 'error'; mode: DuffelMode } {
  const key = getDuffelApiKey()
  if (!key) return { duffel: 'missing_key', mode: 'unknown' }
  const mode = duffelModeFromToken(key)
  if (mode === 'unknown') return { duffel: 'error', mode }
  return { duffel: 'ok', mode }
}
