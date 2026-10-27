import type { Cabin } from '@/lib/types'

export type ProviderSearchQuery = {
  origin: string
  destination: string
  departDate: string
  returnDate?: string
  cabin: Cabin
  adults: number
}

export type OfferKind = 'cash' | 'award' | 'flexible_dates' | 'nearby_airport'

export type DataMode = 'test' | 'live' | 'sample' | 'unknown'

export type DuffelMode = 'test' | 'live' | 'unknown'

export type OfferSegment = {
  origin?: string
  destination?: string
  departingAt?: string
  arrivingAt?: string
  duration?: string
  marketingCarrier?: string
  flightNumber?: string
  aircraft?: string
}

export type OfferSlice = {
  origin?: string
  destination?: string
  duration?: string
  segments: OfferSegment[]
}

export type FlightOffer = {
  id: string
  kind: OfferKind
  source: 'duffel' | 'award_sample' | 'sample_cash'
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
  expiresAt?: string
  currency?: string
  dataMode?: DataMode
  totalAmountRaw?: string
  baseAmount?: number
  taxAmount?: number
  passengerIds?: string[]
  slices?: OfferSlice[]
  changeable?: boolean
  refundable?: boolean
  baggage?: string
}

export interface FlightProvider {
  search(query: ProviderSearchQuery): Promise<FlightOffer[]>
}

export interface AwardProvider {
  search(query: ProviderSearchQuery): Promise<FlightOffer[]>
}

export interface CashBaselineProvider {
  search(query: ProviderSearchQuery): Promise<FlightOffer[]>
}

export type SearchFlightsResult = {
  normalPrice: number
  best: FlightOffer | null
  savings: { amount: number; pct: number }
  alternatives: FlightOffer[]
  error?: string
  warning?: string
  dataMode: DataMode
  displayCurrency: string
}

export function isSandboxMode(mode?: DataMode): boolean {
  return mode === 'test' || mode === 'sample'
}
