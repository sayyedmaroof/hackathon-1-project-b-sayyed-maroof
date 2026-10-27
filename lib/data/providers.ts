import type { Cabin, FlightOption } from '../types.ts'
import { sampleFlights } from './sample-routes.ts'

export type ProviderSearchInput = {
  from: string
  to: string
  cabin: Cabin
}

export interface FlightProvider {
  search(input: ProviderSearchInput): FlightOption[]
}

export interface AwardProvider {
  search(input: ProviderSearchInput): FlightOption[]
}

function matchRoute(input: ProviderSearchInput): FlightOption[] {
  return sampleFlights.filter(
    (flight) => flight.from === input.from && flight.to === input.to && flight.cabin === input.cabin,
  )
}

/** Sample cash-side provider (same rows; cash fares are authoritative in the prototype). */
export const sampleFlightProvider: FlightProvider = {
  search: matchRoute,
}

/** Sample award provider (points + fees on the same matched rows). */
export const sampleAwardProvider: AwardProvider = {
  search: matchRoute,
}

export const defaultProviders = {
  flight: sampleFlightProvider,
  award: sampleAwardProvider,
}
