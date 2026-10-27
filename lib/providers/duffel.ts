import { cabinToDuffel } from './cabin-map'
import { duffelFetch } from './duffel-client'
import { mapDuffelOffers } from './duffel-map'
import type { FlightProvider, FlightOffer, ProviderSearchQuery } from './types'

type OfferRequestResponse = {
  data: { offers?: unknown[] }
}

function passengers(adults: number) {
  return Array.from({ length: Math.max(1, adults) }, () => ({ type: 'adult' as const }))
}

function slices(query: ProviderSearchQuery) {
  return [
    { origin: query.origin, destination: query.destination, departure_date: query.departDate },
    { origin: query.destination, destination: query.origin, departure_date: query.returnDate },
  ]
}

export async function searchDuffelCash(query: ProviderSearchQuery): Promise<FlightOffer[]> {
  const body = {
    data: {
      cabin_class: cabinToDuffel(query.cabin),
      passengers: passengers(query.adults),
      slices: slices(query),
    },
  }
  const json = await duffelFetch<OfferRequestResponse>(
    '/air/offer_requests?return_offers=true&supplier_timeout=15000',
    { method: 'POST', body: JSON.stringify(body) },
  )
  const offers = (json.data.offers ?? []) as Parameters<typeof mapDuffelOffers>[0]
  return mapDuffelOffers(offers, query, {
    kind: 'cash',
    why: 'Lowest published cash fare from airlines via Duffel test search.',
  }).slice(0, 25)
}

export const duffelFlightProvider: FlightProvider = {
  search: searchDuffelCash,
}

type OrderResponse = { data: { id: string; booking_reference?: string } }

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

type OfferResponse = { data: { total_amount: string; total_currency: string } }

export async function createDuffelOrder(input: CreateOrderInput): Promise<{ orderId: string; bookingRef: string }> {
  const offer = await duffelFetch<OfferResponse>(`/air/offers/${input.offerId}`)
  const body = {
    data: {
      selected_offers: [input.offerId],
      passengers: input.passengers.map((p) => ({
        given_name: p.givenName,
        family_name: p.familyName,
        email: p.email,
        phone_number: p.phone,
        born_on: p.bornOn,
        gender: p.gender,
        title: p.gender === 'm' ? 'mr' : 'ms',
      })),
      type: 'instant',
      payments: [
        {
          type: 'balance',
          currency: offer.data.total_currency,
          amount: offer.data.total_amount,
        },
      ],
    },
  }
  const json = await duffelFetch<OrderResponse>('/air/orders', { method: 'POST', body: JSON.stringify(body) })
  return {
    orderId: json.data.id,
    bookingRef: json.data.booking_reference ?? json.data.id,
  }
}
