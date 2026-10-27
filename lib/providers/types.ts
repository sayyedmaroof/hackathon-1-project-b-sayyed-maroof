import type { Cabin } from '@/lib/types'

export type ProviderSearchQuery = {
  origin: string
  destination: string
  departDate: string
  returnDate: string
  cabin: Cabin
  adults: number
}

export type OfferKind = 'cash' | 'award' | 'flexible_dates' | 'nearby_airport'

export type FlightOffer = {
  id: string
  kind: OfferKind
  source: 'duffel' | 'award_sample'
  airline: string
  airlineCode: string
  origin: string
  destination: string
  departTime: string
  arriveTime: string
  duration: string
  stops: string
  cabin: Cabin
  cashPrice: number
  points: number
  fees: number
  tone: string
  whyThisWorks: string
  isSampleAward: boolean
  duffelOfferId?: string
  searchOrigin?: string
  searchDestination?: string
  departDate?: string
  returnDate?: string
}

export interface FlightProvider {
  search(query: ProviderSearchQuery): Promise<FlightOffer[]>
}

export interface AwardProvider {
  search(query: ProviderSearchQuery): Promise<FlightOffer[]>
}

export type SearchFlightsResult = {
  normalPrice: number
  best: FlightOffer | null
  savings: { amount: number; pct: number }
  alternatives: FlightOffer[]
  error?: string
}
