/** Barrel re-exports for sample travel data and provider boundaries. */

export { destinations } from './data/destinations.ts'
export { sampleFlights } from './data/sample-routes.ts'
export {
  defaultProviders,
  sampleAwardProvider,
  sampleFlightProvider,
  type AwardProvider,
  type FlightProvider,
  type ProviderSearchInput,
} from './data/providers.ts'
export {
  cabinLabel,
  flightToTrip,
  placeName,
  travelerLabel,
} from './data/helpers.ts'
export {
  cabins,
  defaultAlerts,
  defaultPrograms,
  defaultSearch,
  johannesburgSearch,
  modes,
  sampleTrip,
  searchExamples,
  travelers,
} from './data/catalog.ts'
