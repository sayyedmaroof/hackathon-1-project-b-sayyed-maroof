import { matchAirport } from './airports.ts'
import { defaultProviders } from './data.ts'
import { addDays, formatDayChip, isIsoDate } from './dates.ts'
import { calculateSavings } from './savings.ts'
import type { Cabin, DepartureWindow, FlightFilters, FlightOption, FlexibleDay, SearchErrors, SearchQuery } from './types.ts'

export const CASH_FILTER_MAX = 5000
export const POINTS_FILTER_MAX = 200_000

export const defaultFilters: FlightFilters = {
  maxCash: CASH_FILTER_MAX,
  maxPoints: POINTS_FILTER_MAX,
  airlines: [],
  airlineSelection: false,
  stops: 'any',
  departureWindow: 'any',
}

/** Day-of-epoch bucket in −3…+3. Same date always shifts prices the same way. */
export function priceStep(iso: string): number {
  const day = Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000)
  return ((day % 7) + 7) % 7 - 3
}

function shiftFlight(flight: FlightOption, iso: string): FlightOption {
  const step = priceStep(iso)
  return {
    ...flight,
    id: `${flight.id}-${iso}`,
    cash: Math.max(50, flight.cash + step * 40),
    fees: Math.max(15, flight.fees + step * 10),
    points: Math.max(1000, flight.points + step * 2000),
  }
}

export function validateSearch(search: SearchQuery): SearchErrors {
  const errors: SearchErrors = {}
  const origin = matchAirport(search.origin)
  const destination = matchAirport(search.destination)

  if (!search.origin.trim()) errors.origin = 'Enter an origin airport.'
  else if (!origin) errors.origin = 'Enter a known airport code or city.'

  if (!search.destination.trim()) errors.destination = 'Enter a destination airport.'
  else if (!destination) errors.destination = 'Enter a known airport code or city.'
  else if (origin && origin.code === destination.code) errors.destination = 'Choose a different destination.'

  if (!isIsoDate(search.depart)) errors.depart = 'Enter a departure date.'
  if (!isIsoDate(search.returnDate)) errors.returnDate = 'Enter a return date.'
  else if (isIsoDate(search.depart) && search.returnDate < search.depart) {
    errors.returnDate = 'Return date must be on or after departure.'
  }

  return errors
}

export function searchFlights(search: SearchQuery, cabin: Cabin = search.cabin): FlightOption[] {
  const origin = matchAirport(search.origin)
  const destination = matchAirport(search.destination)
  if (!origin || !destination || origin.code === destination.code) return []

  const input = { from: origin.code, to: destination.code, cabin }
  const matched =
    search.mode === 'Cash fares'
      ? defaultProviders.flight.search(input)
      : search.mode === 'Points options'
        ? defaultProviders.award.search(input)
        : defaultProviders.flight.search(input)
  if (!isIsoDate(search.depart)) return matched
  return matched.map((flight) => shiftFlight(flight, search.depart))
}

function bestNetSaving(flights: FlightOption[]): number | null {
  if (flights.length === 0) return null
  return Math.max(...flights.map((flight) => calculateSavings(flight).netSaving))
}

export function flexibleDays(search: SearchQuery, cabin: Cabin = search.cabin): FlexibleDay[] {
  if (!isIsoDate(search.depart)) return []
  const selectedNet = bestNetSaving(searchFlights(search, cabin)) ?? 0
  return Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3
    const date = addDays(search.depart, offset)
    const net = bestNetSaving(searchFlights({ ...search, depart: date }, cabin))
    return {
      date,
      label: formatDayChip(date),
      delta: Math.round((net ?? selectedNet) - selectedNet),
    }
  })
}

function hourOf(time: string): number {
  const hour = Number(time.split(':')[0])
  return Number.isFinite(hour) ? hour : 0
}

function inWindow(time: string, window: DepartureWindow): boolean {
  if (window === 'any') return true
  const hour = hourOf(time)
  if (window === 'morning') return hour < 12
  if (window === 'afternoon') return hour >= 12 && hour < 17
  return hour >= 17
}

export function applyFilters(flights: FlightOption[], filters: FlightFilters): FlightOption[] {
  return flights.filter((flight) => {
    if (flight.cash > filters.maxCash) return false
    if (flight.points > filters.maxPoints) return false
    if (filters.airlineSelection && !filters.airlines.includes(flight.airline)) return false
    if (filters.stops === 'nonstop' && flight.stops !== 'Nonstop') return false
    if (filters.stops === '1' && !flight.stops.startsWith('1 stop')) return false
    return inWindow(flight.departTime, filters.departureWindow)
  })
}

export function activeFilterCount(filters: FlightFilters): number {
  let count = 0
  if (filters.maxCash !== defaultFilters.maxCash) count += 1
  if (filters.maxPoints !== defaultFilters.maxPoints) count += 1
  if (filters.airlineSelection) count += 1
  if (filters.stops !== defaultFilters.stops) count += 1
  if (filters.departureWindow !== defaultFilters.departureWindow) count += 1
  return count
}
